"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMemo, useState } from "react";
import { Field, inputClass, primaryLinkClass } from "../components/app-shell";
import { type FieldErrors, validateRegistrationForm } from "../../lib/validation";

type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

const events = [
  { label: "Monsoon Mountain Miles", value: "monsoon-mountain-miles", amount: "Rs. 499" },
  { label: "Independence Endurance Run", value: "independence-endurance-run", amount: "Rs. 649" },
  { label: "Himalayan Winter Sprint", value: "himalayan-winter-sprint", amount: "Rs. 399" },
];

async function loadRazorpayScript() {
  if (window.Razorpay) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return `Could not connect to the API at ${API_URL}. Please start the backend with "npm run api:dev".`;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export function PaymentRegistrationForm() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "paid" | "error">("idle");
  const [message, setMessage] = useState("Fill details and continue to Razorpay Checkout.");
  const [selectedEvent, setSelectedEvent] = useState(events[0].value);
  const [errors, setErrors] = useState<FieldErrors>({});

  const selectedAmount = useMemo(
    () => events.find((event) => event.value === selectedEvent)?.amount ?? "Rs. 499",
    [selectedEvent],
  );

  const defaultName = user?.fullName ?? user?.firstName ?? "";
  const defaultEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const defaultPhone = user?.primaryPhoneNumber?.phoneNumber ?? "";

  async function handleSubmit(formData: FormData) {
    const fieldErrors = validateRegistrationForm(formData);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      setStatus("error");
      setMessage("Please fix the highlighted fields and try again.");
      return;
    }

    if (!isSignedIn) {
      setStatus("error");
      setMessage("Please sign in with Clerk before registering for an event.");
      return;
    }

    setStatus("creating");
    setMessage("Creating registration and secure Razorpay order...");

    try {
      const token = await getToken();
      const authHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const registrationResponse = await fetch(`${API_URL}/api/registrations`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          clerkId: user?.id,
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          eventSlug: formData.get("eventSlug"),
          distance: formData.get("distance"),
          shippingName: formData.get("name"),
          shippingPhone: formData.get("phone"),
          shippingLine1: formData.get("address"),
          shippingCity: formData.get("city"),
          shippingState: formData.get("state"),
          shippingPincode: formData.get("pincode"),
        }),
      });

      if (!registrationResponse.ok) {
        const error = await registrationResponse.json().catch(() => null);
        throw new Error(error?.error?.message ?? "Registration failed");
      }

      const registrationJson = await registrationResponse.json();
      const registrationId = registrationJson.data.id as string;

      const orderResponse = await fetch(`${API_URL}/api/payments/create-order`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ registrationId }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json().catch(() => null);
        throw new Error(error?.error?.message ?? "Payment order failed");
      }

      const orderJson = await orderResponse.json();
      const order = orderJson.data;
      const loaded = await loadRazorpayScript();

      if (!loaded || !window.Razorpay) {
        throw new Error("Razorpay Checkout could not be loaded");
      }

      setStatus("paying");
      setMessage("Razorpay Checkout opened. Choose UPI for payment.");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: "Mountain Run",
        description: `Registration ${order.bibNumber}`,
        order_id: order.orderId,
        prefill: {
          name: formData.get("name"),
          email: formData.get("email"),
          contact: formData.get("phone"),
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        theme: { color: "#151512" },
        handler: async (response: CheckoutResponse) => {
          const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify(response),
          });

          if (!verifyResponse.ok) {
            const error = await verifyResponse.json().catch(() => null);
            throw new Error(error?.error?.message ?? "Payment captured but verification failed");
          }

          const verifyJson = await verifyResponse.json().catch(() => null);
          const emailSent = verifyJson?.data?.emailSent === true;

          setStatus("paid");
          setMessage(
            emailSent
              ? "Payment verified. Confirmation email sent to your inbox."
              : "Payment verified. Registration confirmed. (Email could not be sent — check RESEND_API_KEY.)",
          );
        },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            setMessage("Payment cancelled. You can try again.");
          },
        },
      });

      checkout.open();
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyErrorMessage(error));
    }
  }

  return (
    <form action={handleSubmit} className="mt-8 rounded-lg border hairline bg-[var(--panel)] p-5 soft-shadow" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name">
          <input
            aria-invalid={Boolean(errors.name)}
            className={inputClass}
            defaultValue={defaultName}
            name="name"
            placeholder="Your name"
            required
          />
          <FieldError message={errors.name} />
        </Field>
        <Field label="Email">
          <input
            aria-invalid={Boolean(errors.email)}
            className={inputClass}
            defaultValue={defaultEmail}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <FieldError message={errors.email} />
        </Field>
        <Field label="Phone">
          <input
            aria-invalid={Boolean(errors.phone)}
            className={inputClass}
            defaultValue={defaultPhone}
            name="phone"
            placeholder="+91 98765 43210"
            required
          />
          <FieldError message={errors.phone} />
        </Field>
        <Field label="Distance">
          <select aria-invalid={Boolean(errors.distance)} className={inputClass} name="distance" required>
            <option value="">Select distance</option>
            <option value="5K">5K</option>
            <option value="10K">10K</option>
            <option value="21K">21K</option>
          </select>
          <FieldError message={errors.distance} />
        </Field>
        <Field label="Event">
          <select
            aria-invalid={Boolean(errors.eventSlug)}
            className={inputClass}
            name="eventSlug"
            onChange={(event) => setSelectedEvent(event.target.value)}
            required
            value={selectedEvent}
          >
            {events.map((event) => (
              <option key={event.value} value={event.value}>{event.label}</option>
            ))}
          </select>
          <FieldError message={errors.eventSlug} />
        </Field>
        <Field label="City">
          <input
            aria-invalid={Boolean(errors.city)}
            className={inputClass}
            name="city"
            placeholder="Mumbai"
            required
          />
          <FieldError message={errors.city} />
        </Field>
        <Field label="State">
          <input
            aria-invalid={Boolean(errors.state)}
            className={inputClass}
            name="state"
            placeholder="Maharashtra"
            required
          />
          <FieldError message={errors.state} />
        </Field>
        <Field label="Pincode">
          <input
            aria-invalid={Boolean(errors.pincode)}
            className={inputClass}
            inputMode="numeric"
            maxLength={6}
            name="pincode"
            placeholder="400050"
            required
          />
          <FieldError message={errors.pincode} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Shipping address">
            <input
              aria-invalid={Boolean(errors.address)}
              className={inputClass}
              name="address"
              placeholder="House, street, area"
              required
            />
            <FieldError message={errors.address} />
          </Field>
        </div>
      </div>
      <div className="mt-5 rounded-lg border hairline bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Pay securely with Razorpay</p>
            <p className={`mt-1 text-sm ${status === "error" ? "text-red-600" : "text-[var(--muted)]"}`}>{message}</p>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{selectedAmount}</p>
        </div>
      </div>
      <button
        className={`${primaryLinkClass} mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={status === "creating" || status === "paying" || status === "paid"}
        type="submit"
      >
        {status === "creating"
          ? "Creating order..."
          : status === "paying"
            ? "Payment in progress..."
            : status === "paid"
              ? "Paid"
              : "Continue to UPI payment"}
      </button>
    </form>
  );
}
