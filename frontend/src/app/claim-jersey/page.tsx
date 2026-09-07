"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageShell } from "../components/app-shell";
import { getApiUrl, readApiError } from "../../lib/api";

const TSHIRT_IMAGE_URL =
  "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/newsletter/ng4hz1fuxpkipsauk2rc.png";

type WinnerData = {
  registrationId: string;
  bibNumber: string;
  runnerName: string;
  userEmail: string;
  phone: string;
  eventTitle: string;
  eventSlug: string;
  category: string;
  rank: string;
  finishTime: string;
  tshirtSize: string | null;
  tshirtSubmittedAt: string | null;
  shipping: {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
};

const SIZES = [
  { size: "S", chest: "36\" – 38\"", fit: "Slim / Regular" },
  { size: "M", chest: "38\" – 40\"", fit: "Standard Active" },
  { size: "L", chest: "40\" – 42\"", fit: "Most Popular Fit" },
  { size: "XL", chest: "42\" – 44\"", fit: "Comfort Relaxed" },
  { size: "XXL", chest: "44\" – 46\"", fit: "Plus Comfort" },
];

function ClaimJerseyContent() {
  const searchParams = useSearchParams();
  const bibFromQuery = searchParams.get("bib") || "";

  const [bibInput, setBibInput] = useState(bibFromQuery);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [winner, setWinner] = useState<WinnerData | null>(null);

  // Form state
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingLine1, setShippingLine1] = useState("");
  const [shippingLine2, setShippingLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [editAddress, setEditAddress] = useState(false);

  async function searchByBib(bib: string) {
    if (!bib.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(getApiUrl(`/api/prizes/claim/${encodeURIComponent(bib.trim())}`));
      if (!res.ok) {
        const msg = await readApiError(res, "Could not find registration for this BIB number");
        throw new Error(msg);
      }
      const json = await res.json();
      const data: WinnerData = json.data;
      setWinner(data);
      if (data.tshirtSize) {
        setSelectedSize(data.tshirtSize);
      }
      setShippingName(data.shipping.name || data.runnerName || "");
      setShippingPhone(data.shipping.phone || data.phone || "");
      setShippingLine1(data.shipping.line1 || "");
      setShippingLine2(data.shipping.line2 || "");
      setShippingCity(data.shipping.city || "");
      setShippingState(data.shipping.state || "");
      setShippingPincode(data.shipping.pincode || "");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load winner information";
      setError(errorMsg);
      setWinner(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    if (!bibFromQuery) return;

    fetch(getApiUrl(`/api/prizes/claim/${encodeURIComponent(bibFromQuery.trim())}`))
      .then(async (res) => {
        if (!res.ok) {
          const msg = await readApiError(res, "Could not find registration for this BIB number");
          throw new Error(msg);
        }
        return res.json();
      })
      .then((json) => {
        if (!ignore) {
          const data: WinnerData = json.data;
          setWinner(data);
          if (data.tshirtSize) setSelectedSize(data.tshirtSize);
          setShippingName(data.shipping.name || data.runnerName || "");
          setShippingPhone(data.shipping.phone || data.phone || "");
          setShippingLine1(data.shipping.line1 || "");
          setShippingLine2(data.shipping.line2 || "");
          setShippingCity(data.shipping.city || "");
          setShippingState(data.shipping.state || "");
          setShippingPincode(data.shipping.pincode || "");
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const errorMsg = err instanceof Error ? err.message : "Failed to load winner information";
          setError(errorMsg);
          setWinner(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [bibFromQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!winner) return;
    if (!selectedSize) {
      setError("Please choose a T-Shirt size before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(getApiUrl(`/api/prizes/claim/${encodeURIComponent(winner.bibNumber)}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tshirtSize: selectedSize,
          shippingName: shippingName.trim(),
          shippingPhone: shippingPhone.trim(),
          shippingLine1: shippingLine1.trim(),
          shippingLine2: shippingLine2.trim(),
          shippingCity: shippingCity.trim(),
          shippingState: shippingState.trim(),
          shippingPincode: shippingPincode.trim(),
        }),
      });

      if (!res.ok) {
        const msg = await readApiError(res, "Failed to submit T-Shirt size");
        throw new Error(msg);
      }

      setSuccess(true);
      setWinner((prev) =>
        prev
          ? {
              ...prev,
              tshirtSize: selectedSize,
              tshirtSubmittedAt: new Date().toISOString(),
              shipping: {
                ...prev.shipping,
                name: shippingName,
                phone: shippingPhone,
                line1: shippingLine1,
                line2: shippingLine2,
                city: shippingCity,
                state: shippingState,
                pincode: shippingPincode,
              },
            }
          : null
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong while saving your details";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="min-h-[85vh] bg-[#070a0e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Top Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent p-6 sm:p-8 mb-8 text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-300 uppercase tracking-widest mb-4">
              🏆 OFFICIAL PODIUM FINISHER REWARD
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Claim Your Exclusive <span className="text-emerald-400">DRI-FIT Jersey</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Congratulations on placing in the top rankings of the National Leaderboard! Select your size
              below so our fulfillment team can dispatch your jersey.
            </p>
          </div>

          {/* BIB Search / Switcher if needed */}
          {!winner && !loading && (
            <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2">Enter Your BIB Number</h2>
              <p className="text-xs text-slate-400 mb-4">
                Enter your BIB number (e.g. SDC-628721) to load your podium finisher record.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  searchByBib(bibInput);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={bibInput}
                  onChange={(e) => setBibInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SDC-628721"
                  className="flex-1 rounded-xl bg-[#080d14] border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !bibInput.trim()}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 text-sm transition-all disabled:opacity-50"
                >
                  {loading ? "Searching..." : "Find My Reward"}
                </button>
              </form>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-12 text-center my-6">
              <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-300 font-medium">Verifying podium finisher record...</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 sm:p-5 mb-6 text-rose-200 text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-bold">Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 mb-8 text-center shadow-xl">
              <div className="w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3">
                ✓
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                T-Shirt Size Confirmed: Size {selectedSize}!
              </h2>
              <p className="text-sm text-emerald-200 max-w-md mx-auto mb-4">
                Thank you, <strong>{winner?.runnerName}</strong>! Your preference has been recorded directly
                in our fulfillment system. We will pack your custom DRI-FIT Jersey and dispatch it via
                courier with live tracking updates.
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700">
                <span>📦 Shipping to:</span>
                <span className="text-slate-200 font-medium">
                  {shippingLine1}, {shippingCity} ({shippingPincode})
                </span>
              </div>
            </div>
          )}

          {/* Winner Profile & Claim Form */}
          {winner && (
            <div className="space-y-6">
              {/* Podium Standing Card */}
              <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Athletes Podium Record
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {winner.runnerName}
                    </h2>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                      {winner.eventTitle} &bull; {winner.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-amber-500/10 border border-amber-500/40 rounded-xl px-3.5 py-1.5 text-xs font-black text-amber-300">
                      {winner.rank}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      BIB: <strong className="text-slate-200">{winner.bibNumber}</strong> &bull; Time:{" "}
                      <strong className="text-sky-400">{winner.finishTime}</strong>
                    </div>
                  </div>
                </div>

                {winner.tshirtSize && !success && (
                  <div className="mt-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
                    <span>
                      ✓ You have currently confirmed <strong>Size {winner.tshirtSize}</strong>.
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Submitted on {new Date(winner.tshirtSubmittedAt || "").toLocaleDateString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Jersey Showcase */}
              <div className="bg-[#0b1119] border border-slate-800 rounded-2xl p-6 text-center">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
                  Your Reward
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-3">
                  Official Mountain Run DRI-FIT Running Jersey
                </h3>
                <div className="relative w-full max-w-sm mx-auto h-56 sm:h-72 mb-3">
                  <Image
                    src={TSHIRT_IMAGE_URL}
                    alt="Mountain Run Technical Jersey"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Ultra-light technical moisture-wicking fabric &bull; Anti-chafing ergonomic fit &bull; Official
                  Mountain Run athlete branding
                </p>
              </div>

              {/* Selection Form */}
              <form onSubmit={handleSubmit} className="bg-[#0f1722] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                {/* Size Choice */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    1. Select Your T-Shirt Size <span className="text-rose-400">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    Choose the size that fits you best. Refer to the chest size measurements below:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {SIZES.map((item) => {
                      const isSelected = selectedSize === item.size;
                      return (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => setSelectedSize(item.size)}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all text-center ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-500/15 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]"
                              : "border-slate-800 bg-[#080d14] text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                          }`}
                        >
                          <span className="text-xl font-black text-white">{item.size}</span>
                          <span className="text-xs font-semibold text-emerald-400 mt-0.5">
                            {item.chest}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                            {item.fit}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="border-t border-slate-800/80 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-white">
                      2. Delivery Address Confirmation
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditAddress(!editAddress)}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      {editAddress ? "Cancel Edit" : "✎ Edit Address"}
                    </button>
                  </div>

                  {!editAddress ? (
                    <div className="bg-[#090e15] border border-slate-800/80 rounded-xl p-4 text-xs space-y-1">
                      <p className="font-bold text-white text-sm">{shippingName}</p>
                      <p className="text-slate-300">
                        {shippingLine1} {shippingLine2}
                      </p>
                      <p className="text-slate-300">
                        {shippingCity}, {shippingState} - <strong>{shippingPincode}</strong>
                      </p>
                      <p className="text-slate-400 mt-2">
                        📞 Phone: <span className="text-slate-200 font-medium">{shippingPhone}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#080d14] p-4 rounded-xl border border-slate-800">
                      <div>
                        <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={shippingName}
                          onChange={(e) => setShippingName(e.target.value)}
                          className="w-full bg-[#0f1722] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          className="w-full bg-[#0f1722] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          value={shippingLine1}
                          onChange={(e) => setShippingLine1(e.target.value)}
                          className="w-full bg-[#0f1722] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          className="w-full bg-[#0f1722] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          className="w-full bg-[#0f1722] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={shippingPincode}
                          onChange={(e) => setShippingPincode(e.target.value)}
                          className="w-full bg-[#0f1722] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !selectedSize}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 px-6 text-sm tracking-wide uppercase transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Saving to Database...
                      </>
                    ) : (
                      <>Confirm Size {selectedSize ? `(${selectedSize})` : ""} &amp; Claim Jersey →</>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2.5">
                    Your choice is instantly saved in our delivery dispatch system.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Quick Help Footer */}
          <div className="text-center mt-12 text-xs text-slate-500">
            <p>
              Need assistance? WhatsApp our support desk at{" "}
              <a href="https://wa.me/917518418960" className="text-emerald-400 font-semibold">
                +91 75184 18960
              </a>
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function ClaimJerseyPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="min-h-[70vh] flex items-center justify-center bg-[#070a0e]">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </PageShell>
      }
    >
      <ClaimJerseyContent />
    </Suspense>
  );
}
