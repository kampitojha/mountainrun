import { Prisma } from "@prisma/client";

/**
 * Builds a comprehensive, fuzzy + prefix-independent Prisma where clause
 * for searching registrations across BIB numbers, phone numbers (with or without +91 / spaces),
 * runner names, emails, cities, pincodes, tracking numbers, certificate numbers, and payment IDs.
 */
export function buildRegistrationSearchWhere(
  searchQuery: string | undefined | null
): Prisma.RegistrationWhereInput | null {
  if (!searchQuery) return null;
  const raw = searchQuery.trim();
  if (!raw) return null;

  const isEmail = raw.includes("@");
  const isPureDigits = /^\d+$/.test(raw);
  const cleanBibPrefix = raw.replace(/^(bib|bib#|#)\s*[:#-]?\s*/i, "").trim();
  const isBibTyped = cleanBibPrefix !== raw || /^[a-zA-Z]{2,6}[-_ ]?\d+$/i.test(raw);

  // If search is specifically an email address
  if (isEmail) {
    return {
      OR: [
        { user: { email: { contains: raw, mode: "insensitive" } } },
        { user: { name: { contains: raw, mode: "insensitive" } } },
        { shippingName: { contains: raw, mode: "insensitive" } },
      ],
    };
  }

  const terms = new Set<string>();
  terms.add(raw);

  // 1. Clean common user-typed prefixes: "bib: 608934", "bib #608934", "#608934", "bib 608934"
  if (cleanBibPrefix && cleanBibPrefix !== raw) {
    terms.add(cleanBibPrefix);
  }

  // 2. Space to hyphen normalization for bibs like "nud2 608934" -> "nud2-608934"
  const spaceHyphen = raw.replace(/\s+/g, "-");
  if (spaceHyphen && spaceHyphen !== raw) {
    terms.add(spaceHyphen);
  }

  // 3. Letters directly joined to digits without separator: "nud2608934" -> "nud2-608934"
  const joinedMatch = raw.match(/^([a-zA-Z]{2,6})\s*[-_ ]?\s*(\d{2,})$/i);
  if (joinedMatch) {
    terms.add(`${joinedMatch[1]}-${joinedMatch[2]}`);
    terms.add(joinedMatch[2]);
  }

  // 4. Digits & Phone variations
  const digitsOnly = raw.replace(/\D/g, "");
  const phoneVariations: string[] = [];

  if (digitsOnly.length >= 7) {
    const last10 = digitsOnly.slice(-10);
    phoneVariations.push(last10);
    phoneVariations.push(`+91${last10}`);
    phoneVariations.push(`0${last10}`);
    if (digitsOnly !== last10) {
      phoneVariations.push(digitsOnly);
    }
  }

  const orConditions: Prisma.RegistrationWhereInput[] = [];

  // Add search for all text terms
  for (const term of terms) {
    orConditions.push(
      { bibNumber: { contains: term, mode: "insensitive" } },
      { shippingName: { contains: term, mode: "insensitive" } },
      { shippingPhone: { contains: term, mode: "insensitive" } },
      { shippingCity: { contains: term, mode: "insensitive" } },
      { shippingState: { contains: term, mode: "insensitive" } },
      { shippingPincode: { contains: term, mode: "insensitive" } },
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
      { user: { phone: { contains: term, mode: "insensitive" } } },
      { user: { username: { contains: term, mode: "insensitive" } } },
      { certificate: { certificateNumber: { contains: term, mode: "insensitive" } } },
      { medalDelivery: { trackingNumber: { contains: term, mode: "insensitive" } } },
      { payment: { razorpayPaymentId: { contains: term, mode: "insensitive" } } },
      { payment: { razorpayOrderId: { contains: term, mode: "insensitive" } } },
    );
  }

  // Add search for phone variations
  for (const pTerm of phoneVariations) {
    orConditions.push(
      { shippingPhone: { contains: pTerm, mode: "insensitive" } },
      { user: { phone: { contains: pTerm, mode: "insensitive" } } },
    );
  }

  // Direct number search in bibNumber:
  // Trigger if pure digits (e.g. "608934" or "6089") or explicitly typed "bib 608934" or 4+ digits
  if (digitsOnly && (isPureDigits || isBibTyped || digitsOnly.length >= 4)) {
    orConditions.push({
      bibNumber: { contains: digitsOnly, mode: "insensitive" },
    });
  }

  // Multi-word name support (e.g. "Daisy Jennifer")
  const words = raw.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length > 1) {
    for (const word of words) {
      orConditions.push(
        { shippingName: { contains: word, mode: "insensitive" } },
        { user: { name: { contains: word, mode: "insensitive" } } },
      );
    }
  }

  return { OR: orConditions };
}

/**
 * Intelligent relevance ranker:
 * Ensures exact BIB matches, prefix-less BIB number matches, exact phone matches,
 * exact emails, and runner names appear at the very TOP of search results.
 */
export function rankRegistrations<T extends any>(items: T[], rawQuery: string | undefined | null): T[] {
  if (!rawQuery || !items || items.length <= 1) return items;

  const query = rawQuery.trim();
  const qLower = query.toLowerCase();
  const digits = query.replace(/\D/g, "");
  const last10 = digits.length >= 7 ? digits.slice(-10) : digits;

  // Clean bib prefix if any: 'bib 608934' -> '608934'
  const cleanBib = qLower.replace(/^(bib|bib#|#)\s*[:#-]?\s*/i, "").trim();

  function calculateScore(reg: any): number {
    let score = 0;
    const bib = (reg.bibNumber || "").toLowerCase().trim();
    const email = (reg.user?.email || "").toLowerCase().trim();
    const shipName = (reg.shippingName || "").toLowerCase().trim();
    const userName = (reg.user?.name || "").toLowerCase().trim();
    const shipPhone = (reg.shippingPhone || "").replace(/\D/g, "");
    const userPhone = (reg.user?.phone || "").replace(/\D/g, "");
    const tracking = (reg.medalDelivery?.trackingNumber || "").toLowerCase().trim();
    const cert = (reg.certificate?.certificateNumber || "").toLowerCase().trim();
    const payId = (reg.payment?.razorpayPaymentId || "").toLowerCase().trim();
    const orderId = (reg.payment?.razorpayOrderId || "").toLowerCase().trim();

    // ── 1. BIB NUMBER (Highest Priority) ──
    if (bib === qLower || (cleanBib && bib === cleanBib)) {
      score += 100000;
    } else if (
      (cleanBib && (bib.endsWith(`-${cleanBib}`) || bib.endsWith(`_${cleanBib}`) || bib.endsWith(cleanBib))) ||
      (digits && (bib.endsWith(`-${digits}`) || bib.endsWith(`_${digits}`) || bib.endsWith(digits)))
    ) {
      score += 85000;
    } else if (bib.includes(qLower) || (cleanBib && bib.includes(cleanBib))) {
      score += 45000;
    } else if (digits && digits.length >= 3 && bib.includes(digits)) {
      score += 35000;
    }

    // ── 2. PHONE NUMBER ──
    if (last10 && last10.length >= 7) {
      const shipLast10 = shipPhone.slice(-10);
      const userLast10 = userPhone.slice(-10);
      if (shipLast10 === last10 || userLast10 === last10) {
        score += 75000;
      } else if (shipPhone.includes(last10) || userPhone.includes(last10)) {
        score += 40000;
      }
    }

    // ── 3. EMAIL ──
    if (email === qLower) {
      score += 90000;
    } else if (email.startsWith(qLower)) {
      score += 45000;
    } else if (email.includes(qLower)) {
      score += 20000;
    }

    // ── 4. NAME ──
    if (shipName === qLower || userName === qLower) {
      score += 60000;
    } else if (shipName.startsWith(qLower) || userName.startsWith(qLower)) {
      score += 30000;
    } else if (shipName.includes(qLower) || userName.includes(qLower)) {
      score += 15000;
    }

    // ── 5. TRACKING / CERTIFICATE / PAYMENT ──
    if (tracking === qLower || cert === qLower || payId === qLower || orderId === qLower) {
      score += 65000;
    } else if (
      (tracking && tracking.includes(qLower)) ||
      (cert && cert.includes(qLower)) ||
      (payId && payId.includes(qLower)) ||
      (orderId && orderId.includes(qLower))
    ) {
      score += 22000;
    }

    return score;
  }

  return [...items].sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    // Secondary tie-breaker: newest registration first
    const dateA = new Date((a as any).registeredAt || 0).getTime();
    const dateB = new Date((b as any).registeredAt || 0).getTime();
    return dateB - dateA;
  });
}
