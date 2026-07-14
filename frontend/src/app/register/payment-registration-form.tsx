"use client";

import { useMemo, useState } from "react";
import { Field, inputClass, primaryLinkClass } from "../components/app-shell";

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

export function PaymentRegistrationForm() {
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "paid" | "error">("idle");
  const [message, setMessage] = useState("Fill details and continue to Razorpay Checkout.");
  const [selectedEvent, setSelectedEvent] = useState(events[0].value);

  const selectedAmount = useMemo(
    () => events.find((event) => event.value === selectedEvent)?.amount ?? "Rs. 499",
    [selectedEvent],
  );

  async function handleSubmit(formData: FormData) {
    setStatus("creating");
    setMessage("Creating registration and secure Razorpay order...");

    try {
      const registrationResponse = await fetch(`${API_URL}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (!verifyResponse.ok) {
            throw new Error("Payment captured but verification failed");
          }

          setStatus("paid");
          setMessage("Payment verified. Registration confirmed.");
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
    <form action={handleSubmit} className="mt-8 rounded-lg border hairline bg-[var(--panel)] p-5 soft-shadow">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name">
          <input className={inputClass} name="name" placeholder="Your name" required />
        </Field>
        <Field label="Email">
          <input className={inputClass} name="email" placeholder="you@example.com" type="email" required />
        </Field>
        <Field label="Phone">
          <input className={inputClass} name="phone" placeholder="+91 98765 43210" required />
        </Field>
        <Field label="Distance">
          <select className={inputClass} name="distance" required>
            <option>5K</option>
            <option>10K</option>
            <option>21K</option>
          </select>
        </Field>
        <Field label="Event">
          <select
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
        </Field>
        <Field label="City">
          <input className={inputClass} name="city" placeholder="Mumbai" required />
        </Field>
        <Field label="State">
          <input className={inputClass} name="state" placeholder="Maharashtra" required />
        </Field>
        <Field label="Pincode">
          <input className={inputClass} name="pincode" placeholder="400050" required />
        </Field>
        <div className="md:col-span-2">
          <Field label="Shipping address">
            <input className={inputClass} name="address" placeholder="House, street, area" required />
          </Field>
        </div>
      </div>
      <div className="mt-5 rounded-lg border hairline bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Pay securely with Razorpay</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{selectedAmount}</p>
        </div>
      </div>
      <button className={`${primaryLinkClass} mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60`} disabled={status === "creating" || status === "paying"} type="submit">
        {status === "creating" ? "Creating order..." : status === "paying" ? "Payment in progress..." : status === "paid" ? "Paid" : "Continue to UPI payment"}
      </button>
    </form>
  );
}
