"use client";

import { useState } from "react";
import { Field, inputClass, primaryLinkClass } from "../components/app-shell";
import { type FieldErrors, validateAdminEventForm } from "../../lib/validation";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export function AdminEventForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");

  function handleSubmit(formData: FormData) {
    const fieldErrors = validateAdminEventForm(formData);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      setMessage("Please fix the highlighted fields.");
      return;
    }

    setMessage(`Event "${String(formData.get("title")).trim()}" saved (demo). Connect API to persist.`);
  }

  return (
    <form action={handleSubmit} className="rounded-lg border hairline bg-[var(--panel)] p-5" id="new-event" noValidate>
      <h2 className="text-lg font-semibold">New event</h2>
      <div className="mt-5 grid gap-4">
        <Field label="Event title">
          <input
            aria-invalid={Boolean(errors.title)}
            className={inputClass}
            name="title"
            placeholder="City Night 10K"
            required
          />
          <FieldError message={errors.title} />
        </Field>
        <Field label="Distance options">
          <input
            aria-invalid={Boolean(errors.distances)}
            className={inputClass}
            name="distances"
            placeholder="5K, 10K, 21K"
            required
          />
          <FieldError message={errors.distances} />
        </Field>
        <Field label="Price (INR)">
          <input
            aria-invalid={Boolean(errors.price)}
            className={inputClass}
            inputMode="numeric"
            name="price"
            placeholder="499"
            required
          />
          <FieldError message={errors.price} />
        </Field>
      </div>
      {message ? (
        <p className={`mt-4 text-sm ${Object.keys(errors).length ? "text-red-600" : "text-[var(--muted)]"}`}>
          {message}
        </p>
      ) : null}
      <button className={`${primaryLinkClass} mt-5 w-full`} type="submit">
        Save event
      </button>
    </form>
  );
}
