"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Field, inputClass } from "../components/app-shell";
import { PhoneInput } from "../components/phone-input";
import { SearchableSelect } from "../components/searchable-select";
import { authHeaders, getApiUrl, readApiError } from "../../lib/api";
import { INDIAN_STATES } from "../../lib/indian-states";
import { asString, type FieldErrors, validateRegistrationForm } from "../../lib/validation";

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

type RegisterEventOption = {
  label: string;
  value: string;
  amount: string;
  distances: string[];
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

export function PaymentRegistrationForm() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "paid" | "error">("idle");
  const [message, setMessage] = useState("Complete the form and continue to secure checkout.");
  const [events, setEvents] = useState<RegisterEventOption[]>(fallbackEvents);
  const [selectedEvent, setSelectedEvent] = useState(fallbackEvents[0].value);
  const [selectedDistance, setSelectedDistance] = useState(fallbackEvents[0].distances[0] ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

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

  const defaultName = user?.fullName ?? user?.firstName ?? "";
  const defaultUsername = user?.username ?? "";
  const defaultEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const defaultPhone = user?.primaryPhoneNumber?.phoneNumber ?? "";

  if (!isLoaded) {
    return (
      <div className="card mt-10 p-10 text-center">
        <p className="text-sm text-[var(--muted)]">Checking your session…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="card mt-6 p-5 sm:mt-10 sm:p-10">
        <p className="eyebrow">Account required</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
          Sign in to continue
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
          Create a free account with email and password. After sign-in you can register
          and pay with UPI.
        </p>
        <div className="btn-row mt-6 sm:mt-8">
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
    const fieldErrors = validateRegistrationForm(formData);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      setStatus("error");
      setMessage("Please fix the highlighted fields and try again.");
      return;
    }

    if (!isSignedIn) {
      setStatus("error");
      setMessage("Please sign in before registering for an event.");
      return;
    }

    setStatus("creating");
    setMessage("Creating registration and secure Razorpay order…");

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
          username: formData.get("username"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          eventSlug: formData.get("eventSlug"),
          distance: formData.get("distance"),
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
      setMessage("Checkout opened. Complete payment with UPI.");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: "Mountain Run",
        description: `Registration ${order.bibNumber}`,
        order_id: order.orderId,
        prefill: {
          name: asString(formData.get("name")),
          email: asString(formData.get("email")),
          contact: asString(formData.get("phone")),
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        theme: { color: "#0a0a0a" },
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
    <form onSubmit={handleSubmit} className="card mt-6 p-4 sm:mt-10 sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
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
        <Field label="Username">
          <input
            aria-invalid={Boolean(errors.username)}
            className={inputClass}
            defaultValue={defaultUsername}
            name="username"
            placeholder="runner123"
            required
          />
          <FieldError message={errors.username} />
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
          <PhoneInput defaultValue={defaultPhone} invalid={Boolean(errors.phone)} />
          <FieldError message={errors.phone} />
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
              <option key={event.value} value={event.value}>
                {event.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.eventSlug} />
        </Field>
        <Field label="Distance">
          <select
            aria-invalid={Boolean(errors.distance)}
            className={inputClass}
            name="distance"
            onChange={(event) => setSelectedDistance(event.target.value)}
            required
            value={selectedDistance}
          >
            <option value="">Select distance</option>
            {distanceOptions.map((distance) => (
              <option key={distance} value={distance}>
                {distance}
              </option>
            ))}
          </select>
          <FieldError message={errors.distance} />
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
        <div className="sm:col-span-2">
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
        disabled={status === "creating" || status === "paying" || status === "paid"}
        type="submit"
      >
        {status === "creating"
          ? "Creating order…"
          : status === "paying"
            ? "Payment in progress…"
            : status === "paid"
              ? "Paid"
              : "Continue to payment"}
      </button>
    </form>
  );
}
