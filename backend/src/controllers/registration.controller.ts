import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { createBibNumber } from "../services/bib.service.js";
import {
  createCertificateNumber,
  createCertificateQrPayload,
} from "../services/certificate.service.js";
import { ensureDefaultEvents, isRegistrationOpen } from "../services/event.service.js";
import { upsertUserFromClerk } from "../services/user.service.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { validateBody } from "../utils/validate.js";
import {
  createRegistrationSchema,
  reviewProofSchema,
  submitProofSchema,
} from "../validators/registration.validator.js";

export async function createRegistration(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(createRegistrationSchema, request);
  await ensureDefaultEvents();

  let event = payload.eventId
    ? await prisma.event.findUnique({ where: { id: payload.eventId } })
    : await prisma.event.findUnique({ where: { slug: payload.eventSlug } });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (!isRegistrationOpen(event)) {
    throw new ApiError(
      422,
      event.status === "COMPLETED" || event.endsAt.getTime() < Date.now()
        ? "This event has already ended. Registration is closed."
        : "Registration is not open for this event.",
    );
  }

  if (!event.distances.includes(payload.distance)) {
    throw new ApiError(422, "Selected distance is not available for this event");
  }

  const availableTypes = event.activityTypes.length > 0 ? event.activityTypes : ["running"];
  const selectedType = payload.activityType ?? "running";
  if (!availableTypes.includes(selectedType)) {
    throw new ApiError(422, "Selected activity type is not available for this event");
  }

  if (event.maxCapacity != null) {
    const filled = await prisma.registration.count({
      where: {
        eventId: event.id,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED"] },
      },
    });
    if (filled >= event.maxCapacity) {
      throw new ApiError(422, "This event is full. Registration is closed.");
    }
  }

  const clerkId = payload.clerkId ?? request.auth?.userId;
  const email = payload.email?.toLowerCase();

  let user = null;

  if (clerkId) {
    user = await upsertUserFromClerk({
      clerkId,
      email,
      name: payload.name ?? payload.shippingName,
      phone: payload.phone ?? payload.shippingPhone,
      username: payload.username,
    });
  } else if (payload.userId) {
    user = await prisma.user.findUnique({ where: { id: payload.userId } });
  } else if (email) {
    user = await prisma.user.upsert({
      where: { email },
      create: {
        name: payload.name ?? payload.shippingName,
        email,
        phone: payload.phone ?? payload.shippingPhone,
        username: payload.username,
      },
      update: {
        name: payload.name ?? payload.shippingName,
        phone: payload.phone ?? payload.shippingPhone,
        username: payload.username,
      },
    });
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Unique key is (userId + eventId + distance) — other events/distances are always allowed.
  const existingRegistration = await prisma.registration.findUnique({
    where: {
      userId_eventId_distance: {
        userId: user.id,
        eventId: event.id,
        distance: payload.distance,
      },
    },
    include: { event: true, user: true, payment: true },
  });

  if (existingRegistration) {
    // Resume unpaid checkout for the exact same event + distance only.
    if (
      existingRegistration.status === "PENDING_PAYMENT" ||
      existingRegistration.payment?.status === "CREATED"
    ) {
      response.status(200).json({
        data: existingRegistration,
        meta: {
          freeEntry: false,
          resumed: true,
          message: `Resuming payment for ${event.title} (${payload.distance}).`,
        },
      });
      return;
    }

    throw new ApiError(
      409,
      `You are already registered for ${payload.distance} in “${event.title}”. Pick another distance or a different event.`,
    );
  }

  const freeEntry = !event.paymentRequired || event.priceInPaise <= 0;

  let registration;
  try {
    registration = await prisma.registration.create({
      data: {
        userId: user.id,
        eventId: event.id,
        distance: payload.distance,
        activityType: selectedType,
        status: freeEntry ? "CONFIRMED" : "PENDING_PAYMENT",
        shippingName: (payload.name || payload.shippingName).trim(),
        shippingPhone: (payload.phone || payload.shippingPhone).trim(),
        shippingLine1: payload.shippingLine1,
        shippingLine2: payload.shippingLine2,
        shippingCity: payload.shippingCity,
        shippingState: payload.shippingState,
        shippingPincode: payload.shippingPincode,
        bibNumber: payload.bibNumber || createBibNumber(event.slug),
      },
      include: {
        event: true,
        user: true,
        payment: true,
      },
    });
  } catch (error) {
    // Race / unique collision → re-read and resume if pending
    const raced = await prisma.registration.findUnique({
      where: {
        userId_eventId_distance: {
          userId: user.id,
          eventId: event.id,
          distance: payload.distance,
        },
      },
      include: { event: true, user: true, payment: true },
    });
    if (raced && (raced.status === "PENDING_PAYMENT" || raced.payment?.status === "CREATED")) {
      response.status(200).json({
        data: raced,
        meta: { freeEntry: false, resumed: true },
      });
      return;
    }
    if (raced) {
      throw new ApiError(
        409,
        `You are already registered for ${payload.distance} in “${event.title}”.`,
      );
    }
    throw error;
  }

  // Apply referral code if provided
  if (payload.referralCode && user.clerkId) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: payload.referralCode.toUpperCase() } });
    if (referrer && referrer.id !== user.id) {
      const existingRef = await prisma.referral.findUnique({ where: { refereeId: user.id } });
      if (!existingRef) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: user.id,
            code: payload.referralCode.toUpperCase(),
            status: freeEntry ? "converted" : "pending",
          },
        });
      }
    }
  }

  response.status(201).json({ data: registration, meta: { freeEntry } });
}

export async function submitProof(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(submitProofSchema, request);
  const registrationId = routeParam(request, "id");

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: true,
      payment: true,
      proofUpload: true,
      event: true,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Registration not found");
  }

  // Ownership: signed-in Clerk user must own this registration (when Clerk is on).
  const clerkId = request.auth?.userId;
  if (clerkId && existing.user.clerkId && existing.user.clerkId !== clerkId) {
    throw new ApiError(403, "You can only submit proof for your own registration");
  }

  const isPaid =
    existing.status === "CONFIRMED" ||
    existing.status === "COMPLETED" ||
    existing.payment?.status === "PAID" ||
    !existing.event.paymentRequired ||
    existing.event.priceInPaise <= 0;

  if (!isPaid) {
    throw new ApiError(422, "Complete payment before uploading GPS proof");
  }

  if (existing.proofStatus === "APPROVED") {
    throw new ApiError(409, "Proof already approved. Contact support to re-submit.");
  }

  if (existing.proofStatus === "SUBMITTED") {
    throw new ApiError(
      409,
      "Proof already submitted and waiting for review. You can re-upload only after rejection.",
    );
  }

  let finalActivityImageUrl = payload.activityImageUrl || "";
  if (payload.activityImageUrls && payload.activityImageUrls.length > 0) {
    finalActivityImageUrl =
      payload.activityImageUrls.length === 1
        ? payload.activityImageUrls[0]
        : JSON.stringify(payload.activityImageUrls);
  }

  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      proofStatus: "SUBMITTED",
      finishTimeSeconds: payload.finishTimeSeconds ?? existing.finishTimeSeconds,
      proofUpload: {
        upsert: {
          create: {
            activityImageUrl: finalActivityImageUrl,
            sourceApp: payload.sourceApp,
            status: "SUBMITTED",
          },
          update: {
            activityImageUrl: finalActivityImageUrl,
            sourceApp: payload.sourceApp,
            submittedAt: new Date(),
            status: "SUBMITTED",
            reviewerNote: null,
            reviewedAt: null,
          },
        },
      },
    },
    include: { proofUpload: true, event: true },
  });

  response.json({
    data: registration,
    meta: {
      message: "Proof submitted. Our team will review it for leaderboard and certificate.",
    },
  });
}

export async function reviewProof(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(reviewProofSchema, request);
  const registrationId = routeParam(request, "id");
  const status = payload.approved ? "APPROVED" : "REJECTED";

  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      proofStatus: status,
      finishTimeSeconds: payload.finishTimeSeconds,
      proofUpload: {
        update: {
          status,
          reviewerNote: payload.reviewerNote,
          reviewedAt: new Date(),
        },
      },
    },
  });

  if (payload.approved) {
    const certificateNumber = createCertificateNumber(registration.bibNumber);
    await prisma.certificate.upsert({
      where: { registrationId },
      create: {
        registrationId,
        certificateNumber,
        qrPayload: createCertificateQrPayload(certificateNumber),
        status: "QUEUED",
      },
      update: {
        status: "QUEUED",
      },
    });

    await prisma.medalDelivery.upsert({
      where: { registrationId },
      create: { registrationId, status: "PENDING" },
      update: { status: "PENDING" },
    });
  }

  response.json({ data: registration });
}

const INDIAN_RUNNERS_MASTER_POOL = [
  // 1.5K / 1.6K Partition (Index 0 - 49)
  { name: "Aarav Sharma", city: "Bengaluru", state: "Karnataka" },
  { name: "Nisha Rawat", city: "Dehradun", state: "Uttarakhand" },
  { name: "Kabir Sethi", city: "Delhi NCR", state: "Delhi" },
  { name: "Meera Joshi", city: "Pune", state: "Maharashtra" },
  { name: "Rohan Kapoor", city: "Chandigarh", state: "Punjab" },
  { name: "Ananya Iyer", city: "Chennai", state: "Tamil Nadu" },
  { name: "Dev Malhotra", city: "Mumbai", state: "Maharashtra" },
  { name: "Isha Verma", city: "Jaipur", state: "Rajasthan" },
  { name: "Vikramaditya Rao", city: "Hyderabad", state: "Telangana" },
  { name: "Simran Kaur", city: "Amritsar", state: "Punjab" },
  { name: "Tanmay Deshmukh", city: "Nagpur", state: "Maharashtra" },
  { name: "Sneha Kulkarni", city: "Pune", state: "Maharashtra" },
  { name: "Aditya Banerjee", city: "Kolkata", state: "West Bengal" },
  { name: "Pooja Choudhary", city: "Jaipur", state: "Rajasthan" },
  { name: "Raghav Varma", city: "Lucknow", state: "Uttar Pradesh" },
  { name: "Ritu Patel", city: "Ahmedabad", state: "Gujarat" },
  { name: "Siddharth Nair", city: "Kochi", state: "Kerala" },
  { name: "Neha Chawla", city: "Gurgaon", state: "Haryana" },
  { name: "Karan Oberoi", city: "Noida", state: "Uttar Pradesh" },
  { name: "Aayushi Gupta", city: "Indore", state: "Madhya Pradesh" },
  { name: "Harshvardhan Reddy", city: "Hyderabad", state: "Telangana" },
  { name: "Deepa Subramanian", city: "Bengaluru", state: "Karnataka" },
  { name: "Alok Srivastava", city: "Varanasi", state: "Uttar Pradesh" },
  { name: "Kriti Saxena", city: "Bhopal", state: "Madhya Pradesh" },
  { name: "Manish Joshi", city: "Shimla", state: "Himachal Pradesh" },
  { name: "Swati Hegde", city: "Mangaluru", state: "Karnataka" },
  { name: "Gaurav Tiwari", city: "Kanpur", state: "Uttar Pradesh" },
  { name: "Shreya Sen", city: "Kolkata", state: "West Bengal" },
  { name: "Tarun Bhatia", city: "Delhi NCR", state: "Delhi" },
  { name: "Divya Menon", city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Rahul Pillai", city: "Coimbatore", state: "Tamil Nadu" },
  { name: "Namrata Shinde", city: "Mumbai", state: "Maharashtra" },
  { name: "Abhinav Jha", city: "Patna", state: "Bihar" },
  { name: "Priyanka Das", city: "Guwahati", state: "Assam" },
  { name: "Sameer Kulkarni", city: "Nashik", state: "Maharashtra" },
  { name: "Kavita Bisht", city: "Nainital", state: "Uttarakhand" },
  { name: "Prateek Mehra", city: "Faridabad", state: "Haryana" },
  { name: "Varun Kaushik", city: "Ghaziabad", state: "Uttar Pradesh" },
  { name: "Ankita Roy", city: "Ranchi", state: "Jharkhand" },
  { name: "Naveen Choudhury", city: "Bhubaneswar", state: "Odisha" },
  { name: "Dhruv Singhal", city: "Agra", state: "Uttar Pradesh" },
  { name: "Pallavi Nambiar", city: "Thrissur", state: "Kerala" },
  { name: "Kunal Goswami", city: "Jalandhar", state: "Punjab" },
  { name: "Ritika Mathur", city: "Udaipur", state: "Rajasthan" },
  { name: "Suraj Rathore", city: "Jodhpur", state: "Rajasthan" },
  { name: "Anindita Bose", city: "Howrah", state: "West Bengal" },
  { name: "Yashwant Patil", city: "Kolhapur", state: "Maharashtra" },
  { name: "Bhavna Bhatt", city: "Vadodara", state: "Gujarat" },
  { name: "Tushar Agnihotri", city: "Prayagraj", state: "Uttar Pradesh" },
  { name: "Monika Sandhu", city: "Ludhiana", state: "Punjab" },

  // 3K / 3.2K Partition (Index 50 - 99)
  { name: "Kavita Nair", city: "Kozhikode", state: "Kerala" },
  { name: "Sahil Verma", city: "Jammu", state: "Jammu & Kashmir" },
  { name: "Divya Iyer", city: "Madurai", state: "Tamil Nadu" },
  { name: "Rajat Chauhan", city: "Meerut", state: "Uttar Pradesh" },
  { name: "Harini Sundaram", city: "Tiruchirappalli", state: "Tamil Nadu" },
  { name: "Ayush Saxena", city: "Bareilly", state: "Uttar Pradesh" },
  { name: "Garima Pandey", city: "Gorakhpur", state: "Uttar Pradesh" },
  { name: "Pranav Deshpande", city: "Aurangabad", state: "Maharashtra" },
  { name: "Smriti Mukherjee", city: "Durgapur", state: "West Bengal" },
  { name: "Akhil Varghese", city: "Kollam", state: "Kerala" },
  { name: "Charu Mittal", city: "Rohtak", state: "Haryana" },
  { name: "Gautam Shenoy", city: "Udupi", state: "Karnataka" },
  { name: "Shikha Rastogi", city: "Moradabad", state: "Uttar Pradesh" },
  { name: "Jaspreet Gill", city: "Patiala", state: "Punjab" },
  { name: "Tejaswini Sawant", city: "Solapur", state: "Maharashtra" },
  { name: "Kushagra Jain", city: "Kota", state: "Rajasthan" },
  { name: "Preeti Mahajan", city: "Pathankot", state: "Punjab" },
  { name: "Bikramjit Dutta", city: "Siliguri", state: "West Bengal" },
  { name: "Radhika Somani", city: "Bhilwara", state: "Rajasthan" },
  { name: "Mayank Trivedi", city: "Rajkot", state: "Gujarat" },
  { name: "Meenakshi Pillai", city: "Alappuzha", state: "Kerala" },
  { name: "Girish Kulkarni", city: "Belagavi", state: "Karnataka" },
  { name: "Sangeeta Mohanty", city: "Cuttack", state: "Odisha" },
  { name: "Abhishek Poddar", city: "Jamshedpur", state: "Jharkhand" },
  { name: "Chitra Vaidya", city: "Thane", state: "Maharashtra" },
  { name: "Deepak Bhardwaj", city: "Karnal", state: "Haryana" },
  { name: "Lipika Hazarika", city: "Dibrugarh", state: "Assam" },
  { name: "Nitin Bhalerao", city: "Amravati", state: "Maharashtra" },
  { name: "Renuka Acharya", city: "Mysuru", state: "Karnataka" },
  { name: "Sourabh Ghosh", city: "Asansol", state: "West Bengal" },
  { name: "Damini Sharma", city: "Ajmer", state: "Rajasthan" },
  { name: "Karthik Ranganathan", city: "Salem", state: "Tamil Nadu" },
  { name: "Lavanya Reddy", city: "Warangal", state: "Telangana" },
  { name: "Pawan Kalyan", city: "Guntur", state: "Andhra Pradesh" },
  { name: "Hemant Sahu", city: "Raipur", state: "Chhattisgarh" },
  { name: "Komal Sonawane", city: "Jalgaon", state: "Maharashtra" },
  { name: "Baljeet Sidhu", city: "Bathinda", state: "Punjab" },
  { name: "Payal Kashyap", city: "Haridwar", state: "Uttarakhand" },
  { name: "Rishabh Shukla", city: "Jhansi", state: "Uttar Pradesh" },
  { name: "Sunil Marandi", city: "Dhanbad", state: "Jharkhand" },
  { name: "Madhuri Ganguly", city: "Burdwan", state: "West Bengal" },
  { name: "Vikas Bishnoi", city: "Bikaner", state: "Rajasthan" },
  { name: "Jahnvi Sheth", city: "Surat", state: "Gujarat" },
  { name: "Pankaj Bora", city: "Tezpur", state: "Assam" },
  { name: "Archana Hegde", city: "Hubballi", state: "Karnataka" },
  { name: "Niraj Sengupta", city: "Kharagpur", state: "West Bengal" },
  { name: "Mamta Sisodia", city: "Ujjain", state: "Madhya Pradesh" },
  { name: "Shashank Tripathi", city: "Faizabad", state: "Uttar Pradesh" },
  { name: "Kalyani Swaminathan", city: "Tirunelveli", state: "Tamil Nadu" },
  { name: "Rajat Manhas", city: "Srinagar", state: "Jammu & Kashmir" },

  // 5K Partition (Index 100 - 149)
  { name: "Tanmay Kulkarni", city: "Pune", state: "Maharashtra" },
  { name: "Simran Bhatia", city: "Delhi NCR", state: "Delhi" },
  { name: "Raghav Reddy", city: "Hyderabad", state: "Telangana" },
  { name: "Nandini Bhattacharya", city: "Kolkata", state: "West Bengal" },
  { name: "Suresh Pillai", city: "Bengaluru", state: "Karnataka" },
  { name: "Kavya Menon", city: "Kochi", state: "Kerala" },
  { name: "Abhayraj Chauhan", city: "Jaipur", state: "Rajasthan" },
  { name: "Monika Deshmukh", city: "Mumbai", state: "Maharashtra" },
  { name: "Rishi Chawla", city: "Gurgaon", state: "Haryana" },
  { name: "Shilpa Sundaram", city: "Chennai", state: "Tamil Nadu" },
  { name: "Harpreet Grewal", city: "Chandigarh", state: "Punjab" },
  { name: "Udit Singhal", city: "Lucknow", state: "Uttar Pradesh" },
  { name: "Ananya Mahajan", city: "Indore", state: "Madhya Pradesh" },
  { name: "Vinay Thampi", city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Bhumika Sethi", city: "Ahmedabad", state: "Gujarat" },
  { name: "Chirag Joshi", city: "Nagpur", state: "Maharashtra" },
  { name: "Divyanshi Rawat", city: "Dehradun", state: "Uttarakhand" },
  { name: "Pranav Shenoy", city: "Mangaluru", state: "Karnataka" },
  { name: "Megha Kashyap", city: "Noida", state: "Uttar Pradesh" },
  { name: "Siddhesh Tawde", city: "Thane", state: "Maharashtra" },
  { name: "Alankrita Sen", city: "Siliguri", state: "West Bengal" },
  { name: "Dharmendra Rathore", city: "Jodhpur", state: "Rajasthan" },
  { name: "Pooja Varghese", city: "Thrissur", state: "Kerala" },
  { name: "Kailash Bishnoi", city: "Bikaner", state: "Rajasthan" },
  { name: "Jaya Subramanian", city: "Coimbatore", state: "Tamil Nadu" },
  { name: "Gaurang Patel", city: "Vadodara", state: "Gujarat" },
  { name: "Tanvi Saxena", city: "Bhopal", state: "Madhya Pradesh" },
  { name: "Lalit Mohan", city: "Haridwar", state: "Uttarakhand" },
  { name: "Sumanth Shetty", city: "Udupi", state: "Karnataka" },
  { name: "Rashmi Agrawal", city: "Raipur", state: "Chhattisgarh" },
  { name: "Himanshu Mathur", city: "Kota", state: "Rajasthan" },
  { name: "Parul Sandhu", city: "Ludhiana", state: "Punjab" },
  { name: "Sujit Mukherjee", city: "Asansol", state: "West Bengal" },
  { name: "Kiranmai Naidu", city: "Visakhapatnam", state: "Andhra Pradesh" },
  { name: "Taranjit Deol", city: "Jalandhar", state: "Punjab" },
  { name: "Anushree Shukla", city: "Varanasi", state: "Uttar Pradesh" },
  { name: "Mohit Ranawat", city: "Udaipur", state: "Rajasthan" },
  { name: "Sushmita Roy", city: "Ranchi", state: "Jharkhand" },
  { name: "Balram Tripathi", city: "Kanpur", state: "Uttar Pradesh" },
  { name: "Gita Namboodiri", city: "Kollam", state: "Kerala" },
  { name: "Virendra Yadav", city: "Patna", state: "Bihar" },
  { name: "Jyotsna Acharya", city: "Mysuru", state: "Karnataka" },
  { name: "Rohit Gadkari", city: "Nashik", state: "Maharashtra" },
  { name: "Barkha Goswami", city: "Agra", state: "Uttar Pradesh" },
  { name: "Manvendra Chauhan", city: "Gwalior", state: "Madhya Pradesh" },
  { name: "Iravati Somani", city: "Surat", state: "Gujarat" },
  { name: "Debashish Das", city: "Bhubaneswar", state: "Odisha" },
  { name: "Harsha Vardhan", city: "Vijayawada", state: "Andhra Pradesh" },
  { name: "Nalini Hegde", city: "Hubballi", state: "Karnataka" },
  { name: "Samarjit Singha", city: "Guwahati", state: "Assam" },

  // 7K Partition (Index 150 - 199)
  { name: "Sneha Banerjee", city: "Kolkata", state: "West Bengal" },
  { name: "Rohan Joshi", city: "Pune", state: "Maharashtra" },
  { name: "Pooja Deshmukh", city: "Nagpur", state: "Maharashtra" },
  { name: "Vikram Singhania", city: "Mumbai", state: "Maharashtra" },
  { name: "Ananya Poddar", city: "Jamshedpur", state: "Jharkhand" },
  { name: "Siddharth Chawla", city: "Delhi NCR", state: "Delhi" },
  { name: "Kavita Rangan", city: "Chennai", state: "Tamil Nadu" },
  { name: "Harshvardhan Sahu", city: "Raipur", state: "Chhattisgarh" },
  { name: "Simranjit Gill", city: "Amritsar", state: "Punjab" },
  { name: "Naveen Thampi", city: "Kochi", state: "Kerala" },
  { name: "Alokita Sharma", city: "Jaipur", state: "Rajasthan" },
  { name: "Prateek Deshpande", city: "Aurangabad", state: "Maharashtra" },
  { name: "Divya Nambiar", city: "Kozhikode", state: "Kerala" },
  { name: "Mayank Bhardwaj", city: "Chandigarh", state: "Punjab" },
  { name: "Ritika Shenoy", city: "Mangaluru", state: "Karnataka" },
  { name: "Gaurav Rastogi", city: "Meerut", state: "Uttar Pradesh" },
  { name: "Deepa Acharya", city: "Bengaluru", state: "Karnataka" },
  { name: "Tarun Bishnoi", city: "Jodhpur", state: "Rajasthan" },
  { name: "Namrata Dutta", city: "Siliguri", state: "West Bengal" },
  { name: "Ayush Kulkarni", city: "Nashik", state: "Maharashtra" },
  { name: "Smriti Rawat", city: "Nainital", state: "Uttarakhand" },
  { name: "Abhishek Saxena", city: "Bareilly", state: "Uttar Pradesh" },
  { name: "Charu Sundaram", city: "Madurai", state: "Tamil Nadu" },
  { name: "Nitin Rathore", city: "Bikaner", state: "Rajasthan" },
  { name: "Sangeeta Menon", city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Kunal Agnihotri", city: "Prayagraj", state: "Uttar Pradesh" },
  { name: "Bhavna Sandhu", city: "Patiala", state: "Punjab" },
  { name: "Rahul Mukherjee", city: "Durgapur", state: "West Bengal" },
  { name: "Swati Vaidya", city: "Thane", state: "Maharashtra" },
  { name: "Dhruv Sisodia", city: "Ujjain", state: "Madhya Pradesh" },
  { name: "Meera Hazarika", city: "Guwahati", state: "Assam" },
  { name: "Karan Sheth", city: "Ahmedabad", state: "Gujarat" },
  { name: "Pallavi Shukla", city: "Varanasi", state: "Uttar Pradesh" },
  { name: "Shashank Reddy", city: "Hyderabad", state: "Telangana" },
  { name: "Jahnvi Iyer", city: "Tiruchirappalli", state: "Tamil Nadu" },
  { name: "Tushar Somani", city: "Surat", state: "Gujarat" },
  { name: "Monika Pillai", city: "Coimbatore", state: "Tamil Nadu" },
  { name: "Balram Tripathi", city: "Gorakhpur", state: "Uttar Pradesh" },
  { name: "Lipika Mohanty", city: "Bhubaneswar", state: "Odisha" },
  { name: "Sourabh Sengupta", city: "Kharagpur", state: "West Bengal" },
  { name: "Preeti Mahajan", city: "Jammu", state: "Jammu & Kashmir" },
  { name: "Hemant Sonawane", city: "Jalgaon", state: "Maharashtra" },
  { name: "Damini Bhatt", city: "Vadodara", state: "Gujarat" },
  { name: "Gautam Deol", city: "Bathinda", state: "Punjab" },
  { name: "Radhika Shukla", city: "Jhansi", state: "Uttar Pradesh" },
  { name: "Pawan Marandi", city: "Dhanbad", state: "Jharkhand" },
  { name: "Madhuri Roy", city: "Ranchi", state: "Jharkhand" },
  { name: "Vikas Yadav", city: "Patna", state: "Bihar" },
  { name: "Archana Hegde", city: "Belagavi", state: "Karnataka" },
  { name: "Niraj Goswami", city: "Kota", state: "Rajasthan" },

  // 10K Partition (Index 200 - 249)
  { name: "Manish Agarwal", city: "Delhi NCR", state: "Delhi" },
  { name: "Shreya Pillai", city: "Bengaluru", state: "Karnataka" },
  { name: "Abhinav Sinha", city: "Patna", state: "Bihar" },
  { name: "Kriti Saxena", city: "Bhopal", state: "Madhya Pradesh" },
  { name: "Alok Tiwari", city: "Kanpur", state: "Uttar Pradesh" },
  { name: "Siddharth Nambiar", city: "Kochi", state: "Kerala" },
  { name: "Neha Choudhury", city: "Cuttack", state: "Odisha" },
  { name: "Gaurav Kapoor", city: "Chandigarh", state: "Punjab" },
  { name: "Priyanka Shenoy", city: "Mangaluru", state: "Karnataka" },
  { name: "Sameer Tawde", city: "Mumbai", state: "Maharashtra" },
  { name: "Kavita Joshi", city: "Shimla", state: "Himachal Pradesh" },
  { name: "Prateek Mathur", city: "Jaipur", state: "Rajasthan" },
  { name: "Varun Shenoy", city: "Udupi", state: "Karnataka" },
  { name: "Ankita Somani", city: "Ahmedabad", state: "Gujarat" },
  { name: "Naveen Deshmukh", city: "Pune", state: "Maharashtra" },
  { name: "Dhruv Grewal", city: "Ludhiana", state: "Punjab" },
  { name: "Pallavi Sundaram", city: "Chennai", state: "Tamil Nadu" },
  { name: "Kunal Varghese", city: "Thrissur", state: "Kerala" },
  { name: "Ritika Chauhan", city: "Dehradun", state: "Uttarakhand" },
  { name: "Suraj Poddar", city: "Ranchi", state: "Jharkhand" },
  { name: "Anindita Sen", city: "Kolkata", state: "West Bengal" },
  { name: "Yashwant Shinde", city: "Solapur", state: "Maharashtra" },
  { name: "Bhavna Rawat", city: "Haridwar", state: "Uttarakhand" },
  { name: "Tushar Sethi", city: "Gurgaon", state: "Haryana" },
  { name: "Monika Naidu", city: "Visakhapatnam", state: "Andhra Pradesh" },
  { name: "Kavita Acharya", city: "Mysuru", state: "Karnataka" },
  { name: "Sahil Gadkari", city: "Nashik", state: "Maharashtra" },
  { name: "Divya Sisodia", city: "Ujjain", state: "Madhya Pradesh" },
  { name: "Rajat Bhatt", city: "Surat", state: "Gujarat" },
  { name: "Harini Das", city: "Bhubaneswar", state: "Odisha" },
  { name: "Ayush Vardhan", city: "Vijayawada", state: "Andhra Pradesh" },
  { name: "Garima Hegde", city: "Hubballi", state: "Karnataka" },
  { name: "Pranav Singha", city: "Guwahati", state: "Assam" },
  { name: "Smriti Ranawat", city: "Udaipur", state: "Rajasthan" },
  { name: "Akhil Shukla", city: "Lucknow", state: "Uttar Pradesh" },
  { name: "Charu Bishnoi", city: "Bikaner", state: "Rajasthan" },
  { name: "Gautam Namboodiri", city: "Kollam", state: "Kerala" },
  { name: "Shikha Yadav", city: "Gwalior", state: "Madhya Pradesh" },
  { name: "Jaspreet Gill", city: "Patiala", state: "Punjab" },
  { name: "Tejaswini Patil", city: "Kolhapur", state: "Maharashtra" },
  { name: "Kushagra Agnihotri", city: "Varanasi", state: "Uttar Pradesh" },
  { name: "Preeti Shenoy", city: "Belagavi", state: "Karnataka" },
  { name: "Bikramjit Mukherjee", city: "Howrah", state: "West Bengal" },
  { name: "Radhika Deshpande", city: "Aurangabad", state: "Maharashtra" },
  { name: "Mayank Sandhu", city: "Jalandhar", state: "Punjab" },
  { name: "Meenakshi Iyer", city: "Madurai", state: "Tamil Nadu" },
  { name: "Girish Sahu", city: "Raipur", state: "Chhattisgarh" },
  { name: "Sangeeta Kulkarni", city: "Amravati", state: "Maharashtra" },
  { name: "Abhishek Dutta", city: "Durgapur", state: "West Bengal" },
  { name: "Chitra Bisht", city: "Nainital", state: "Uttarakhand" },

  // 15K Partition (Index 250 - 299)
  { name: "Deepak Bhardwaj", city: "Delhi NCR", state: "Delhi" },
  { name: "Lipika Sundaram", city: "Chennai", state: "Tamil Nadu" },
  { name: "Nitin Shenoy", city: "Bengaluru", state: "Karnataka" },
  { name: "Renuka Menon", city: "Kochi", state: "Kerala" },
  { name: "Sourabh Deshmukh", city: "Pune", state: "Maharashtra" },
  { name: "Damini Chawla", city: "Chandigarh", state: "Punjab" },
  { name: "Karthik Banerjee", city: "Kolkata", state: "West Bengal" },
  { name: "Lavanya Joshi", city: "Jaipur", state: "Rajasthan" },
  { name: "Pawan Shinde", city: "Mumbai", state: "Maharashtra" },
  { name: "Hemant Reddy", city: "Hyderabad", state: "Telangana" },
  { name: "Komal Grewal", city: "Amritsar", state: "Punjab" },
  { name: "Baljeet Varma", city: "Lucknow", state: "Uttar Pradesh" },
  { name: "Payal Patel", city: "Ahmedabad", state: "Gujarat" },
  { name: "Rishabh Tawde", city: "Nagpur", state: "Maharashtra" },
  { name: "Sunil Shenoy", city: "Mangaluru", state: "Karnataka" },
  { name: "Madhuri Rawat", city: "Dehradun", state: "Uttarakhand" },
  { name: "Vikas Sethi", city: "Noida", state: "Uttar Pradesh" },
  { name: "Jahnvi Gupta", city: "Indore", state: "Madhya Pradesh" },
  { name: "Pankaj Srivastava", city: "Varanasi", state: "Uttar Pradesh" },
  { name: "Archana Saxena", city: "Bhopal", state: "Madhya Pradesh" },
  { name: "Niraj Hegde", city: "Udupi", state: "Karnataka" },
  { name: "Mamta Tiwari", city: "Kanpur", state: "Uttar Pradesh" },
  { name: "Shashank Sen", city: "Siliguri", state: "West Bengal" },
  { name: "Kalyani Bhatia", city: "Gurgaon", state: "Haryana" },
  { name: "Rajat Pillai", city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Kavita Jha", city: "Patna", state: "Bihar" },
  { name: "Sahil Das", city: "Guwahati", state: "Assam" },
  { name: "Divya Kulkarni", city: "Nashik", state: "Maharashtra" },
  { name: "Rohan Bisht", city: "Haridwar", state: "Uttarakhand" },
  { name: "Harini Mehra", city: "Faridabad", state: "Haryana" },
  { name: "Ayush Kaushik", city: "Ghaziabad", state: "Uttar Pradesh" },
  { name: "Garima Roy", city: "Ranchi", state: "Jharkhand" },
  { name: "Pranav Choudhury", city: "Bhubaneswar", state: "Odisha" },
  { name: "Smriti Singhal", city: "Agra", state: "Uttar Pradesh" },
  { name: "Akhil Nambiar", city: "Thrissur", state: "Kerala" },
  { name: "Charu Goswami", city: "Jalandhar", state: "Punjab" },
  { name: "Gautam Mathur", city: "Udaipur", state: "Rajasthan" },
  { name: "Shikha Rathore", city: "Jodhpur", state: "Rajasthan" },
  { name: "Jaspreet Bose", city: "Howrah", state: "West Bengal" },
  { name: "Tejaswini Patil", city: "Kolhapur", state: "Maharashtra" },
  { name: "Kushagra Bhatt", city: "Vadodara", state: "Gujarat" },
  { name: "Preeti Agnihotri", city: "Prayagraj", state: "Uttar Pradesh" },
  { name: "Bikramjit Sandhu", city: "Ludhiana", state: "Punjab" },
  { name: "Radhika Nair", city: "Kozhikode", state: "Kerala" },
  { name: "Mayank Verma", city: "Jammu", state: "Jammu & Kashmir" },
  { name: "Meenakshi Iyer", city: "Madurai", state: "Tamil Nadu" },
  { name: "Girish Chauhan", city: "Meerut", state: "Uttar Pradesh" },
  { name: "Sangeeta Sundaram", city: "Tiruchirappalli", state: "Tamil Nadu" },
  { name: "Abhishek Saxena", city: "Bareilly", state: "Uttar Pradesh" },
  { name: "Chitra Pandey", city: "Gorakhpur", state: "Uttar Pradesh" },

  // 21K Half Marathon Partition (Index 300 - 349)
  { name: "Siddharth Nambiar", city: "Bengaluru", state: "Karnataka" },
  { name: "Neha Choudhury", city: "Bhubaneswar", state: "Odisha" },
  { name: "Gaurav Kapoor", city: "Delhi NCR", state: "Delhi" },
  { name: "Priyanka Shenoy", city: "Mangaluru", state: "Karnataka" },
  { name: "Sameer Tawde", city: "Mumbai", state: "Maharashtra" },
  { name: "Kavita Joshi", city: "Pune", state: "Maharashtra" },
  { name: "Prateek Mathur", city: "Jaipur", state: "Rajasthan" },
  { name: "Varun Shenoy", city: "Udupi", state: "Karnataka" },
  { name: "Ankita Somani", city: "Ahmedabad", state: "Gujarat" },
  { name: "Naveen Deshmukh", city: "Nagpur", state: "Maharashtra" },
  { name: "Dhruv Grewal", city: "Chandigarh", state: "Punjab" },
  { name: "Pallavi Sundaram", city: "Chennai", state: "Tamil Nadu" },
  { name: "Kunal Varghese", city: "Kochi", state: "Kerala" },
  { name: "Ritika Chauhan", city: "Dehradun", state: "Uttarakhand" },
  { name: "Suraj Poddar", city: "Ranchi", state: "Jharkhand" },
  { name: "Anindita Sen", city: "Kolkata", state: "West Bengal" },
  { name: "Yashwant Shinde", city: "Thane", state: "Maharashtra" },
  { name: "Bhavna Rawat", city: "Shimla", state: "Himachal Pradesh" },
  { name: "Tushar Sethi", city: "Gurgaon", state: "Haryana" },
  { name: "Monika Naidu", city: "Hyderabad", state: "Telangana" },
  { name: "Kavita Acharya", city: "Mysuru", state: "Karnataka" },
  { name: "Sahil Gadkari", city: "Nashik", state: "Maharashtra" },
  { name: "Divya Sisodia", city: "Indore", state: "Madhya Pradesh" },
  { name: "Rajat Bhatt", city: "Surat", state: "Gujarat" },
  { name: "Harini Das", city: "Cuttack", state: "Odisha" },
  { name: "Ayush Vardhan", city: "Visakhapatnam", state: "Andhra Pradesh" },
  { name: "Garima Hegde", city: "Belagavi", state: "Karnataka" },
  { name: "Pranav Singha", city: "Guwahati", state: "Assam" },
  { name: "Smriti Ranawat", city: "Kota", state: "Rajasthan" },
  { name: "Akhil Shukla", city: "Lucknow", state: "Uttar Pradesh" },
  { name: "Charu Bishnoi", city: "Bikaner", state: "Rajasthan" },
  { name: "Gautam Namboodiri", city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Shikha Yadav", city: "Noida", state: "Uttar Pradesh" },
  { name: "Jaspreet Gill", city: "Ludhiana", state: "Punjab" },
  { name: "Tejaswini Patil", city: "Kolhapur", state: "Maharashtra" },
  { name: "Kushagra Agnihotri", city: "Prayagraj", state: "Uttar Pradesh" },
  { name: "Preeti Shenoy", city: "Kozhikode", state: "Kerala" },
  { name: "Bikramjit Mukherjee", city: "Asansol", state: "West Bengal" },
  { name: "Radhika Deshpande", city: "Aurangabad", state: "Maharashtra" },
  { name: "Mayank Sandhu", city: "Patiala", state: "Punjab" },
  { name: "Meenakshi Iyer", city: "Salem", state: "Tamil Nadu" },
  { name: "Girish Sahu", city: "Raipur", state: "Chhattisgarh" },
  { name: "Sangeeta Kulkarni", city: "Amravati", state: "Maharashtra" },
  { name: "Abhishek Dutta", city: "Durgapur", state: "West Bengal" },
  { name: "Chitra Bisht", city: "Nainital", state: "Uttarakhand" },
  { name: "Deepak Bhardwaj", city: "Faridabad", state: "Haryana" },
  { name: "Lipika Sundaram", city: "Tirunelveli", state: "Tamil Nadu" },
  { name: "Nitin Shenoy", city: "Hubballi", state: "Karnataka" },
  { name: "Renuka Menon", city: "Thrissur", state: "Kerala" },
  { name: "Sourabh Deshmukh", city: "Solapur", state: "Maharashtra" },

  // 25K / 30K / 42K Marathon Partition (Index 350 - 399)
  { name: "Devendra Rathore", city: "Jaipur", state: "Rajasthan" },
  { name: "Ananya Mukherjee", city: "Kolkata", state: "West Bengal" },
  { name: "Vikram Nambiar", city: "Kochi", state: "Kerala" },
  { name: "Meera Tawde", city: "Mumbai", state: "Maharashtra" },
  { name: "Rohan Shenoy", city: "Bengaluru", state: "Karnataka" },
  { name: "Kavya Deshmukh", city: "Pune", state: "Maharashtra" },
  { name: "Abhayraj Kapoor", city: "Chandigarh", state: "Punjab" },
  { name: "Pooja Sundaram", city: "Chennai", state: "Tamil Nadu" },
  { name: "Siddharth Chawla", city: "Delhi NCR", state: "Delhi" },
  { name: "Harshvardhan Reddy", city: "Hyderabad", state: "Telangana" },
  { name: "Simran Grewal", city: "Amritsar", state: "Punjab" },
  { name: "Naveen Varma", city: "Lucknow", state: "Uttar Pradesh" },
  { name: "Alokita Patel", city: "Ahmedabad", state: "Gujarat" },
  { name: "Prateek Deshpande", city: "Nagpur", state: "Maharashtra" },
  { name: "Divya Shenoy", city: "Mangaluru", state: "Karnataka" },
  { name: "Mayank Rawat", city: "Dehradun", state: "Uttarakhand" },
  { name: "Ritika Sethi", city: "Noida", state: "Uttar Pradesh" },
  { name: "Gaurav Gupta", city: "Indore", state: "Madhya Pradesh" },
  { name: "Deepa Srivastava", city: "Varanasi", state: "Uttar Pradesh" },
  { name: "Tarun Saxena", city: "Bhopal", state: "Madhya Pradesh" },
  { name: "Namrata Hegde", city: "Udupi", state: "Karnataka" },
  { name: "Ayush Tiwari", city: "Kanpur", state: "Uttar Pradesh" },
  { name: "Smriti Sen", city: "Siliguri", state: "West Bengal" },
  { name: "Abhishek Bhatia", city: "Gurgaon", state: "Haryana" },
  { name: "Charu Pillai", city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Nitin Jha", city: "Patna", state: "Bihar" },
  { name: "Sangeeta Das", city: "Guwahati", state: "Assam" },
  { name: "Kunal Kulkarni", city: "Nashik", state: "Maharashtra" },
  { name: "Bhavna Bisht", city: "Haridwar", state: "Uttarakhand" },
  { name: "Rahul Mehra", city: "Faridabad", state: "Haryana" },
  { name: "Swati Kaushik", city: "Ghaziabad", state: "Uttar Pradesh" },
  { name: "Dhruv Roy", city: "Ranchi", state: "Jharkhand" },
  { name: "Meera Choudhury", city: "Bhubaneswar", state: "Odisha" },
  { name: "Karan Singhal", city: "Agra", state: "Uttar Pradesh" },
  { name: "Pallavi Nambiar", city: "Thrissur", state: "Kerala" },
  { name: "Shashank Goswami", city: "Jalandhar", state: "Punjab" },
  { name: "Jahnvi Mathur", city: "Udaipur", state: "Rajasthan" },
  { name: "Tushar Rathore", city: "Jodhpur", state: "Rajasthan" },
  { name: "Monika Bose", city: "Howrah", state: "West Bengal" },
  { name: "Balram Patil", city: "Kolhapur", state: "Maharashtra" },
  { name: "Lipika Bhatt", city: "Vadodara", state: "Gujarat" },
  { name: "Sourabh Agnihotri", city: "Prayagraj", state: "Uttar Pradesh" },
  { name: "Preeti Sandhu", city: "Ludhiana", state: "Punjab" },
  { name: "Hemant Nair", city: "Kozhikode", state: "Kerala" },
  { name: "Damini Verma", city: "Jammu", state: "Jammu & Kashmir" },
  { name: "Gautam Iyer", city: "Madurai", state: "Tamil Nadu" },
  { name: "Radhika Chauhan", city: "Meerut", state: "Uttar Pradesh" },
  { name: "Pawan Sundaram", city: "Tiruchirappalli", state: "Tamil Nadu" },
  { name: "Madhuri Saxena", city: "Bareilly", state: "Uttar Pradesh" },
  { name: "Vikas Pandey", city: "Gorakhpur", state: "Uttar Pradesh" },
];

function parseDistanceKm(distanceStr: string): number {
  if (!distanceStr) return 5;
  const lower = distanceStr.toLowerCase().trim();
  if (lower.includes("half") || lower.includes("21.1") || lower.includes("21k")) return 21.0975;
  if (lower.includes("full") || (lower.includes("marathon") && !lower.includes("half"))) return 42.195;
  const match = distanceStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match && match[1]) {
    const parsed = parseFloat(match[1]);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return 5;
}

// Generate a deterministic pseudo-random hash for consistency
function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCategorySliceOffset(distance: string): number {
  const km = parseDistanceKm(distance);
  if (km <= 2) return 0;       // 1.5k / 1.6k -> Slice 0..49
  if (km <= 4) return 50;      // 3k / 3.2k   -> Slice 50..99
  if (km <= 6) return 100;     // 5k          -> Slice 100..149
  if (km <= 8) return 150;     // 7k          -> Slice 150..199
  if (km <= 12) return 200;    // 10k         -> Slice 200..249
  if (km <= 18) return 250;    // 15k         -> Slice 250..299
  if (km <= 23) return 300;    // 21.1k       -> Slice 300..349
  return 350;                  // 25k+ / 42k  -> Slice 350..399
}

function getBasePacesForDistance(km: number, targetCount = 50, startBasePace?: number): number[] {
  let startPace = startBasePace ?? 225;
  if (!startBasePace) {
    if (km <= 2) startPace = 205;       // ~3:25/km
    else if (km <= 3.5) startPace = 215;// ~3:35/km
    else if (km <= 5.5) startPace = 230;// ~3:50/km
    else if (km <= 7.5) startPace = 250;// ~4:10/km
    else if (km <= 11) startPace = 265; // ~4:25/km
    else if (km <= 16) startPace = 285; // ~4:45/km
    else if (km <= 22) startPace = 300; // ~5:00/km
    else startPace = 320;               // ~5:20/km
  }

  return Array.from({ length: targetCount }, (_, i) => {
    const spread = Math.round(startPace + Math.pow(i + 1, 1.32) * 2.6);
    return spread;
  });
}

function generatePaddedLeaderboard(
  eventSlug: string,
  distance: string,
  targetTotal = 50,
  realRunnersCount = 0,
  minPaceBaseline?: number,
) {
  const km = parseDistanceKm(distance);
  const seed = hashSeed(`${eventSlug}-${distance}`);
  const cleanCode = distance.replace(/[^a-zA-Z0-9.]/g, "").toUpperCase() || "RUN";
  const offset = getCategorySliceOffset(distance);
  const needed = Math.max(0, targetTotal - realRunnersCount);

  // Derive event prefix (e.g. SDC for sports-day-celebration, IDVR for independence-day)
  let eventPrefix = "MR";
  if (eventSlug.includes("sports-day")) eventPrefix = "SDC";
  else if (eventSlug.includes("independence")) eventPrefix = "IDVR";
  else if (eventSlug.includes("spring-valley")) eventPrefix = "SVD";

  const basePaces = getBasePacesForDistance(km, needed, minPaceBaseline);

  const paddedList = [];
  for (let idx = 0; idx < needed; idx++) {
    const profileIdx = (offset + idx) % INDIAN_RUNNERS_MASTER_POOL.length;
    const profile = INDIAN_RUNNERS_MASTER_POOL[profileIdx];
    const variance = ((seed + idx * 11) % 9) - 4;
    const paceSec = Math.max(195, basePaces[idx] + variance);
    const finishSeconds = Math.round(km * paceSec);

    const deterministicBibNum = ((seed + idx * 37) % 899999) + 100001;
    const bibNumber = `${eventPrefix}-${cleanCode}-${deterministicBibNum}`;

    paddedList.push({
      runnerName: profile.name,
      city: profile.city,
      state: profile.state,
      distance: distance,
      finishTimeSeconds: finishSeconds,
      bibNumber,
      status: "Verified" as const,
      isPadded: true,
      userId: `dummy-${eventSlug}-${cleanCode}-${idx}`,
      clerkId: null,
    });
  }

  return paddedList;
}

export async function getLeaderboard(request: AuthenticatedRequest, response: Response) {
  const rawKey = routeParam(request, "eventId");
  const eventKey = decodeURIComponent(rawKey).trim();
  const distanceQuery =
    typeof request.query.distance === "string" && request.query.distance.trim()
      ? request.query.distance.trim().slice(0, 50)
      : undefined;
  
  const searchQuery =
    typeof request.query.search === "string" && request.query.search.trim()
      ? request.query.search.trim().toLowerCase().slice(0, 50)
      : undefined;

  await ensureDefaultEvents();

  const isIndependence =
    eventKey.toLowerCase().includes("independence") ||
    eventKey.toLowerCase().includes("idvr");

  const mode = "insensitive" as const;

  // Accept either event id, exact slug, case-insensitive slug, or title
  const event = await prisma.event.findFirst({
    where: {
      OR: [
        { id: eventKey },
        { slug: eventKey },
        { slug: { equals: eventKey, mode } },
        { title: { equals: eventKey, mode } },
        ...(isIndependence
          ? [
              { slug: { contains: "independence", mode } },
              { title: { contains: "independence", mode } },
            ]
          : []),
      ],
    },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Collect all matching event IDs (in case registrations were split across slug variations)
  const matchingEventIds = [event.id];
  if (isIndependence) {
    const extraEvents = await prisma.event.findMany({
      where: {
        OR: [
          { slug: { contains: "independence", mode } },
          { title: { contains: "independence", mode } },
        ],
      },
      select: { id: true },
    });
    for (const ev of extraEvents) {
      if (!matchingEventIds.includes(ev.id)) {
        matchingEventIds.push(ev.id);
      }
    }
  }

  // Available distances list (fallback to standard set if empty)
  const defaultDistances = isIndependence
    ? ["1.5 km", "3 km", "5 km", "10 km", "15 km", "20 km", "25 km", "30 km"]
    : ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "15 km", "21 km"];

  const availableDistances =
    event.distances && event.distances.length > 0 ? event.distances : defaultDistances;

  // Normalize selected distance (match case-insensitively or default to first available)
  let activeDistance = availableDistances[0] || "5 km";
  if (distanceQuery && distanceQuery !== "all") {
    const matched = availableDistances.find(
      (d) => d.toLowerCase().replace(/\s+/g, "") === distanceQuery.toLowerCase().replace(/\s+/g, ""),
    );
    activeDistance = matched || distanceQuery;
  }

  const activeKm = parseDistanceKm(activeDistance);
  const minRealisticSeconds = Math.round(activeKm * 150); // Min ~2:30/km world record pace

  // Fetch ALL real approved finishers for the leaderboard
  const realApprovedRegistrations = await prisma.registration.findMany({
    where: {
      eventId: { in: matchingEventIds },
      proofStatus: "APPROVED",
    },
    orderBy: [{ registeredAt: "asc" }],
    include: { user: true, event: true },
    take: 500,
  });

  // Filter approved finishers by matching distance (normalized) and search query
  const matchingRegistrations = realApprovedRegistrations.filter((reg) => {
    let matchesDistance = false;
    if (!distanceQuery || distanceQuery.toLowerCase() === "all" || distanceQuery.toLowerCase() === "alldistances") {
      matchesDistance = true;
    } else {
      const regKm = parseDistanceKm(reg.distance);
      const targetKm = parseDistanceKm(activeDistance);
      if (Math.abs(regKm - targetKm) < 0.1) {
        matchesDistance = true;
      } else {
        const cleanReg = reg.distance.toLowerCase().replace(/\s+/g, "");
        const cleanTarget = activeDistance.toLowerCase().replace(/\s+/g, "");
        matchesDistance = cleanReg === cleanTarget || cleanReg.includes(cleanTarget) || cleanTarget.includes(cleanReg);
      }
    }

    // If there's a search query, bypass the distance filter but enforce the search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (reg.shippingName || reg.user.name).toLowerCase().includes(q);
      const bibMatch = reg.bibNumber && reg.bibNumber.toLowerCase().includes(q);
      const cityMatch = reg.shippingCity && reg.shippingCity.toLowerCase().includes(q);
      return nameMatch || bibMatch || cityMatch;
    }

    return matchesDistance;
  });

  // Fetch all registered participants for the Event Roster tab
  const allParticipants = await prisma.registration.findMany({
    where: {
      eventId: { in: matchingEventIds },
    },
    orderBy: { registeredAt: "desc" },
    include: { user: true, proofUpload: true },
    take: 500,
  });

  // Filter roster by matching distance if specified
  const filteredParticipants = allParticipants.filter((p) => {
    if (!distanceQuery || distanceQuery === "all") return true;
    const pKm = parseDistanceKm(p.distance);
    const targetKm = parseDistanceKm(activeDistance);
    if (Math.abs(pKm - targetKm) < 0.1) return true;
    const cleanReg = p.distance.toLowerCase().replace(/\s+/g, "");
    const cleanTarget = activeDistance.toLowerCase().replace(/\s+/g, "");
    return cleanReg === cleanTarget || cleanReg.includes(cleanTarget) || cleanTarget.includes(cleanReg);
  });

  // Check if current authenticated user has registration(s) in this event
  const clerkUserId = request.auth?.userId;
  let userRegistrations: Array<{
    id: string;
    distance: string;
    bibNumber: string;
    proofStatus: string;
    status: string;
    finishTimeSeconds: number | null;
  }> = [];

  if (clerkUserId) {
    const foundUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        registrations: {
          where: { eventId: { in: matchingEventIds } },
        },
      },
    });
    if (foundUser?.registrations) {
      userRegistrations = foundUser.registrations.map((r) => ({
        id: r.id,
        distance: r.distance,
        bibNumber: r.bibNumber,
        proofStatus: r.proofStatus,
        status: r.status,
        finishTimeSeconds: r.finishTimeSeconds,
      }));
    }
  }

  // Transform real verified approved finishers
  const realLeaderboardRows = matchingRegistrations.map((reg) => {
    let validSeconds = reg.finishTimeSeconds;
    const regKm = parseDistanceKm(reg.distance) || activeKm;
    const minPaceSeconds = Math.round(regKm * 180); // 3:00 / km min

    // If an approved runner has no finish time in seconds, calculate a realistic verified finish time (4:50 - 6:10 / km)
    if (validSeconds == null || validSeconds <= 0) {
      const hash = reg.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const pacePerKm = 290 + (hash % 80);
      validSeconds = Math.round(regKm * pacePerKm);
    } else if (validSeconds < minPaceSeconds) {
      if (validSeconds * 60 >= minPaceSeconds && validSeconds * 60 <= regKm * 600) {
        validSeconds = validSeconds * 60;
      } else {
        validSeconds = Math.round(regKm * 310);
      }
    }

    return {
      runnerName: reg.shippingName || reg.user.name,
      city: reg.shippingCity || "India",
      state: reg.shippingState || "",
      distance: reg.distance,
      finishTimeSeconds: validSeconds,
      bibNumber: reg.bibNumber,
      status: "Verified" as const,
      isPadded: false,
      userId: reg.user.id,
      clerkId: reg.user.clerkId,
    };
  });

  // Highest preference to real users: Real verified runners lead and take top spots!
  realLeaderboardRows.sort((a, b) => (a.finishTimeSeconds ?? 999999) - (b.finishTimeSeconds ?? 999999));

  // Determine starting baseline pace for padded finishers so real users stay comfortably in top preference
  let lastRealPace = Math.round(activeKm * 280 / activeKm);
  if (realLeaderboardRows.length > 0) {
    const slowestRealSecs = realLeaderboardRows[realLeaderboardRows.length - 1].finishTimeSeconds || Math.round(activeKm * 340);
    lastRealPace = Math.max(240, Math.round(slowestRealSecs / activeKm) + 12);
  }

  const mergedRows = [...realLeaderboardRows];
  if (mergedRows.length < 50 && !searchQuery) {
    const paddedRows = generatePaddedLeaderboard(event.slug, activeDistance, 50, mergedRows.length, lastRealPace);
    for (const dummy of paddedRows) {
      if (mergedRows.length >= 50) break;
      if (!mergedRows.some((r) => r.runnerName.toLowerCase() === dummy.runnerName.toLowerCase())) {
        mergedRows.push(dummy);
      }
    }
  }

  // Sort by finish time ascending
  mergedRows.sort((a, b) => (a.finishTimeSeconds ?? 999999) - (b.finishTimeSeconds ?? 999999));

  // Compute ranks
  const rankedLeaderboard = mergedRows.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));

  // Transform participants list (Event Roster)
  const participantRoster = filteredParticipants.map((p, idx) => ({
    rosterNumber: idx + 1,
    runnerName: p.shippingName || p.user.name,
    city: p.shippingCity || "India",
    state: p.shippingState || "",
    distance: p.distance,
    bibNumber: p.bibNumber,
    status:
      p.proofStatus === "APPROVED"
        ? "Verified Finisher"
        : p.proofStatus === "SUBMITTED"
          ? "Under Review"
          : p.status === "CONFIRMED" || p.status === "COMPLETED"
            ? "Confirmed Runner"
            : "Registered",
    proofStatus: p.proofStatus,
    registrationStatus: p.status,
    registeredAt: p.registeredAt,
    finishTimeSeconds: p.finishTimeSeconds ?? null,
    userId: p.user.id,
    clerkId: p.user.clerkId,
  }));

  const isUpcoming = event.startsAt ? new Date() < new Date(event.startsAt) : false;

  response.json({
    data: rankedLeaderboard,
    participants: participantRoster,
    userRegistrations,
    meta: {
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      isUpcoming,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      availableDistances,
      selectedDistance: activeDistance,
      totalVerified: rankedLeaderboard.length,
      totalParticipants: participantRoster.length,
    },
  });
}
