"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  Package,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Field, inputClass } from "../components/app-shell";
import { PhoneInput } from "../components/phone-input";
import { SearchableSelect } from "../components/searchable-select";
import { authHeaders, getApiUrl, readApiError } from "../../lib/api";
import { INDIAN_STATES } from "../../lib/indian-states";
import {
  asString,
  getValidationSummaryMessage,
  type FieldErrors,
  validateRegistrationForm,
} from "../../lib/validation";

type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type RegisterEventOption = {
  label: string;
  value: string;
  amount: string;
  priceInPaise: number;
  distances: string[];
  description?: string;
};

type ExistingReg = {
  id: string;
  distance: string;
  status: string;
  event: { slug: string; title: string };
  payment?: { status: string } | null;
};

const fallbackEvents: RegisterEventOption[] = [
  {
    label: "Monsoon Mountain Miles",
    value: "monsoon-mountain-miles",
    amount: "₹499",
    priceInPaise: 49900,
    distances: ["3 km", "5 km", "10 km", "21 km"],
    description: "Festival favourite for clubs and first-timers",
  },
  {
    label: "Independence Endurance Run",
    value: "independence-endurance-run",
    amount: "₹649",
    priceInPaise: 64900,
    distances: ["5 km", "10 km", "25 km"],
    description: "Longer effort with medal delivery",
  },
  {
    label: "Himalayan Winter Sprint",
    value: "himalayan-winter-sprint",
    amount: "₹399",
    priceInPaise: 39900,
    distances: ["2 km", "5 km", "10 km"],
    description: "Quick virtual sprint across India",
  },
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
    return `Could not connect to the API at ${getApiUrl()}. Start the backend with npm run dev in backend/.`;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">{message}</p>;
}

function deriveUsername(input: {
  clerkUsername?: string | null;
  dbUsername?: string | null;
  email?: string | null;
  clerkId?: string | null;
}) {
  if (input.clerkUsername?.trim()) {
    return input.clerkUsername.trim();
  }
  if (input.dbUsername?.trim()) {
    return input.dbUsername.trim();
  }
  const email = input.email?.trim().toLowerCase() ?? "";
  if (email.includes("@")) {
    const base = email
      .split("@")[0]
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 18);
    if (base.length >= 3) {
      return base;
    }
  }
  const suffix = (input.clerkId ?? "run").slice(-5);
  return `runner_${suffix}`;
}

function SectionCard({
  step,
  title,
  subtitle,
  icon: Icon,
  children,
  delay = 0,
}: {
  step: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-(--line) bg-(--panel) shadow-(--shadow)"
    >
      <div className="flex items-start gap-3 border-b border-(--line) bg-(--panel-soft)/60 px-4 py-3.5 sm:px-5 sm:py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--line) bg-(--panel) text-(--sage) shadow-xs">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-(--muted)">
            Step {step}
          </p>
          <h2 className="mt-0.5 text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
          <p className="mt-0.5 text-xs text-(--muted) sm:text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </motion.section>
  );
}

export function PaymentRegistrationForm() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "paid" | "error">("idle");
  const [message, setMessage] = useState("Select an event and complete the form to continue.");
  const [events, setEvents] = useState<RegisterEventOption[]>(fallbackEvents);
  const [selectedEvent, setSelectedEvent] = useState(fallbackEvents[0].value);
  const [selectedDistance, setSelectedDistance] = useState(fallbackEvents[0].distances[0] ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [existingRegs, setExistingRegs] = useState<ExistingReg[]>([]);
  const [dbUsername, setDbUsername] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOpenEvents() {
      try {
        const response = await fetch(getApiUrl("/api/events?scope=open"));
        if (!response.ok) {
          return;
        }
        const json = await response.json();
        const rows = (json.data ?? []) as Array<{
          title: string;
          slug: string;
          distances: string[];
          priceInPaise: number;
          registrationOpen?: boolean;
          description?: string;
        }>;

        const open = rows
          .filter((row) => row.registrationOpen !== false)
          .map((row) => ({
            label: row.title,
            value: row.slug,
            amount: `₹${Math.round(row.priceInPaise / 100)}`,
            priceInPaise: row.priceInPaise,
            distances: row.distances?.length ? row.distances : ["5 km"],
            description: row.description,
          }));

        if (cancelled || open.length === 0) {
          return;
        }

        setEvents(open);
        setSelectedEvent((prev) =>
          open.some((event) => event.value === prev) ? prev : open[0].value,
        );
      } catch {
        // keep fallback open events
      }
    }

    void loadOpenEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const token = await getToken();
        if (!token || cancelled) {
          return;
        }

        await fetch(getApiUrl("/api/users/sync"), {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({
            clerkId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress,
            name: user?.fullName ?? user?.firstName,
            username: user?.username,
            phone: user?.primaryPhoneNumber?.phoneNumber,
            avatarUrl: user?.imageUrl,
          }),
        });

        const me = await fetch(getApiUrl("/api/users/me"), {
          headers: authHeaders(token),
        });
        if (!me.ok || cancelled) {
          return;
        }
        const json = await me.json();
        const data = json.data as {
          name?: string;
          username?: string | null;
          registrations?: ExistingReg[];
        };
        setDbUsername(data.username ?? null);
        setProfileName(data.name ?? "");
        setExistingRegs(data.registrations ?? []);
      } catch {
        // non-blocking
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn, user]);

  const activeEvent = useMemo(
    () => events.find((event) => event.value === selectedEvent) ?? events[0],
    [events, selectedEvent],
  );

  const distanceOptions = activeEvent?.distances ?? ["5 km"];

  useEffect(() => {
    if (!distanceOptions.includes(selectedDistance)) {
      setSelectedDistance(distanceOptions[0] ?? "");
    }
  }, [distanceOptions, selectedDistance]);

  const selectedAmount = activeEvent?.amount ?? "₹499";

  const defaultName =
    profileName || user?.fullName || user?.firstName || "";
  const defaultEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const defaultPhone = user?.primaryPhoneNumber?.phoneNumber ?? "";
  const username = deriveUsername({
    clerkUsername: user?.username,
    dbUsername,
    email: defaultEmail,
    clerkId: user?.id,
  });

  const registeredKeys = useMemo(() => {
    const set = new Set<string>();
    for (const reg of existingRegs) {
      if (reg.status === "CONFIRMED" || reg.status === "COMPLETED" || reg.payment?.status === "PAID") {
        set.add(`${reg.event.slug}::${reg.distance}`);
      }
    }
    return set;
  }, [existingRegs]);

  const pendingByEventDistance = useMemo(() => {
    const map = new Map<string, ExistingReg>();
    for (const reg of existingRegs) {
      if (reg.status === "PENDING_PAYMENT" || reg.payment?.status === "CREATED") {
        map.set(`${reg.event.slug}::${reg.distance}`, reg);
      }
    }
    return map;
  }, [existingRegs]);

  const distanceAlreadyTaken = registeredKeys.has(`${selectedEvent}::${selectedDistance}`);
  const pendingSame = pendingByEventDistance.get(`${selectedEvent}::${selectedDistance}`);

  if (!isLoaded) {
    return (
      <div className="card mt-10 p-10 text-center">
        <p className="text-sm text-[var(--muted)]">Checking your session…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mt-8 overflow-hidden p-0 sm:mt-10"
      >
        <div className="bg-linear-to-br from-(--sage)/15 via-(--panel) to-indigo-500/10 px-6 py-8 sm:px-10 sm:py-12">
          <p className="eyebrow">Account required</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Sign in to register
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-(--muted)">
            Use Google or email. After sign-in you&apos;ll return home — open Register anytime to
            join a race and pay with UPI.
          </p>
          <div className="btn-row mt-8">
            <Link className="btn btn-primary" href="/sign-in">
              Sign in
            </Link>
            <Link className="btn btn-secondary" href="/sign-up">
              Create account
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    // Ensure profile-derived username is always submitted
    formData.set("username", username);
    formData.set("eventSlug", selectedEvent);
    formData.set("distance", selectedDistance);

    const fieldErrors = validateRegistrationForm(formData);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      setStatus("error");
      setMessage(getValidationSummaryMessage(fieldErrors));
      return;
    }

    if (distanceAlreadyTaken) {
      setStatus("error");
      setMessage(
        `You’re already registered for ${selectedDistance} in this event. Choose another distance or event.`,
      );
      return;
    }

    if (!isSignedIn) {
      setStatus("error");
      setMessage("Please sign in before registering for an event.");
      return;
    }

    setStatus("creating");
    setMessage(
      pendingSame
        ? "Resuming your pending payment…"
        : "Creating registration and secure Razorpay order…",
    );

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Could not get auth token. Please sign in again.");
      }

      const headers = authHeaders(token);

      const registrationResponse = await fetch(getApiUrl("/api/registrations"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          clerkId: user?.id,
          name: formData.get("name"),
          username,
          email: formData.get("email"),
          phone: formData.get("phone"),
          eventSlug: selectedEvent,
          distance: selectedDistance,
          shippingName: formData.get("name"),
          shippingPhone: formData.get("phone"),
          shippingLine1: formData.get("address"),
          shippingLine2: asString(formData.get("landmark")) || undefined,
          shippingCity: formData.get("city"),
          shippingState: formData.get("state"),
          shippingPincode: formData.get("pincode"),
        }),
      });

      if (!registrationResponse.ok) {
        throw new Error(await readApiError(registrationResponse, "Registration failed"));
      }

      const registrationJson = await registrationResponse.json();
      const registrationId = registrationJson.data.id as string;
      const freeEntry =
        registrationJson.meta?.freeEntry === true ||
        registrationJson.data?.status === "CONFIRMED";

      if (freeEntry) {
        setStatus("paid");
        setMessage("Registration confirmed. No payment required for this event.");
        return;
      }

      const orderResponse = await fetch(getApiUrl("/api/payments/create-order"), {
        method: "POST",
        headers,
        body: JSON.stringify({ registrationId }),
      });

      if (!orderResponse.ok) {
        throw new Error(await readApiError(orderResponse, "Payment order failed"));
      }

      const orderJson = await orderResponse.json();
      const order = orderJson.data;
      const loaded = await loadRazorpayScript();

      if (!loaded || !window.Razorpay) {
        throw new Error("Razorpay Checkout could not be loaded");
      }

      setStatus("paying");
      setMessage("Checkout opened — complete payment with UPI (recommended).");

      const contact = asString(formData.get("phone")).replace(/\D/g, "");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency || "INR",
        name: "Mountain Run",
        description: `Registration ${order.bibNumber}`,
        image: "/logo-mark.svg",
        order_id: order.orderId,
        prefill: {
          name: asString(formData.get("name")),
          email: asString(formData.get("email")),
          contact: contact || undefined,
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: "All payment options",
                instruments: [
                  { method: "upi" },
                  { method: "card" },
                  { method: "wallet" },
                  { method: "netbanking" },
                ],
              },
            },
            hide: [{ method: "upi", flows: ["collect"] }],
            sequence: ["block.banks"],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: "#0d9488" },
        handler: async (response: CheckoutResponse) => {
          const verifyResponse = await fetch(getApiUrl("/api/payments/verify"), {
            method: "POST",
            headers,
            body: JSON.stringify(response),
          });

          if (!verifyResponse.ok) {
            throw new Error(
              await readApiError(verifyResponse, "Payment captured but verification failed"),
            );
          }

          const verifyJson = await verifyResponse.json().catch(() => null);
          const emailSent = verifyJson?.data?.emailSent === true;

          setStatus("paid");
          setMessage(
            emailSent
              ? "Payment verified. Confirmation email sent."
              : "Payment verified. Registration confirmed.",
          );

          // Refresh existing regs so other events stay selectable
          try {
            const me = await fetch(getApiUrl("/api/users/me"), { headers: authHeaders(token) });
            if (me.ok) {
              const meJson = await me.json();
              setExistingRegs(meJson.data?.registrations ?? []);
            }
          } catch {
            /* ignore */
          }
        },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            setMessage("Payment cancelled. You can try again or pick another event.");
          },
        },
      });

      checkout.on("payment.failed", (response: unknown) => {
        const err = response as { error?: { description?: string } };
        setStatus("error");
        setMessage(
          err?.error?.description ?? "Payment failed. Try UPI again or another method.",
        );
      });

      checkout.open();
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5 sm:mt-10 sm:space-y-6" noValidate>
      {/* Profile */}
      <SectionCard
        step="01"
        title="Your profile"
        subtitle="Pulled from your account — username is locked to your profile."
        icon={UserRound}
        delay={0.02}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input
              aria-invalid={Boolean(errors.name)}
              className={inputClass}
              defaultValue={defaultName}
              key={`name-${defaultName}`}
              name="name"
              placeholder="Your name"
              required
            />
            <FieldError message={errors.name} />
          </Field>

          <div>
            <span className="field-label">Username</span>
            <div className="input flex items-center gap-2 bg-(--panel-soft) text-(--muted)">
              <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
              <span className="truncate font-medium text-(--foreground)">@{username}</span>
            </div>
            <input name="username" type="hidden" value={username} />
            <p className="mt-1.5 text-[0.7rem] text-(--muted-soft)">
              Auto-filled from your account. Not editable here.
            </p>
          </div>

          <Field label="Email" required>
            <input
              aria-invalid={Boolean(errors.email)}
              className={`${inputClass} bg-(--panel-soft)`}
              defaultValue={defaultEmail}
              key={`email-${defaultEmail}`}
              name="email"
              readOnly
              required
              type="email"
            />
            <FieldError message={errors.email} />
          </Field>

          <Field label="Phone" required>
            <PhoneInput defaultValue={defaultPhone} invalid={Boolean(errors.phone)} />
            <FieldError message={errors.phone} />
          </Field>
        </div>
      </SectionCard>

      {/* Event picker */}
      <SectionCard
        step="02"
        title="Choose event"
        subtitle="You can join multiple events — only the same event + distance is blocked."
        icon={Sparkles}
        delay={0.06}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const active = selectedEvent === event.value;
            const eventRegs = existingRegs.filter((r) => r.event.slug === event.value);
            const confirmedCount = eventRegs.filter(
              (r) =>
                r.status === "CONFIRMED" ||
                r.status === "COMPLETED" ||
                r.payment?.status === "PAID",
            ).length;

            return (
              <motion.button
                key={event.value}
                type="button"
                whileHover={reduce ? undefined : { y: -3 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                onClick={() => setSelectedEvent(event.value)}
                className={`group relative flex h-full flex-col rounded-2xl border p-4 text-left transition-colors ${
                  active
                    ? "border-(--sage) bg-(--sage-soft) shadow-(--shadow)"
                    : "border-(--line) bg-(--panel-soft)/50 hover:border-(--line-strong) hover:bg-(--panel)"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold tracking-tight text-(--foreground)">
                    {event.label}
                  </p>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                      active
                        ? "border-(--sage) bg-(--sage) text-white"
                        : "border-(--line) bg-(--panel) text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                </div>
                {event.description ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-(--muted)">
                    {event.description}
                  </p>
                ) : null}
                <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                  <p className="text-lg font-bold tracking-tight text-(--sage)">{event.amount}</p>
                  {confirmedCount > 0 ? (
                    <span className="badge badge-sage text-[0.65rem]">
                      {confirmedCount} distance{confirmedCount > 1 ? "s" : ""} joined
                    </span>
                  ) : null}
                </div>
              </motion.button>
            );
          })}
        </div>
        <FieldError message={errors.eventSlug} />

        <div className="mt-5">
          <p className="field-label">Distance</p>
          <div className="flex flex-wrap gap-2">
            {distanceOptions.map((distance) => {
              const taken = registeredKeys.has(`${selectedEvent}::${distance}`);
              const pending = pendingByEventDistance.has(`${selectedEvent}::${distance}`);
              const active = selectedDistance === distance;
              return (
                <button
                  key={distance}
                  type="button"
                  disabled={taken}
                  onClick={() => setSelectedDistance(distance)}
                  className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    taken
                      ? "cursor-not-allowed border-(--line) bg-(--panel-soft) text-(--muted-soft) line-through opacity-70"
                      : active
                        ? "border-(--foreground) bg-(--foreground) text-(--on-accent) shadow-xs"
                        : "border-(--line) bg-(--panel) text-(--muted) hover:border-(--line-strong) hover:text-(--foreground)"
                  }`}
                >
                  {distance}
                  {pending && !taken ? (
                    <span className="ml-1.5 text-[0.65rem] font-medium opacity-80">· pay</span>
                  ) : null}
                  {taken ? (
                    <span className="ml-1.5 text-[0.65rem] font-medium no-underline">done</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <FieldError message={errors.distance} />
          {distanceAlreadyTaken ? (
            <p className="mt-2 text-xs text-[var(--danger)]">
              Already registered for this distance. Pick another distance or event — other events
              stay open.
            </p>
          ) : pendingSame ? (
            <p className="mt-2 text-xs text-(--sage)">
              Pending payment found for this distance — submit to resume checkout.
            </p>
          ) : null}
        </div>
      </SectionCard>

      {/* Shipping */}
      <SectionCard
        step="03"
        title="Medal delivery"
        subtitle="Where should we ship your finisher medal?"
        icon={Package}
        delay={0.1}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" required>
            <input
              aria-invalid={Boolean(errors.city)}
              className={inputClass}
              name="city"
              placeholder="Mumbai"
              required
            />
            <FieldError message={errors.city} />
          </Field>
          <Field label="State" required>
            <SearchableSelect
              emptyMessage="No state found. Try another search."
              invalid={Boolean(errors.state)}
              name="state"
              options={INDIAN_STATES}
              placeholder="Search state…"
              required
            />
            <FieldError message={errors.state} />
          </Field>
          <Field label="Pincode" required>
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
          <div className="hidden sm:block" />
          <div className="sm:col-span-2">
            <Field label="Shipping address" required>
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
          <div className="sm:col-span-2">
            <Field label="Landmark">
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--muted-soft)" />
                <input
                  aria-invalid={Boolean(errors.landmark)}
                  className={`${inputClass} pl-9`}
                  name="landmark"
                  placeholder="Near metro station, mall, etc."
                />
              </div>
              <FieldError message={errors.landmark} />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* Checkout bar */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="sticky bottom-3 z-20 overflow-hidden rounded-2xl border border-(--line) bg-(--panel)/95 shadow-(--shadow-hover) backdrop-blur-xl sm:bottom-6"
      >
        <div className="h-0.5 w-full bg-linear-to-r from-(--sage) via-emerald-400 to-indigo-500" />
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CreditCard className="h-4 w-4 text-(--sage)" strokeWidth={1.75} />
              <p className="text-sm font-semibold tracking-tight">
                {activeEvent?.label ?? "Event"}
              </p>
              <span className="badge text-[0.65rem]">{selectedDistance || "—"}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={message + status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-1 text-sm ${
                  status === "error"
                    ? "text-[var(--danger)]"
                    : status === "paid"
                      ? "text-[var(--sage)]"
                      : "text-(--muted)"
                }`}
              >
                {message}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-(--muted)">
                Total
              </p>
              <p className="text-2xl font-bold tracking-tight text-(--foreground)">
                {selectedAmount}
              </p>
            </div>
            <button
              className="btn btn-primary h-12 min-w-[10.5rem] gap-1.5 px-5 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                status === "creating" ||
                status === "paying" ||
                status === "paid" ||
                distanceAlreadyTaken
              }
              type="submit"
            >
              {status === "creating"
                ? "Creating…"
                : status === "paying"
                  ? "Paying…"
                  : status === "paid"
                    ? "Registered"
                    : pendingSame
                      ? "Resume payment"
                      : "Pay with UPI"}
              {status === "idle" || status === "error" ? (
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              ) : null}
            </button>
          </div>
        </div>
      </motion.div>
    </form>
  );
}
