"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
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
  distances: string[];
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
    distances: ["3 km", "5 km", "10 km", "21 km"],
  },
  {
    label: "Independence Endurance Run",
    value: "independence-endurance-run",
    amount: "₹649",
    distances: ["5 km", "10 km", "25 km"],
  },
  {
    label: "Himalayan Winter Sprint",
    value: "himalayan-winter-sprint",
    amount: "₹399",
    distances: ["2 km", "5 km", "10 km"],
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

function PaymentRegistrationFormInner() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const eventFromQuery = searchParams.get("event")?.trim() ?? "";
  const distanceFromQuery = searchParams.get("distance")?.trim() ?? "";

  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "paid" | "error">("idle");
  const [message, setMessage] = useState("Complete the form and continue to secure checkout.");
  const [events, setEvents] = useState<RegisterEventOption[]>(fallbackEvents);
  const [selectedEvent, setSelectedEvent] = useState(
    eventFromQuery || fallbackEvents[0].value,
  );
  const [selectedDistance, setSelectedDistance] = useState(distanceFromQuery || "");
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
        }>;

        const open = rows
          .filter((row) => row.registrationOpen !== false)
          .map((row) => ({
            label: row.title,
            value: row.slug,
            amount: `₹${Math.round(row.priceInPaise / 100)}`,
            distances: row.distances?.length ? row.distances : ["5 km"],
          }));

        if (cancelled || open.length === 0) {
          return;
        }

        setEvents(open);
        setSelectedEvent((prev) => {
          if (eventFromQuery && open.some((e) => e.value === eventFromQuery)) {
            return eventFromQuery;
          }
          return open.some((e) => e.value === prev) ? prev : open[0].value;
        });
      } catch {
        // keep fallback
      }
    }

    void loadOpenEvents();
    return () => {
      cancelled = true;
    };
  }, [eventFromQuery]);

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
    if (distanceFromQuery && distanceOptions.includes(distanceFromQuery)) {
      setSelectedDistance(distanceFromQuery);
      return;
    }
    if (!distanceOptions.includes(selectedDistance)) {
      setSelectedDistance(distanceOptions[0] ?? "");
    }
  }, [distanceOptions, distanceFromQuery, selectedDistance]);

  const selectedAmount = activeEvent?.amount ?? "₹499";
  const defaultName = profileName || user?.fullName || user?.firstName || "";
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
      if (
        reg.status === "CONFIRMED" ||
        reg.status === "COMPLETED" ||
        reg.payment?.status === "PAID"
      ) {
        set.add(`${reg.event.slug}::${reg.distance}`);
      }
    }
    return set;
  }, [existingRegs]);

  const pendingSame = useMemo(() => {
    return existingRegs.find(
      (reg) =>
        reg.event.slug === selectedEvent &&
        reg.distance === selectedDistance &&
        (reg.status === "PENDING_PAYMENT" || reg.payment?.status === "CREATED"),
    );
  }, [existingRegs, selectedEvent, selectedDistance]);

  const distanceAlreadyTaken = registeredKeys.has(`${selectedEvent}::${selectedDistance}`);

  if (!isLoaded) {
    return (
      <div className="card mt-8 p-10 text-center">
        <p className="text-sm text-[var(--muted)]">Checking your session…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="card mt-6 p-6 sm:mt-8 sm:p-8">
        <p className="eyebrow">Account required</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
          Sign in to continue
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
          Sign in with Google or email, then complete this form to register and pay with UPI.
        </p>
        <div className="btn-row mt-6">
          <Link className="btn btn-primary" href="/sign-in">
            Sign in
          </Link>
          <Link className="btn btn-secondary" href="/sign-up">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
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

          try {
            const me = await fetch(getApiUrl("/api/users/me"), {
              headers: authHeaders(token),
            });
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
            setMessage("Payment cancelled. You can try again.");
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
    <form onSubmit={handleSubmit} className="card mt-6 p-4 sm:mt-8 sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
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
          <div className={`${inputClass} flex items-center gap-2 bg-[var(--panel-soft)] text-[var(--muted)]`}>
            <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
            <span className="truncate font-medium text-[var(--foreground)]">@{username}</span>
          </div>
          <input name="username" type="hidden" value={username} />
          <p className="mt-1.5 text-[0.7rem] text-[var(--muted-soft)]">
            From your account · not editable
          </p>
        </div>

        <Field label="Email" required>
          <input
            aria-invalid={Boolean(errors.email)}
            className={`${inputClass} bg-[var(--panel-soft)]`}
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

        <Field label="Event" required>
          <select
            aria-invalid={Boolean(errors.eventSlug)}
            className={inputClass}
            name="eventSlug"
            onChange={(e) => setSelectedEvent(e.target.value)}
            required
            value={selectedEvent}
          >
            {events.map((event) => (
              <option key={event.value} value={event.value}>
                {event.label} · {event.amount}
              </option>
            ))}
          </select>
          <FieldError message={errors.eventSlug} />
        </Field>

        <Field label="Distance" required>
          <select
            aria-invalid={Boolean(errors.distance)}
            className={inputClass}
            name="distance"
            onChange={(e) => setSelectedDistance(e.target.value)}
            required
            value={selectedDistance}
          >
            <option value="">Select distance</option>
            {distanceOptions.map((distance) => {
              const taken = registeredKeys.has(`${selectedEvent}::${distance}`);
              return (
                <option disabled={taken} key={distance} value={distance}>
                  {distance}
                  {taken ? " (already registered)" : ""}
                </option>
              );
            })}
          </select>
          <FieldError message={errors.distance} />
          {distanceAlreadyTaken ? (
            <p className="mt-1.5 text-xs text-[var(--danger)]">
              Already registered for this distance. Pick another distance or event.
            </p>
          ) : pendingSame ? (
            <p className="mt-1.5 text-xs text-[var(--sage)]">
              Pending payment — submit to resume checkout.
            </p>
          ) : null}
        </Field>

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
            <input
              aria-invalid={Boolean(errors.landmark)}
              className={inputClass}
              name="landmark"
              placeholder="Near metro station, mall, etc."
            />
            <FieldError message={errors.landmark} />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Secure checkout</p>
          <p
            className={`mt-1 text-sm ${
              status === "error" ? "text-[var(--danger)]" : "text-[var(--muted)]"
            }`}
          >
            {message}
          </p>
        </div>
        <p className="text-2xl font-semibold tracking-tight">{selectedAmount}</p>
      </div>

      <button
        className="btn btn-primary btn-full mt-6 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={
          status === "creating" ||
          status === "paying" ||
          status === "paid" ||
          distanceAlreadyTaken
        }
        type="submit"
      >
        {status === "creating"
          ? "Creating order…"
          : status === "paying"
            ? "Payment in progress…"
            : status === "paid"
              ? "Paid"
              : pendingSame
                ? "Resume payment"
                : "Continue to payment"}
      </button>
    </form>
  );
}

export function PaymentRegistrationForm() {
  return (
    <Suspense
      fallback={
        <div className="card mt-8 p-10 text-center">
          <p className="text-sm text-[var(--muted)]">Loading form…</p>
        </div>
      }
    >
      <PaymentRegistrationFormInner />
    </Suspense>
  );
}
