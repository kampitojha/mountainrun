"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type FieldErrors, validateDemoProofForm } from "../../lib/validation";
import { Field, inputClass } from "./app-shell";

export function DemoProofForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.proof;
        return next;
      });
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (file) {
      formData.set("proof", file);
    } else {
      formData.delete("proof");
    }

    const fieldErrors = validateDemoProofForm(formData);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      setStatus("error");
      setMessage("Please fix the highlighted fields.");
      return;
    }

    setStatus("success");
    setMessage("Proof demo verified. Redirecting…");

    setTimeout(() => {
      router.push("/leaderboard");
    }, 1200);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input
            aria-invalid={Boolean(errors.name)}
            className={inputClass}
            defaultValue="Riya Mehta"
            name="name"
          />
          {errors.name ? (
            <p className="mt-1.5 text-xs text-[var(--danger)]">{errors.name}</p>
          ) : null}
        </Field>
        <Field label="Distance">
          <select
            aria-invalid={Boolean(errors.distance)}
            className={inputClass}
            defaultValue="10 km"
            name="distance"
          >
            <option value="5 km">5 km</option>
            <option value="10 km">10 km</option>
            <option value="21 km">21 km</option>
          </select>
          {errors.distance ? (
            <p className="mt-1.5 text-xs text-[var(--danger)]">{errors.distance}</p>
          ) : null}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Shipping address">
            <input
              aria-invalid={Boolean(errors.address)}
              className={inputClass}
              defaultValue="Bandra West, Mumbai, Maharashtra"
              name="address"
            />
            {errors.address ? (
              <p className="mt-1.5 text-xs text-[var(--danger)]">{errors.address}</p>
            ) : null}
          </Field>
        </div>
      </div>

      <label
        className={`mt-5 block cursor-pointer rounded-xl border border-dashed p-6 text-center transition ${
          errors.proof
            ? "border-[var(--danger)] bg-[var(--danger)]/5"
            : "border-[var(--line)] bg-[var(--panel-soft)] hover:border-[var(--line-strong)]"
        }`}
      >
        {file ? (
          <>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {(file.size / 1024).toFixed(1)} KB — click to change
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">Upload GPS activity proof</p>
            <p className="mt-1 text-xs text-[var(--muted)]">PNG, JPG, or PDF</p>
          </>
        )}
        <input
          accept="image/png,image/jpeg,application/pdf"
          className="sr-only"
          name="proof"
          onChange={handleFileChange}
          type="file"
        />
      </label>
      {errors.proof ? (
        <p className="mt-1.5 text-center text-xs text-[var(--danger)]">{errors.proof}</p>
      ) : null}

      {message ? (
        <p
          className={`mt-4 text-center text-sm ${
            status === "error" ? "text-[var(--danger)]" : "text-[var(--success)]"
          }`}
        >
          {message}
        </p>
      ) : null}

      <button
        className="btn btn-primary btn-full mt-5 disabled:opacity-50"
        disabled={status === "success"}
        type="submit"
      >
        {status === "success" ? "Verifying…" : "Submit proof demo"}
      </button>
    </form>
  );
}
