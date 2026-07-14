"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type FieldErrors, validateDemoProofForm } from "../../lib/validation";

type IconName = "upload" | "check";

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  const paths: Record<IconName, React.ReactNode> = {
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

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
    
    // Add file manually since type file is custom
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
    setMessage("Proof demo verified! Redirecting to leaderboard...");
    
    setTimeout(() => {
      router.push("/leaderboard");
    }, 1500);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border hairline bg-[var(--panel)] p-5 soft-shadow" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Full name
          <input
            className={`focus-ring mt-2 h-11 w-full rounded-lg border hairline bg-white px-3 text-sm ${
              errors.name ? "border-red-500" : ""
            }`}
            defaultValue="Riya Mehta"
            name="name"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </label>
        
        <label className="text-sm font-medium">
          Distance
          <select
            className={`focus-ring mt-2 h-11 w-full rounded-lg border hairline bg-white px-3 text-sm ${
              errors.distance ? "border-red-500" : ""
            }`}
            defaultValue="10K"
            name="distance"
          >
            <option value="5K">5K</option>
            <option value="10K">10K</option>
            <option value="21K">21K</option>
          </select>
          {errors.distance && <p className="mt-1 text-xs text-red-600">{errors.distance}</p>}
        </label>
        
        <label className="text-sm font-medium md:col-span-2">
          Shipping address
          <input
            className={`focus-ring mt-2 h-11 w-full rounded-lg border hairline bg-white px-3 text-sm ${
              errors.address ? "border-red-500" : ""
            }`}
            defaultValue="Bandra West, Mumbai, Maharashtra"
            name="address"
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
        </label>
      </div>

      <label
        className={`mt-4 block cursor-pointer rounded-lg border border-dashed p-6 text-center transition ${
          errors.proof
            ? "border-red-500 bg-red-50/50"
            : "border-[var(--accent)] bg-[var(--accent-soft)]/45 hover:bg-[var(--accent-soft)]"
        }`}
      >
        {file ? (
          <div className="flex flex-col items-center justify-center">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--teal-soft)] text-[var(--teal)]">
              <Icon name="check" className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{file.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
          </div>
        ) : (
          <>
            <Icon name="upload" className="mx-auto h-7 w-7 text-[var(--accent-dark)]" />
            <p className="mt-3 text-sm font-semibold">Upload GPS activity proof</p>
            <p className="mt-1 text-xs text-[var(--muted)]">PNG, JPG, or PDF from your running app</p>
          </>
        )}
        <input
          className="sr-only"
          name="proof"
          onChange={handleFileChange}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
        />
      </label>
      {errors.proof && <p className="mt-1 text-xs text-red-600 text-center">{errors.proof}</p>}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Payment", "Paid", "success"],
          ["Proof", "In review", "accent"],
          ["Certificate", "Queued", "muted"],
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-lg border hairline bg-white p-4">
            <p className="text-xs text-[var(--muted)]">{label}</p>
            <p
              className={`mt-2 text-sm font-semibold ${
                tone === "success"
                  ? "text-[var(--success)]"
                  : tone === "accent"
                  ? "text-[var(--accent-dark)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {message && (
        <p
          className={`mt-4 text-sm text-center ${
            status === "error" ? "text-red-600" : "text-green-600 font-semibold"
          }`}
        >
          {message}
        </p>
      )}

      <button
        className="focus-ring mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-60"
        type="submit"
        disabled={status === "success"}
      >
        {status === "success" ? "Verifying..." : "Submit proof demo"}
      </button>
    </form>
  );
}
