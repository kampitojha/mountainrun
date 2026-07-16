"use client";

import { useState } from "react";
import { Field, inputClass } from "../components/app-shell";
import { type FieldErrors, validateAdminEventForm } from "../../lib/validation";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">{message}</p>;
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

    setMessage(
      `Event "${String(formData.get("title")).trim()}" saved (demo). Connect API to persist.`,
    );
  }

  return (
    <form
      action={handleSubmit}
      className="card p-6"
      id="new-event"
      noValidate
    >
      <p className="eyebrow">Create</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">New event</h2>
      <div className="mt-6 grid gap-4">
        <Field label="Event title">
          <input
            aria-invalid={Boolean(errors.title)}
            className={inputClass}
            name="title"
            placeholder="City Night 10 km"
            required
          />
          <FieldError message={errors.title} />
        </Field>
        <Field label="Distance options">
          <input
            aria-invalid={Boolean(errors.distances)}
            className={inputClass}
            name="distances"
            placeholder="5 km, 10 km, 21 km"
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
        <p
          className={`mt-4 text-sm ${
            Object.keys(errors).length ? "text-[var(--danger)]" : "text-[var(--muted)]"
          }`}
        >
          {message}
        </p>
      ) : null}
      <button className="btn btn-primary btn-full mt-6" type="submit">
        Save event
      </button>
    </form>
  );
}
