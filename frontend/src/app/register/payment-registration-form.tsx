"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  activityTypes?: string[];
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
    activityTypes: ["running", "cycling", "walking"],
  },
  {
    label: "Independence Endurance Run",
    value: "independence-endurance-run",
    amount: "₹649",
    distances: ["5 km", "10 km", "25 km"],
    activityTypes: ["running", "cycling", "walking"],
  },
  {
    label: "Himalayan Winter Sprint",
    value: "himalayan-winter-sprint",
    amount: "₹399",
    distances: ["2 km", "5 km", "10 km"],
    activityTypes: ["running", "cycling", "walking"],
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

  return <p className="mt-1.5 text-xs font-medium text-(--danger)">{message}</p>;
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
  const router = useRouter();
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
  const [selectedActivity, setSelectedActivity] = useState("running");
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
    activityTypes: (row as { activityTypes?: string[] }).activityTypes ?? ["running"],
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
  const activityOptions = activeEvent?.activityTypes ?? ["running"];

  useEffect(() => {
    if (distanceFromQuery && distanceOptions.includes(distanceFromQuery)) {
      setSelectedDistance(distanceFromQuery);
      return;
    }
    if (!distanceOptions.includes(selectedDistance)) {
      setSelectedDistance(distanceOptions[0] ?? "");
    }
    if (!activityOptions.includes(selectedActivity)) {
      setSelectedActivity(activityOptions[0] ?? "running");
    }
  }, [distanceOptions, distanceFromQuery, selectedDistance, activityOptions, selectedActivity]);

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
      <div className="flex items-center justify-center rounded-2xl border border-(--line) bg-(--panel) px-4 py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-(--line-strong) border-t-(--sage)" />
          <p className="text-sm text-(--muted)">Checking your session\u2026</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="overflow-hidden rounded-2xl border border-(--line) bg-(--panel)">
        <div className="bg-gradient-to-r from-(--sage)/10 to-(--sage)/5 px-4 py-3 sm:px-5 sm:py-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-(--sage)">Account required</p>
        </div>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <h2 className="text-xl font-semibold tracking-tight text-(--foreground) sm:text-2xl">
            Sign in to continue
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-(--muted)">
            Create a free account with email and password. After sign-in you can register and pay with UPI.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link className="btn btn-primary" href="/sign-in">Sign in</Link>
            <Link className="btn btn-secondary" href="/sign-up">Create account</Link>
          </div>
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
  formData.set("activityType", selectedActivity);

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
          activityType: selectedActivity,
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
          setStatus("paying");
          setMessage("Payment captured. Verifying registration...");

          try {
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

            router.push("/dashboard");
          } catch (error) {
            setStatus("error");
            setMessage(getFriendlyErrorMessage(error));
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
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-(--line) bg-(--panel) p-4 sm:p-5"
      noValidate
    >
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Field label="Full name" required>
          <input
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className={`${inputClass} min-w-0`}
            defaultValue={defaultName}
            key={`name-${defaultName}`}
            name="name"
            placeholder="Your name"
            required
          />
          <FieldError message={errors.name} />
        </Field>

        <div className="min-w-0">
          <span className="field-label">Username</span>
          <div
            className={`${inputClass} flex min-w-0 items-center gap-2 bg-(--panel-soft) text-(--muted)`}
          >
            <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
            <span className="min-w-0 truncate font-medium text-(--foreground)">
              @{username}
            </span>
          </div>
          <input name="username" type="hidden" value={username} />
          <p className="mt-1.5 text-[0.7rem] leading-snug text-(--muted-soft)">
            From your account · not editable
          </p>
        </div>

        <Field label="Email" required>
          <input
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={`${inputClass} min-w-0 bg-(--panel-soft)`}
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
            className={`${inputClass} min-w-0 max-w-full`}
            name="eventSlug"
            onChange={(e) => setSelectedEvent(e.target.value)}
            required
            value={selectedEvent}
          >
            {events.map((event) => (
              <option key={event.value} value={event.value}>
                {event.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.eventSlug} />
        </Field>

        <Field label="Distance" required>
          <select
            aria-invalid={Boolean(errors.distance)}
            className={`${inputClass} min-w-0 max-w-full`}
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
            <p className="mt-1.5 text-xs leading-snug text-(--danger)">
              Already registered for this distance. Pick another distance or event.
            </p>
          ) : pendingSame ? (
            <p className="mt-1.5 text-xs leading-snug text-(--sage)">
              Pending payment — submit to resume checkout.
            </p>
          ) : null}
        </Field>

        {activityOptions.length > 1 ? (
          <Field label="Activity type">
            <div className="flex flex-wrap gap-2">
              {activityOptions.map((type) => (
                <label key={type}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    selectedActivity === type
                      ? "border-(--sage) bg-(--sage-soft) text-(--sage) shadow-sm"
                      : "border-(--line) bg-(--panel) text-(--muted) hover:border-(--line-strong) hover:text-(--foreground)"
                  }`}>
                  <input type="radio" className="sr-only" name="activityType" value={type}
                    checked={selectedActivity === type}
                    onChange={(e) => setSelectedActivity(e.target.value)} />
                  <span>{type === "running" ? "\u{1F3C3}" : type === "cycling" ? "\u{1F6B4}" : "\u{1F6B6}"}</span>
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </Field>
        ) : (
          <input type="hidden" name="activityType" value="running" />
        )}

        <Field label="City" required>
          <input
            aria-invalid={Boolean(errors.city)}
            autoComplete="address-level2"
            className={`${inputClass} min-w-0`}
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
            autoComplete="postal-code"
            className={`${inputClass} min-w-0`}
            inputMode="numeric"
            maxLength={6}
            name="pincode"
            placeholder="400050"
            required
          />
          <FieldError message={errors.pincode} />
        </Field>

        <div className="min-w-0 sm:col-span-2">
          <Field label="Shipping address" required>
            <input
              aria-invalid={Boolean(errors.address)}
              autoComplete="street-address"
              className={`${inputClass} min-w-0`}
              name="address"
              placeholder="House, street, area"
              required
            />
            <FieldError message={errors.address} />
          </Field>
        </div>

        <div className="min-w-0 sm:col-span-2">
          <Field label="Landmark">
            <input
              aria-invalid={Boolean(errors.landmark)}
              className={`${inputClass} min-w-0`}
              name="landmark"
              placeholder="Near metro station, mall, etc."
            />
            <FieldError message={errors.landmark} />
          </Field>
        </div>
      </div>

      <div className="mt-4 flex min-w-0 flex-col gap-2 rounded-xl border border-(--line) bg-(--sage-soft) p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-(--foreground)">
            <Lock className="h-3.5 w-3.5 text-(--sage)" strokeWidth={2} />
            Secure checkout
          </p>
          <p
            className={`mt-0.5 text-xs leading-snug ${
              status === "error" ? "text-(--danger)" : "text-(--muted)"
            }`}
          >
            {message}
          </p>
        </div>
        <p className="shrink-0 text-xl font-bold tracking-tight text-(--foreground) sm:text-right">
          {selectedAmount}
        </p>
      </div>

      <button
        className="btn btn-primary btn-full mt-3 min-h-[2.75rem] touch-manipulation text-sm disabled:cursor-not-allowed disabled:opacity-50"
        disabled={
          status === "creating" ||
          status === "paying" ||
          status === "paid" ||
          distanceAlreadyTaken
        }
        type="submit"
      >
        {status === "creating"
          ? "Creating order\u2026"
          : status === "paying"
            ? "Payment in progress\u2026"
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
        <div className="flex items-center justify-center rounded-2xl border border-(--line) bg-(--panel) px-4 py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-(--line-strong) border-t-(--sage)" />
            <p className="text-sm text-(--muted)">Loading form\u2026</p>
          </div>
        </div>
      }
    >
      <PaymentRegistrationFormInner />
    </Suspense>
  );
}
