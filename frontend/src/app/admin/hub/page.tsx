"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";
import {
  UserPlus,
  FileCheck2,
  Truck,
  FileSpreadsheet,
  Calendar,
  Trophy,
  Image as ImageIcon,
  CheckCircle2,
  Shirt,
  Search,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Send,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Download,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";

/* ── Toast notification system ───────────────────────────── */
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl text-sm font-medium min-w-[280px] max-w-md transition-all ${
            t.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-200"
              : t.type === "error"
              ? "border-rose-500/30 bg-rose-950/90 text-rose-200"
              : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : t.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-400" />
            )}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const toast = useCallback((type: Toast["type"], message: string, duration = 4500) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);
  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return { toasts, toast, dismiss };
}

/* ── Tab definitions ─────────────────────────────────────── */
type TabId =
  | "manual-reg"
  | "certificate"
  | "tracking"
  | "courier-excel"
  | "events"
  | "leaderboard"
  | "gallery"
  | "proof"
  | "tshirts";

interface TabMeta {
  id: TabId;
  label: string;
  sub: string;
  icon: any;
  color: string;
  badge?: string;
}

const TABS: TabMeta[] = [
  { id: "manual-reg",    label: "1. Manual Reg",         sub: "Offline & UPI Entry",     icon: UserPlus,        color: "#10b981" },
  { id: "certificate",   label: "2. Edit Participant",   sub: "Correct Name & Distance", icon: FileCheck2,      color: "#3b82f6" },
  { id: "tracking",      label: "3. Bulk Tracking Emails", sub: "Dispatch via CSV / Paste", icon: Truck,       color: "#8b5cf6" },
  { id: "courier-excel", label: "4. Courier Excel",      sub: "Delivery Manifest (.csv)", icon: FileSpreadsheet, color: "#06b6d4" },
  { id: "events",        label: "5. Events",             sub: "Posters, Pricing & Setup", icon: Calendar,        color: "#f59e0b" },
  { id: "leaderboard",   label: "6. Leaderboard Control", sub: "Edit Ranks & Add Dummy",  icon: Trophy,          color: "#eab308" },
  { id: "gallery",       label: "7. Gallery",            sub: "Community Showcase",      icon: ImageIcon,       color: "#ec4899" },
  { id: "proof",         label: "8. WhatsApp Proof",     sub: "Manual Verification",     icon: CheckCircle2,    color: "#14b8a6" },
  { id: "tshirts",       label: "9. T-Shirt Sizes",      sub: "Podium Winner Claims",    icon: Shirt,           color: "#f97316" },
];

export default function AdminHubPage() {
  const { getToken } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("manual-reg");
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Load available events
  const loadEvents = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await adminFetch<{ data: any[] }>("/api/admin/events", token);
      setEvents(res.data || []);
    } catch (e: any) {
      toast("error", `Failed to load events: ${e.message}`);
    } finally {
      setLoadingEvents(false);
    }
  }, [getToken, toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="admin-page p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* ── Top Header ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--line)] bg-gradient-to-r from-[var(--panel)] via-[var(--panel-soft)] to-[var(--panel)] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> All-in-One Organizer Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              Admin Command Center • 9 Controls
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">
              Unified operational control center for manual registrations, participant name & distance corrections, courier tracking, delivery sheets, events, leaderboards, gallery, WhatsApp proofs, and winner jerseys.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => loadEvents()}
              disabled={loadingEvents}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--line)] text-[var(--foreground)] transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingEvents ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
            >
              Dashboard Overview <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── 9 Navigation Tabs ──────────────────────────────── */}
        <div className="mt-6 pt-6 border-t border-[var(--line)] flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg shadow-black/20 scale-[1.02]"
                    : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--line-strong)]"
                }`}
              >
                <Icon
                  className="w-4 h-4 transition-transform group-hover:scale-110"
                  style={{ color: isActive ? "var(--background)" : tab.color }}
                />
                <div className="flex flex-col text-left">
                  <span className="leading-tight font-bold">{tab.label}</span>
                  <span className="text-[10px] opacity-75 font-normal">{tab.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Tab Content ───────────────────────────────── */}
      <div className="transition-all duration-200">
        {activeTab === "manual-reg" && (
          <TabManualRegistration events={events} toast={toast} getToken={getToken} />
        )}
        {activeTab === "certificate" && (
          <TabCertificateEditor events={events} toast={toast} getToken={getToken} />
        )}
        {activeTab === "tracking" && (
          <TabTrackingDispatch toast={toast} getToken={getToken} />
        )}
        {activeTab === "courier-excel" && (
          <TabCourierExcel events={events} toast={toast} getToken={getToken} />
        )}
        {activeTab === "events" && (
          <TabEventManagement events={events} onRefresh={loadEvents} toast={toast} getToken={getToken} />
        )}
        {activeTab === "leaderboard" && (
          <TabLeaderboardManager events={events} toast={toast} getToken={getToken} />
        )}
        {activeTab === "gallery" && (
          <TabGalleryManager toast={toast} getToken={getToken} />
        )}
        {activeTab === "proof" && (
          <TabManualProof toast={toast} getToken={getToken} />
        )}
        {activeTab === "tshirts" && (
          <TabTshirtManager events={events} toast={toast} getToken={getToken} />
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   TAB 1: 📝 MANUAL REGISTRATION
===================================================================== */
function TabManualRegistration({
  events,
  toast,
  getToken,
}: {
  events: any[];
  toast: any;
  getToken: any;
}) {
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventId, setEventId] = useState("");
  const [distance, setDistance] = useState("");
  const [activityType, setActivityType] = useState("running");
  const [amountRupees, setAmountRupees] = useState("449");
  const [adminNote, setAdminNote] = useState("Manual payment verified via WhatsApp");
  const [sendEmail, setSendEmail] = useState(true);

  // Shipping
  const [shippingLine1, setShippingLine1] = useState("");
  const [shippingLine2, setShippingLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");

  const activeEvent = events.find((e) => e.id === eventId) || events[0];

  useEffect(() => {
    if (activeEvent && !eventId) {
      setEventId(activeEvent.id);
      setDistance(activeEvent.distances?.[0] || "5 km");
      setAmountRupees(String((activeEvent.priceInPaise || 44900) / 100));
    }
  }, [activeEvent, eventId]);

  function handleEventChange(id: string) {
    setEventId(id);
    const ev = events.find((e) => e.id === id);
    if (ev) {
      setDistance(ev.distances?.[0] || "5 km");
      setAmountRupees(String((ev.priceInPaise || 44900) / 100));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast("error", "Name, email and phone number are required!");
      return;
    }
    if (!shippingLine1.trim() || !shippingCity.trim() || !shippingPincode.trim()) {
      toast("error", "Complete shipping address (Address line, City, Pincode) is required!");
      return;
    }

    setLoading(true);
    setSuccessResult(null);

    try {
      const token = await getToken();
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        eventId,
        distance,
        activityType,
        shippingName: name.trim(),
        shippingPhone: phone.trim(),
        shippingLine1: shippingLine1.trim(),
        shippingLine2: shippingLine2.trim() || null,
        shippingCity: shippingCity.trim(),
        shippingState: shippingState.trim() || "India",
        shippingPincode: shippingPincode.trim(),
        amountInPaise: Math.round(Number(amountRupees || 0) * 100),
        adminNote: adminNote.trim(),
        sendEmail,
      };

      const res: any = await adminFetch("/api/admin/manual-registration", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccessResult(res.data);
      toast("success", `Runner registered successfully! BIB: ${res.data.bibNumber}`);

      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setShippingLine1("");
      setShippingLine2("");
      setShippingCity("");
      setShippingState("");
      setShippingPincode("");
    } catch (err: any) {
      toast("error", err.message || "Failed to create registration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Manual Runner Registration
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Add offline/UPI runners to database, auto-assign unique BIBs, and send confirmation emails.
            </p>
          </div>
        </div>

        {/* Success Card */}
        {successResult && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-base text-emerald-400">
              <CheckCircle2 className="w-5 h-5" /> Registration Confirmed!
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div>
                <span className="text-emerald-400/70 block">Generated BIB</span>
                <span className="font-mono text-base font-bold text-white">{successResult.bibNumber}</span>
              </div>
              <div>
                <span className="text-emerald-400/70 block">Distance</span>
                <span className="font-semibold text-white">{successResult.registration?.distance}</span>
              </div>
              <div>
                <span className="text-emerald-400/70 block">Status</span>
                <span className="font-semibold text-emerald-300">CONFIRMED (PAID)</span>
              </div>
              <div>
                <span className="text-emerald-400/70 block">Email Delivery</span>
                <span className="font-semibold text-white">
                  {successResult.emailSent ? "Sent Successfully ✅" : "Skipped / Failed ⚠️"}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Runner & Event */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                1. Runner & Event Info
              </h3>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Runner full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="runner@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Select Event *
                </label>
                <select
                  value={eventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Distance Category *
                  </label>
                  <select
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  >
                    {(activeEvent?.distances || ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"]).map(
                      (d: string) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  >
                    <option value="running">Running 🏃</option>
                    <option value="cycling">Cycling 🚴</option>
                    <option value="walking">Walking 🚶</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Admin Note
                  </label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: Courier Shipping Address */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                2. Shipping Address for Medal Delivery
              </h3>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House / Flat / Street address, Landmark"
                  value={shippingLine1}
                  onChange={(e) => setShippingLine1(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Apartment / Area (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Area / Locality (optional)"
                  value={shippingLine2}
                  onChange={(e) => setShippingLine2(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit PIN code"
                    value={shippingPincode}
                    onChange={(e) => setShippingPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--foreground)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                  />
                  <span>Send official registration confirmation email with BIB immediately</span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Creating Registration...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Registration & Confirm Entry
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================================
   TAB 2: 👤 PARTICIPANT DIRECTORY & INFO CORRECTIONS
===================================================================== */
function TabCertificateEditor({ events, toast, getToken }: { events: any[]; toast: any; getToken: any }) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedReg, setSelectedReg] = useState<any>(null);

  // Core participant edit fields
  const [runnerName, setRunnerName] = useState("");
  const [distance, setDistance] = useState("");
  const [bibNumber, setBibNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("CONFIRMED");
  const [adminNote, setAdminNote] = useState("");

  // Shipping address fields
  const [shippingLine1, setShippingLine1] = useState("");
  const [shippingLine2, setShippingLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");

  // Post-race / Certificate fields (kept strictly separate)
  const [finishTimeInput, setFinishTimeInput] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingCert, setSavingCert] = useState(false);
  const [sendingCertEmail, setSendingCertEmail] = useState(false);

  function formatSecs(sec: number | null | undefined): string {
    if (!sec) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!search.trim()) return;

    setSelectedReg(null);
    setSearching(true);
    try {
      const token = await getToken();
      const term = encodeURIComponent(search.trim());
      const res = await adminFetch<{ data: any[] }>(
        `/api/admin/registrations?q=${term}&search=${term}&pageSize=20`,
        token
      );
      setResults(res.data || []);
      if (!res.data?.length) {
        toast("info", "No participant found with this search term");
      }
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setSearching(false);
    }
  }

  function selectRegistration(reg: any) {
    setSelectedReg(reg);
    setRunnerName(reg.shippingName || reg.user?.name || "");
    setDistance(reg.distance || "");
    setBibNumber(reg.bibNumber || "");
    setEmail(reg.user?.email || "");
    setPhone(reg.shippingPhone || reg.user?.phone || "");
    setStatus(reg.status || "CONFIRMED");
    setAdminNote(reg.adminNote || "");

    // Shipping address
    setShippingLine1(reg.shippingLine1 || "");
    setShippingLine2(reg.shippingLine2 || "");
    setShippingCity(reg.shippingCity || "");
    setShippingState(reg.shippingState || "");
    setShippingPincode(reg.shippingPincode || "");

    // Race finish time
    setFinishTimeInput(formatSecs(reg.finishTimeSeconds));
  }

  // Find matching event for distance options
  const matchedEvent = selectedReg
    ? events.find((e) => e.id === selectedReg.eventId || e.title === selectedReg.event?.title)
    : null;
  const availableDistances = matchedEvent?.distances || selectedReg?.event?.distances || [
    "1.6 km",
    "3.2 km",
    "5 km",
    "10 km",
    "21 km",
  ];

  // 1. PRIMARY ACTION: Save Participant Info (DOES NOT generate or send certificate!)
  async function handleSaveParticipantDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReg) return;

    if (!runnerName.trim()) {
      toast("error", "Runner full name cannot be empty!");
      return;
    }
    if (!distance.trim()) {
      toast("error", "Distance category is required!");
      return;
    }

    setSavingDetails(true);
    try {
      const token = await getToken();

      const payload = {
        runnerName: runnerName.trim(),
        shippingName: runnerName.trim(),
        distance: distance.trim(),
        bibNumber: bibNumber.trim().toUpperCase(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        shippingPhone: phone.trim() || undefined,
        status,
        shippingLine1: shippingLine1.trim() || undefined,
        shippingLine2: shippingLine2.trim() || null,
        shippingCity: shippingCity.trim() || undefined,
        shippingState: shippingState.trim() || undefined,
        shippingPincode: shippingPincode.trim() || undefined,
        adminNote: adminNote.trim() || undefined,
      };

      const updateRes: any = await adminFetch(`/api/admin/registrations/${selectedReg.id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast("success", "✓ Participant details (Name, Distance, Contact, Address) updated successfully!");

      // Update state without touching certificates
      setSelectedReg((prev: any) => ({
        ...prev,
        ...updateRes.data,
        shippingName: runnerName.trim(),
        distance: distance.trim(),
        bibNumber: updateRes.data?.bibNumber || bibNumber.trim().toUpperCase(),
        user: {
          ...prev.user,
          name: runnerName.trim(),
          email: email.trim() || prev.user?.email,
          phone: phone.trim() || prev.user?.phone,
        },
      }));
    } catch (err: any) {
      toast("error", `Update failed: ${err.message}`);
    } finally {
      setSavingDetails(false);
    }
  }

  // 2. SEPARATE ACTION: Regenerate / Issue Certificate (Only when explicitly requested post-race)
  async function handleRegenerateCertificate() {
    if (!selectedReg) return;
    setSavingCert(true);
    try {
      const token = await getToken();

      // If finish time was typed, save it first
      let finishSeconds: number | null = null;
      if (finishTimeInput.trim()) {
        const parts = finishTimeInput.split(":").map(Number);
        if (parts.length === 3) finishSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) finishSeconds = parts[0] * 60 + parts[1];
        else if (parts.length === 1 && !isNaN(parts[0])) finishSeconds = parts[0];

        await adminFetch(`/api/admin/registrations/${selectedReg.id}`, token, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finishTimeSeconds: finishSeconds, proofStatus: "APPROVED" }),
        });
      }

      // Generate or re-generate certificate
      const certRes: any = await adminFetch(
        `/api/admin/registrations/${selectedReg.id}/certificate`,
        token,
        { method: "POST" }
      );

      toast("success", "✓ Certificate generated / re-issued with updated name and distance!");

      setSelectedReg((prev: any) => ({
        ...prev,
        finishTimeSeconds: finishSeconds ?? prev.finishTimeSeconds,
        certificate: certRes?.data?.certificate || prev.certificate,
      }));
    } catch (err: any) {
      toast("error", `Certificate generation failed: ${err.message}`);
    } finally {
      setSavingCert(false);
    }
  }

  // 3. SEPARATE ACTION: Send Certificate Email
  async function handleSendCertEmail() {
    if (!selectedReg?.certificate?.id) {
      toast("error", "No certificate found to email. Generate certificate first.");
      return;
    }
    setSendingCertEmail(true);
    try {
      const token = await getToken();
      await adminFetch(`/api/admin/certificates/${selectedReg.certificate.id}/send`, token, {
        method: "POST",
      });
      toast("success", `Certificate email dispatched to ${selectedReg.user?.email || email}!`);
    } catch (err: any) {
      toast("error", `Email sending failed: ${err.message}`);
    } finally {
      setSendingCertEmail(false);
    }
  }

  const isPreRace = !selectedReg?.finishTimeSeconds && selectedReg?.proofUpload?.status !== "APPROVED";

  return (
    <div className="space-y-6">
      {/* ── Guidance Banner ─────────────────────────────────── */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-200">
              Participant Info & Registration Corrections
            </h3>
            <p className="text-xs text-blue-300/80 mt-0.5 max-w-2xl leading-relaxed">
              Correct participant name typos, change distance category (e.g. 5 km to 10 km), update phone numbers, and fix courier delivery addresses at any time. Changes save directly without prematurely generating or emailing certificates.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm space-y-6">
        {/* Search Bar */}
        <div>
          <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
            Search Participant to Edit
          </label>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search by BIB number, runner name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-blue-500 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
            </button>
          </form>
        </div>

        {/* Search Results list */}
        {results.length > 0 && !selectedReg && (
          <div className="border border-[var(--line)] rounded-xl overflow-hidden divide-y divide-[var(--line)]">
            <div className="bg-[var(--background)] px-4 py-2.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              Search Results ({results.length} found) — Click to Edit:
            </div>
            {results.map((r) => {
              const hasFinished = Boolean(r.finishTimeSeconds || r.proofUpload?.status === "APPROVED");
              return (
                <div
                  key={r.id}
                  onClick={() => selectRegistration(r)}
                  className="p-3.5 flex items-center justify-between hover:bg-[var(--line)]/50 cursor-pointer transition"
                >
                  <div>
                    <div className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                      {r.shippingName || r.user?.name}
                      <span className="font-mono text-blue-400 text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {r.bibNumber}
                      </span>
                      {hasFinished ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          🏁 Finished ({formatSecs(r.finishTimeSeconds)})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          🏃 Pre-Race / Pending Run
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted)] flex flex-wrap items-center gap-2 mt-1">
                      <span>{r.event?.title}</span>
                      <span>•</span>
                      <span className="text-yellow-400 font-semibold">{r.distance}</span>
                      {r.user?.email && (
                        <>
                          <span>•</span>
                          <span className="text-blue-300/90">{r.user.email}</span>
                        </>
                      )}
                      {(r.shippingPhone || r.user?.phone) && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-emerald-300/90">📞 {r.shippingPhone || r.user?.phone}</span>
                        </>
                      )}
                      {r.shippingCity && (
                        <>
                          <span>•</span>
                          <span>{r.shippingCity}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 cursor-pointer transition shadow-xs"
                  >
                    Edit Details &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Runner Edit Card */}
        {selectedReg && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-blue-500/30 bg-blue-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                  👤
                </div>
                <div>
                  <div className="text-xs text-blue-400 uppercase font-bold tracking-wider">
                    Editing Participant Record
                  </div>
                  <div className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                    {selectedReg.shippingName || selectedReg.user?.name}
                    <span className="font-mono text-yellow-400 text-xs px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30">
                      {selectedReg.bibNumber}
                    </span>
                    <span className="text-xs font-normal text-[var(--muted)]">
                      • {selectedReg.event?.title}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isPreRace ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    🏃 Pre-Race (Pending Run)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    🏁 Race Completed
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-white cursor-pointer"
                >
                  Change Runner
                </button>
              </div>
            </div>

            {/* ── Form: Profile, Distance, Contact & Address ──────── */}
            <form onSubmit={handleSaveParticipantDetails} className="space-y-5">
              {/* Section 1: Identity & Distance Category */}
              <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--background)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  1. Participant Identity & Category
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      Full Name (Fix Typos / Spelling) *
                    </label>
                    <input
                      type="text"
                      required
                      value={runnerName}
                      onChange={(e) => setRunnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--foreground)] focus:border-blue-500 outline-none font-bold"
                    />
                    <p className="text-[10px] text-[var(--muted)] mt-1">
                      Syncs to user profile, medal label, and race roster.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      Distance Category (Change Distance) *
                    </label>
                    <select
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--foreground)] focus:border-blue-500 outline-none font-bold"
                    >
                      {availableDistances.map((d: string) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[var(--muted)] mt-1">
                      Moves participant to the requested distance category.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      BIB Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={bibNumber}
                      onChange={(e) => setBibNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm font-mono text-yellow-400 focus:border-blue-500 outline-none font-bold"
                    />
                    <p className="text-[10px] text-[var(--muted)] mt-1">
                      Assigned race BIB number.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      Phone Number (Calling / WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      Registration Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none font-bold"
                    >
                      <option value="CONFIRMED">CONFIRMED ✅</option>
                      <option value="PENDING_PAYMENT">PENDING_PAYMENT ⏳</option>
                      <option value="COMPLETED">COMPLETED 🏁</option>
                      <option value="CANCELLED">CANCELLED ❌</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Courier Shipping Address for Medal Delivery */}
              <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--background)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  2. Courier Shipping Address (Medal & Kit Delivery)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      Delivery Address (House / Flat / Street / Landmark)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 302, Green Valley Apartments"
                      value={shippingLine1}
                      onChange={(e) => setShippingLine1(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      Area / Locality / Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near City Mall"
                      value={shippingLine2}
                      onChange={(e) => setShippingLine2(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="State"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      placeholder="PIN code"
                      value={shippingPincode}
                      onChange={(e) => setShippingPincode(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    Internal Admin Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Changed name per WhatsApp request on 20 Oct"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Primary Save Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[var(--muted)]">
                  💡 Clicking save updates the database, roster, and medal dispatch list. No certificates are sent.
                </div>

                <button
                  type="submit"
                  disabled={savingDetails}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg shadow-blue-900/30 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {savingDetails ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Participant Changes
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* ── Section 3: Post-Race Timing & E-Certificate (Strictly Separate) ── */}
            <div className="p-5 rounded-xl border border-purple-500/20 bg-purple-950/15 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    3. Race Completion & E-Certificate (Post-Race / Optional)
                  </h4>
                  <p className="text-[11px] text-purple-300/70 mt-0.5">
                    Certificates are only issued after a runner completes the challenge. Use this section only if the race has concluded or you need to re-issue a corrected certificate.
                  </p>
                </div>

                <div>
                  {selectedReg.certificate ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Certificate: {selectedReg.certificate.status} ({selectedReg.certificate.certificateNumber || "Active"})
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                      No Certificate Issued Yet
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    Verified Finish Time (HH:MM:SS)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 00:24:35"
                    value={finishTimeInput}
                    onChange={(e) => setFinishTimeInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm font-mono text-[var(--foreground)] focus:border-purple-500 outline-none font-bold"
                  />
                  <p className="text-[10px] text-[var(--muted)] mt-1">
                    Enter finish time to calculate pace and print on certificate.
                  </p>
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={savingCert}
                      onClick={handleRegenerateCertificate}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${savingCert ? "animate-spin" : ""}`} />
                      {selectedReg.certificate ? "Re-issue Certificate (Updated Name/Distance)" : "Generate Certificate"}
                    </button>

                    {selectedReg.certificate && (
                      <button
                        type="button"
                        disabled={sendingCertEmail}
                        onClick={handleSendCertEmail}
                        className="px-3.5 py-2.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" /> Email Certificate
                      </button>
                    )}

                    {selectedReg.certificate?.pdfUrl && (
                      <a
                        href={selectedReg.certificate.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--foreground)] inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   TAB 3: 🚚 TRACKING ID EMAIL DISPATCH
===================================================================== */
function TabTrackingDispatch({ toast, getToken }: { toast: any; getToken: any }) {
  const [dispatchMode, setDispatchMode] = useState<"single" | "bulk">("bulk");
  const [loading, setLoading] = useState(false);

  // Single runner state
  const [singleBib, setSingleBib] = useState("");
  const [singleCourier, setSingleCourier] = useState("DTDC Express");
  const [singleTracking, setSingleTracking] = useState("");
  const [singleUrl, setSingleUrl] = useState("");

  // Bulk state
  const [bulkText, setBulkText] = useState("");
  const [defaultCourier, setDefaultCourier] = useState("DTDC Express");
  const [bulkResults, setBulkResults] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const COURIER_SUGGESTIONS = [
    "DTDC Express",
    "Delhivery",
    "BlueDart",
    "India Post Speed Post",
    "Shadowfax",
    "Xpressbees",
  ];

  // Parse lines into structured items
  const parsedItems = bulkText
    .split("\n")
    .map((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) return null;
      // Skip common CSV headers
      const lower = line.toLowerCase();
      if (
        index === 0 &&
        (lower.includes("bib") || lower.includes("courier") || lower.includes("tracking") || lower.includes("awb"))
      ) {
        return null;
      }

      // Support comma, tab (\t), or semicolon
      let parts = line.split("\t");
      if (parts.length === 1) parts = line.split(",");
      if (parts.length === 1) parts = line.split(";");
      parts = parts.map((p) => p.trim());

      let bibNumber = "";
      let courier = defaultCourier;
      let trackingNumber = "";
      let trackingUrl = "";

      if (parts.length >= 3) {
        bibNumber = parts[0];
        courier = parts[1] || defaultCourier;
        trackingNumber = parts[2];
        trackingUrl = parts[3] || "";
      } else if (parts.length === 2) {
        // BIB, TrackingNumber
        bibNumber = parts[0];
        trackingNumber = parts[1];
      } else if (parts.length === 1) {
        bibNumber = parts[0];
      }

      const isValid = Boolean(bibNumber && trackingNumber);
      return {
        raw: line,
        bibNumber: bibNumber.toUpperCase(),
        courier,
        trackingNumber,
        trackingUrl: trackingUrl || null,
        isValid,
      };
    })
    .filter(Boolean) as Array<{
    raw: string;
    bibNumber: string;
    courier: string;
    trackingNumber: string;
    trackingUrl: string | null;
    isValid: boolean;
  }>;

  const validItems = parsedItems.filter((i) => i.isValid);
  const invalidItems = parsedItems.filter((i) => !i.isValid);

  function handleDownloadSampleCsv() {
    const csvContent =
      "BIB,Courier,TrackingNumber,TrackingUrl\n" +
      "MRUN-1001,DTDC Express,7D136259434,https://www.dtdc.in/tracking.asp\n" +
      "MRUN-1002,Delhivery,14238918239,https://www.delhivery.com\n" +
      "MRUN-1003,BlueDart,8892182910,\n" +
      "MRUN-1004,India Post Speed Post,EU918239128IN,\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mountainrun-tracking-sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast("success", "Sample CSV downloaded!");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setBulkText(text);
        setDispatchMode("bulk");
        toast("info", `Loaded ${file.name}! Check the preview below.`);
      }
    };
    reader.onerror = () => {
      toast("error", "Failed to read the file");
    };
    reader.readAsText(file);
  }

  async function handleSingleDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!singleBib.trim() || !singleTracking.trim()) {
      toast("error", "BIB number and tracking AWB number are required!");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const res: any = await adminFetch("/api/admin/medals/dispatch-email", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              bibNumber: singleBib.trim().toUpperCase(),
              courier: singleCourier.trim(),
              trackingNumber: singleTracking.trim(),
              trackingUrl: singleUrl.trim() || null,
            },
          ],
        }),
      });

      if (res.data?.sentCount > 0) {
        toast("success", `Tracking email sent successfully for ${singleBib}!`);
        setSingleBib("");
        setSingleTracking("");
        setSingleUrl("");
      } else {
        toast("error", `Failed: ${res.data?.results?.[0]?.error || "Could not find registration"}`);
      }
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (validItems.length === 0) {
      toast("error", "No valid items to dispatch. Format should be: BIB, Courier, TrackingNumber");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to send tracking emails to ${validItems.length} runners now? Participants will immediately receive an email with their tracking number.`
      )
    ) {
      return;
    }

    setLoading(true);
    setBulkResults(null);

    try {
      const token = await getToken();
      const res: any = await adminFetch("/api/admin/medals/dispatch-email", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validItems.map((item) => ({
            bibNumber: item.bibNumber,
            courier: item.courier,
            trackingNumber: item.trackingNumber,
            trackingUrl: item.trackingUrl,
          })),
        }),
      });

      setBulkResults(res.data);
      if (res.data?.sentCount > 0) {
        toast("success", `Dispatched ${res.data.sentCount} tracking emails!`);
      } else {
        toast("error", `Sent 0 emails. Check errors in the summary below.`);
      }
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Guidance Banner ─────────────────────────────────── */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-purple-200">
              Bulk Tracking ID Dispatch Center
            </h3>
            <p className="text-xs text-purple-300/80 mt-0.5 max-w-2xl leading-relaxed">
              Upload your courier tracking sheet (or copy-paste from Excel). MountainRun automatically matches each runner by BIB number and sends a branded email with their AWB number and live delivery link.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadSampleCsv}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-500/40 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 text-xs font-bold transition shrink-0 cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Download Sample CSV
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        {/* Mode Selector */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDispatchMode("bulk")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-2 ${
                dispatchMode === "bulk"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                  : "bg-[var(--background)] border border-[var(--line)] text-[var(--muted)] hover:text-white"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Bulk Batch Dispatch (CSV / Paste)
            </button>
            <button
              type="button"
              onClick={() => setDispatchMode("single")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-2 ${
                dispatchMode === "single"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                  : "bg-[var(--background)] border border-[var(--line)] text-[var(--muted)] hover:text-white"
              }`}
            >
              <Send className="w-4 h-4" /> Single Runner Dispatch
            </button>
          </div>

          <div className="hidden sm:block text-[11px] text-[var(--muted)] font-mono">
            Endpoint: /api/admin/medals/dispatch-email
          </div>
        </div>

        {/* ── Mode 1: Bulk Batch Dispatch ───────────────────────── */}
        {dispatchMode === "bulk" && (
          <form onSubmit={handleBulkDispatch} className="space-y-6">
            {/* Top Toolbar: Default Courier & Upload CSV */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--background)]">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  Default Courier Partner
                </label>
                <p className="text-[11px] text-[var(--muted)] mb-2">
                  Auto-applied if your CSV/paste only has 2 columns (BIB & Tracking Number).
                </p>
                <select
                  value={defaultCourier}
                  onChange={(e) => setDefaultCourier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none"
                >
                  {COURIER_SUGGESTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  Upload CSV or Excel File
                </label>
                <p className="text-[11px] text-[var(--muted)] mb-2">
                  Select a .csv or .txt file directly from your computer.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-xl border border-dashed border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadedFileName ? `Replace: ${uploadedFileName}` : "📁 Choose CSV File"}
                  </button>
                  {uploadedFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName(null);
                        setBulkText("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-2 rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-white"
                      title="Clear file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Paste Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[var(--foreground)]">
                  Paste Tracking Data (Comma or Tab separated)
                </label>
                <div className="flex items-center gap-2">
                  {bulkText && (
                    <button
                      type="button"
                      onClick={() => {
                        setBulkText("");
                        setUploadedFileName(null);
                      }}
                      className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                  <span className="text-[11px] text-[var(--muted)]">
                    Format: <code className="text-purple-300">BIB, Courier, TrackingNumber</code>
                  </span>
                </div>
              </div>

              <textarea
                rows={6}
                placeholder={`Example:\nMRUN-1001, DTDC Express, 7D136259434\nMRUN-1002, Delhivery, 14238918239\nMRUN-1003, BlueDart, 8892182910\n\nOr paste straight from Excel (TAB separated)!`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none font-mono resize-y"
              />
            </div>

            {/* Pre-Flight Preview */}
            {parsedItems.length > 0 && (
              <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      Pre-Flight Preview:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {validItems.length} Valid Runners Ready
                    </span>
                    {invalidItems.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {invalidItems.length} Incomplete Rows (Will Be Skipped)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--muted)]">
                    Verify BIBs and AWB numbers before dispatching
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto border border-[var(--line)] rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[var(--panel)] border-b border-[var(--line)] sticky top-0 text-[var(--muted)]">
                      <tr>
                        <th className="p-2 w-10 text-center">#</th>
                        <th className="p-2 font-mono">BIB</th>
                        <th className="p-2">Courier</th>
                        <th className="p-2 font-mono">Tracking AWB</th>
                        <th className="p-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {parsedItems.map((item, idx) => (
                        <tr
                          key={idx}
                          className={item.isValid ? "hover:bg-[var(--panel)]/50" : "bg-rose-950/20 text-rose-300"}
                        >
                          <td className="p-2 text-center text-[var(--muted)]">{idx + 1}</td>
                          <td className="p-2 font-mono font-bold text-yellow-400">
                            {item.bibNumber || "--"}
                          </td>
                          <td className="p-2">{item.courier}</td>
                          <td className="p-2 font-mono">{item.trackingNumber || "--"}</td>
                          <td className="p-2 text-right">
                            {item.isValid ? (
                              <span className="text-emerald-400 font-semibold">Ready ✅</span>
                            ) : (
                              <span className="text-rose-400 font-semibold">Missing AWB ⚠️</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || validItems.length === 0}
                className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition shadow-lg shadow-purple-900/30 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sending Bulk Tracking Emails...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Tracking Emails ({validItems.length} Runners)
                  </>
                )}
              </button>

              {validItems.length === 0 && bulkText.trim() && (
                <span className="text-xs text-rose-400">
                  Please make sure each line contains at least BIB and Tracking Number.
                </span>
              )}
            </div>

            {/* Results Display */}
            {bulkResults && (
              <div className="mt-4 p-5 rounded-xl border border-purple-500/30 bg-purple-950/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-purple-200">
                    Dispatch Summary: {bulkResults.sentCount} Sent Successfully, {bulkResults.failCount} Failed
                  </div>
                  <span className="text-xs font-mono text-purple-300">
                    {bulkResults.results?.length || 0} Total Processed
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto text-xs space-y-1.5 divide-y divide-[var(--line)] border border-purple-500/20 rounded-lg p-3 bg-black/20">
                  {bulkResults.results?.map((r: any, idx: number) => (
                    <div key={idx} className="pt-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-yellow-400">
                          {r.bibNumber || r.item?.bibNumber}
                        </span>
                        {r.recipientEmail && (
                          <span className="text-[11px] text-[var(--muted)]">
                            ({r.recipientEmail})
                          </span>
                        )}
                      </div>
                      <span className={r.success ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                        {r.success ? "Sent ✅" : r.error || "Failed ❌"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}

        {/* ── Mode 2: Single Runner Dispatch ─────────────────────── */}
        {dispatchMode === "single" && (
          <form onSubmit={handleSingleDispatch} className="max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Runner BIB Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MRUN-1001"
                value={singleBib}
                onChange={(e) => setSingleBib(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Courier Partner *
              </label>
              <input
                type="text"
                required
                value={singleCourier}
                onChange={(e) => setSingleCourier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COURIER_SUGGESTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSingleCourier(c)}
                    className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--background)] hover:border-purple-500 text-[11px] text-[var(--muted)] hover:text-white transition cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Tracking Number (AWB) *
              </label>
              <input
                type="text"
                required
                placeholder="Tracking / AWB number (e.g. 7D136259434)"
                value={singleTracking}
                onChange={(e) => setSingleTracking(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Tracking Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://www.dtdc.in/tracking.asp?awb=..."
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition shadow-lg shadow-purple-900/30 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching Email...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Save Tracking & Send Email Now
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   TAB 4: 📊 COURIER DELIVERY MASTER EXCEL
===================================================================== */
function TabCourierExcel({
  events,
  toast,
  getToken,
}: {
  events: any[];
  toast: any;
  getToken: any;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [loading, setLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        pageSize: "10",
        ...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      });

      const res = await adminFetch<{ data: any[] }>(`/api/admin/medals?${params.toString()}`, token);
      setPreviewRows(res.data || []);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, statusFilter, getToken, toast]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  async function handleDownloadCsv() {
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        ...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      });

      const csvData = await adminFetch<string>(`/api/admin/medals/export.csv?${params.toString()}`, token);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mountainrun-courier-dispatch-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast("success", "Courier Dispatch CSV downloaded!");
    } catch (err: any) {
      toast("error", `Export failed: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Courier Delivery Excel Exporter
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Download a formatted courier dispatch spreadsheet (.csv) with recipient names, phones, and verified delivery addresses.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition shadow-lg shadow-cyan-900/30 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" /> Download Courier Excel (.csv)
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Filter by Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-cyan-500 outline-none"
            >
              <option value="ALL">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Medal Dispatch Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-cyan-500 outline-none"
            >
              <option value="PENDING">Pending (Ready for Packing & Dispatch)</option>
              <option value="DISPATCHED">Dispatched (Already Sent)</option>
              <option value="ALL">All Confirmed Registrations</option>
            </select>
          </div>
        </div>

        {/* Live Preview Table */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2 font-medium">
            <span>Sample Preview (First 10 records matching filter)</span>
            <span>Columns formatted exactly for courier logistics</span>
          </div>

          <div className="border border-[var(--line)] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--background)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                  <th className="p-3 font-mono">BIB</th>
                  <th className="p-3">Recipient Name</th>
                  <th className="p-3">Mobile Phone</th>
                  <th className="p-3">Delivery Address</th>
                  <th className="p-3">City / State</th>
                  <th className="p-3 font-mono">Pincode</th>
                  <th className="p-3">Event & Distance</th>
                  <th className="p-3">Medal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[var(--muted)]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading preview...
                    </td>
                  </tr>
                ) : previewRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[var(--muted)]">
                      No records match the current filter.
                    </td>
                  </tr>
                ) : (
                  previewRows.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--line)]/30">
                      <td className="p-3 font-mono font-bold text-cyan-400">{r.bibNumber}</td>
                      <td className="p-3 font-semibold text-[var(--foreground)]">{r.shippingName || r.user?.name}</td>
                      <td className="p-3 font-mono text-[var(--muted)]">{r.shippingPhone || r.user?.phone}</td>
                      <td className="p-3 text-[var(--muted)] max-w-xs truncate">{r.shippingLine1}</td>
                      <td className="p-3 text-[var(--muted)]">{r.shippingCity}, {r.shippingState}</td>
                      <td className="p-3 font-mono font-bold">{r.shippingPincode}</td>
                      <td className="p-3 text-[var(--muted)]">{r.event?.title} ({r.distance})</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.medalDelivery?.status === "DISPATCHED" ? "bg-purple-500/20 text-purple-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {r.medalDelivery?.status || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   TAB 5: 🏆 EVENT MANAGEMENT
===================================================================== */
function TabEventManagement({
  events,
  onRefresh,
  toast,
  getToken,
}: {
  events: any[];
  onRefresh: () => void;
  toast: any;
  getToken: any;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [proofClosesAt, setProofClosesAt] = useState("");
  const [distances, setDistances] = useState("1.6 km, 3.2 km, 5 km, 10 km, 21 km");
  const [priceRupees, setPriceRupees] = useState("449");
  const [status, setStatus] = useState("OPEN");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [medalImageUrl, setMedalImageUrl] = useState("");

  function openCreate() {
    setEditingEventId(null);
    setTitle("");
    setSlug("");
    setDescription("Premier virtual running challenge honoring athletes across India. Earn exclusive heavyweight 3D finisher medal & certificate delivered to your doorstep.");
    setStartsAt(new Date().toISOString().slice(0, 16));
    setEndsAt(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16));
    setProofClosesAt(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 16));
    setDistances("1.6 km, 3.2 km, 5 km, 10 km, 21 km");
    setPriceRupees("449");
    setStatus("OPEN");
    setBannerImageUrl("");
    setMedalImageUrl("");
    setShowForm(true);
  }

  function openEdit(ev: any) {
    setEditingEventId(ev.id);
    setTitle(ev.title || "");
    setSlug(ev.slug || "");
    setDescription(ev.description || "");
    setStartsAt(ev.startsAt ? new Date(ev.startsAt).toISOString().slice(0, 16) : "");
    setEndsAt(ev.endsAt ? new Date(ev.endsAt).toISOString().slice(0, 16) : "");
    setProofClosesAt(ev.proofClosesAt ? new Date(ev.proofClosesAt).toISOString().slice(0, 16) : "");
    setDistances((ev.distances || []).join(", "));
    setPriceRupees(String((ev.priceInPaise || 44900) / 100));
    setStatus(ev.status || "OPEN");
    setBannerImageUrl(ev.bannerImageUrl || "");
    setMedalImageUrl(ev.medalImageUrl || "");
    setShowForm(true);
  }

  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        proofClosesAt: new Date(proofClosesAt),
        distances: distances.split(",").map((d) => d.trim()).filter(Boolean),
        priceInPaise: Math.round(Number(priceRupees || 0) * 100),
        status,
        bannerImageUrl: bannerImageUrl.trim() || null,
        medalImageUrl: medalImageUrl.trim() || null,
      };

      if (editingEventId) {
        await adminFetch(`/api/admin/events/${editingEventId}`, token, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast("success", "Event updated successfully!");
      } else {
        await adminFetch("/api/admin/events", token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast("success", "New Event created successfully!");
      }

      setShowForm(false);
      onRefresh();
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Event Management
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Create new virtual run events or update registration fees, posters, medal graphics, and race distances.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg shadow-amber-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New Event
          </button>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--background)] p-4 flex flex-col justify-between hover:border-amber-500/40 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ev.status === "OPEN" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"
                  }`}>
                    {ev.status}
                  </span>
                  <span className="font-bold text-sm text-amber-400">
                    ₹{(ev.priceInPaise || 0) / 100}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[var(--foreground)] leading-snug">{ev.title}</h3>
                <p className="text-[11px] font-mono text-[var(--muted)] mt-1">{ev.slug}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(ev.distances || []).map((d: string) => (
                    <span key={d} className="px-1.5 py-0.5 rounded bg-[var(--line)] text-[10px] text-[var(--muted)]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--muted)]">
                  {ev.startsAt ? new Date(ev.startsAt).toLocaleDateString() : ""}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(ev)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 cursor-pointer"
                >
                  Edit Settings ⚙️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-base text-[var(--foreground)]">
                {editingEventId ? "Edit Event Details" : "Create New Running Event"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[var(--muted)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[var(--muted)] mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingEventId) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--muted)] mb-1">Event Slug (URL) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-mono text-[var(--foreground)]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--muted)] mb-1">Entry Fee (₹)</label>
                  <input
                    type="number"
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[var(--muted)] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)]"
                  >
                    <option value="OPEN">OPEN (Live Registration)</option>
                    <option value="CLOSED">CLOSED (Registration Closed)</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[var(--muted)] mb-1">Starts At *</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--muted)] mb-1">Ends At *</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--muted)] mb-1">Distances (comma separated) *</label>
                <input
                  type="text"
                  value={distances}
                  onChange={(e) => setDistances(e.target.value)}
                  placeholder="1.6 km, 3.2 km, 5 km, 10 km, 21 km"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--muted)] mb-1">Poster / Banner Image URL</label>
                <input
                  type="url"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--muted)] mb-1">Medal Image URL</label>
                <input
                  type="url"
                  value={medalImageUrl}
                  onChange={(e) => setMedalImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--muted)] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  {loading ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   TAB 6: 🥇 LEADERBOARD CONTROLLER
===================================================================== */
function TabLeaderboardManager({
  events,
  toast,
  getToken,
}: {
  events: any[];
  toast: any;
  getToken: any;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedDistance, setSelectedDistance] = useState<string>("5 km");
  const [visibilityFilter, setVisibilityFilter] = useState<"LIVE" | "HIDDEN" | "DUMMY" | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [rankedAthletes, setRankedAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Add Dummy Runner Modal State
  const [showAddDummyModal, setShowAddDummyModal] = useState(false);
  const [dummySubmitting, setDummySubmitting] = useState(false);
  const [dummyName, setDummyName] = useState("");
  const [dummyEventId, setDummyEventId] = useState("");
  const [dummyDistance, setDummyDistance] = useState("5 km");
  const [dummyBib, setDummyBib] = useState("");
  const [dummyTime, setDummyTime] = useState("00:22:30");
  const [dummyCity, setDummyCity] = useState("Shimla");
  const [dummyState, setDummyState] = useState("Himachal Pradesh");
  const [dummyShowLive, setDummyShowLive] = useState(true);

  // Edit Athlete Modal State
  const [editingAthlete, setEditingAthlete] = useState<any | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editRunnerName, setEditRunnerName] = useState("");
  const [editDistance, setEditDistance] = useState("");
  const [editBib, setEditBib] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editShowLive, setEditShowLive] = useState(true);

  // Deleting Athlete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  useEffect(() => {
    if (activeEvent && !selectedEventId) {
      setSelectedEventId(activeEvent.id);
      setSelectedDistance(activeEvent.distances?.[0] || "5 km");
      setDummyEventId(activeEvent.id);
      setDummyDistance(activeEvent.distances?.[0] || "5 km");
    }
  }, [activeEvent, selectedEventId]);

  const loadLeaderboard = useCallback(async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        eventId: selectedEventId,
        distance: selectedDistance,
        visibility: visibilityFilter,
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
      });

      const res: any = await adminFetch(`/api/admin/leaderboard-manager?${params.toString()}`, token);
      setRankedAthletes(res.data || []);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, selectedDistance, visibilityFilter, searchQuery, getToken, toast]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  function getPacePresets(dist: string) {
    const d = (dist || "").toLowerCase();
    if (d.includes("21") || d.includes("half")) {
      return [
        { label: "🥇 1st Place", time: "01:19:45" },
        { label: "🥈 2nd Place", time: "01:24:30" },
        { label: "🥉 3rd Place", time: "01:28:15" },
        { label: "⏱️ Sub-1:40", time: "01:38:20" },
        { label: "🏃 Sub-2:00", time: "01:54:10" },
        { label: "🏔️ Finisher", time: "02:15:30" },
      ];
    }
    if (d.includes("10")) {
      return [
        { label: "🥇 1st Place", time: "00:36:20" },
        { label: "🥈 2nd Place", time: "00:39:45" },
        { label: "🥉 3rd Place", time: "00:43:10" },
        { label: "⏱️ Sub-45", time: "00:44:30" },
        { label: "🏃 Sub-60", time: "00:56:45" },
        { label: "🏔️ Finisher", time: "01:08:20" },
      ];
    }
    if (d.includes("3.2") || d.includes("3 km")) {
      return [
        { label: "🥇 1st Place", time: "00:11:15" },
        { label: "🥈 2nd Place", time: "00:12:40" },
        { label: "🥉 3rd Place", time: "00:14:20" },
        { label: "⏱️ Sub-15", time: "00:14:55" },
        { label: "🏃 Finisher", time: "00:19:30" },
      ];
    }
    if (d.includes("1.6") || d.includes("1 km")) {
      return [
        { label: "🥇 1st Place", time: "00:05:30" },
        { label: "🥈 2nd Place", time: "00:06:15" },
        { label: "🥉 3rd Place", time: "00:07:05" },
        { label: "⏱️ Sub-8", time: "00:07:50" },
        { label: "🏃 Finisher", time: "00:10:30" },
      ];
    }
    // Default 5K
    return [
      { label: "🥇 1st Place", time: "00:17:45" },
      { label: "🥈 2nd Place", time: "00:19:30" },
      { label: "🥉 3rd Place", time: "00:22:15" },
      { label: "⏱️ Sub-25", time: "00:24:40" },
      { label: "🏃 Sub-30", time: "00:29:15" },
      { label: "🏔️ Finisher", time: "00:34:50" },
    ];
  }

  function openAddDummyModal() {
    setDummyEventId(selectedEventId || activeEvent?.id || "");
    setDummyDistance(selectedDistance);
    const presets = getPacePresets(selectedDistance);
    setDummyTime(presets[2]?.time || "00:22:30");
    setDummyBib("");
    setDummyName("");
    setDummyShowLive(true);
    setShowAddDummyModal(true);
  }

  async function handleCreateDummy(e: React.FormEvent) {
    e.preventDefault();
    if (!dummyName.trim()) {
      toast("error", "Runner name is required!");
      return;
    }
    if (!dummyEventId) {
      toast("error", "Select an event!");
      return;
    }

    setDummySubmitting(true);
    try {
      const token = await getToken();
      await adminFetch("/api/admin/leaderboard-manager/entry", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runnerName: dummyName.trim(),
          eventId: dummyEventId,
          distance: dummyDistance,
          finishTime: dummyTime.trim() || undefined,
          bibNumber: dummyBib.trim() || undefined,
          city: dummyCity.trim() || undefined,
          state: dummyState.trim() || undefined,
          showOnLeaderboard: dummyShowLive,
        }),
      });

      toast("success", `Added dummy runner "${dummyName}" successfully!`);
      setShowAddDummyModal(false);
      setDummyName("");
      loadLeaderboard();
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setDummySubmitting(false);
    }
  }

  function openEditAthlete(ath: any) {
    setEditingAthlete(ath);
    setEditRunnerName(ath.runnerName || "");
    setEditDistance(ath.distance || selectedDistance);
    setEditBib(ath.bibNumber || "");
    setEditTime(ath.finishTimeFormatted !== "--:--:--" ? ath.finishTimeFormatted : "00:24:00");
    setEditCity(ath.city || "");
    setEditState(ath.state || "");
    setEditShowLive(Boolean(ath.isLiveOnLeaderboard));
  }

  async function handleSaveEditAthlete(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAthlete) return;

    setEditSubmitting(true);
    try {
      const token = await getToken();
      await adminFetch(`/api/admin/leaderboard-manager/${editingAthlete.id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runnerName: editRunnerName.trim(),
          distance: editDistance,
          bibNumber: editBib.trim(),
          finishTime: editTime.trim(),
          city: editCity.trim(),
          state: editState.trim(),
          hideFromLeaderboard: !editShowLive,
          proofStatus: editShowLive ? "APPROVED" : undefined,
        }),
      });

      toast("success", `Updated ${editRunnerName} successfully!`);
      setEditingAthlete(null);
      loadLeaderboard();
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeleteEntry(ath: any) {
    if (!confirm(`Are you sure you want to permanently delete "${ath.runnerName}" (${ath.bibNumber})?`)) {
      return;
    }

    setDeletingId(ath.id);
    try {
      const token = await getToken();
      await adminFetch(`/api/admin/leaderboard-manager/${ath.id}`, token, {
        method: "DELETE",
      });

      toast("success", `Removed "${ath.runnerName}" from leaderboard!`);
      loadLeaderboard();
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleVisibility(ath: any, hide: boolean) {
    setTogglingId(ath.id);
    try {
      const token = await getToken();
      const payload: any = { hideFromLeaderboard: hide };

      if (!hide) {
        payload.proofStatus = "APPROVED";
        if (!ath.finishTimeSeconds) {
          payload.finishTimeSeconds = 1500; // 00:25:00 default
        }
      }

      await adminFetch(`/api/admin/leaderboard-manager/${ath.id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast(
        "success",
        hide
          ? `${ath.runnerName} (${ath.bibNumber}) is now HIDDEN from the public leaderboard!`
          : `${ath.runnerName} (${ath.bibNumber}) is now LIVE on the public leaderboard!`
      );
      loadLeaderboard();
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleBump(athleteIndex: number, direction: "up" | "down") {
    const current = rankedAthletes[athleteIndex];
    if (!current || !current.finishTimeSeconds) return;

    let newSeconds = current.finishTimeSeconds;
    if (direction === "up") {
      if (athleteIndex === 0) {
        newSeconds = Math.max(10, current.finishTimeSeconds - 2);
      } else {
        const above = rankedAthletes[athleteIndex - 1];
        newSeconds = Math.max(10, (above.finishTimeSeconds || current.finishTimeSeconds) - 1);
      }
    } else {
      if (athleteIndex >= rankedAthletes.length - 1) {
        newSeconds = current.finishTimeSeconds + 5;
      } else {
        const below = rankedAthletes[athleteIndex + 1];
        newSeconds = (below.finishTimeSeconds || current.finishTimeSeconds) + 1;
      }
    }

    try {
      const token = await getToken();
      await adminFetch(`/api/admin/leaderboard-manager/${current.id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finishTimeSeconds: newSeconds }),
      });
      toast("success", `Rank bumped ${direction}! Recalculated.`);
      loadLeaderboard();
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  const liveCount = rankedAthletes.filter((a) => a.isLiveOnLeaderboard).length;
  const hiddenCount = rankedAthletes.filter((a) => !a.isLiveOnLeaderboard).length;
  const dummyCount = rankedAthletes.filter((a) => a.isDummy).length;

  return (
    <div className="space-y-6">
      {/* ── 3 Visual Guidance Cards for Easy Client Use ───────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0 font-black text-sm">
            1
          </div>
          <div>
            <h4 className="text-xs font-bold text-yellow-300">Fix Athlete Errors</h4>
            <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
              Click <strong className="text-[var(--foreground)]">✏️ Edit Athlete</strong> to fix spelling typos in names, change distance category, or adjust finish time.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-black text-sm">
            2
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300">Control Visibility & Podium</h4>
            <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
              Click <strong className="text-emerald-400">👁️ Show Live</strong> or <strong className="text-rose-400">👁️‍🗨️ Hide</strong> to choose who appears. Use ⬆️ / ⬇️ to swap ranks.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-black text-sm">
            3
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-300">Add Dummy / Mock Runners</h4>
            <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
              Click <strong className="text-purple-300">➕ Add Dummy Runner</strong> to insert custom runners with preset timings for 1st, 2nd, 3rd podium spots!
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        {/* Top Header & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Leaderboard Controller & Visibility Hub
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Full organizer control: edit names, change distances, adjust timings, toggle visibility, and create dummy runners.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAddDummyModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs inline-flex items-center gap-2 shadow-md shadow-yellow-500/20 cursor-pointer transition transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> Add Dummy / Custom Runner
            </button>

            {activeEvent?.slug && (
              <a
                href={`/leaderboard?event=${activeEvent.slug}&distance=${encodeURIComponent(selectedDistance)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] hover:border-yellow-500/50 text-xs font-semibold text-[var(--foreground)] inline-flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-yellow-400" /> View Public Board
              </a>
            )}

            <button
              type="button"
              onClick={loadLeaderboard}
              className="px-3.5 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--line)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Reload
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4 pb-4 border-b border-[var(--line)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">Select Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-yellow-500 outline-none"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">Distance Category</label>
              <select
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-yellow-500 outline-none"
              >
                {(activeEvent?.distances || ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"]).map((d: string) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">Search Athlete</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="BIB, runner name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-yellow-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Visibility View Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--background)] border border-[var(--line)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setVisibilityFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  visibilityFilter === "ALL"
                    ? "bg-yellow-500 text-slate-950 font-bold shadow-xs"
                    : "text-[var(--muted)] hover:text-white"
                }`}
              >
                All Athletes ({rankedAthletes.length})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter("LIVE")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  visibilityFilter === "LIVE"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                    : "text-[var(--muted)] hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live on Board ({liveCount})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter("HIDDEN")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  visibilityFilter === "HIDDEN"
                    ? "bg-rose-500 text-white font-bold shadow-xs"
                    : "text-[var(--muted)] hover:text-white"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                Hidden / Excluded ({hiddenCount})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter("DUMMY")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  visibilityFilter === "DUMMY"
                    ? "bg-purple-600 text-white font-bold shadow-xs"
                    : "text-[var(--muted)] hover:text-white"
                }`}
              >
                🎭 Dummy Only ({dummyCount})
              </button>
            </div>

            <div className="text-[11px] text-[var(--muted)]">
              Showing rankings for: <strong className="text-yellow-400 font-bold">{selectedDistance}</strong>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="mt-4 border border-[var(--line)] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--line)] text-[var(--muted)] uppercase font-semibold">
                <th className="p-3 w-16 text-center">Rank</th>
                <th className="p-3">Athlete</th>
                <th className="p-3 font-mono">BIB</th>
                <th className="p-3">Finish Time</th>
                <th className="p-3">Location</th>
                <th className="p-3">Board Status</th>
                <th className="p-3 text-right">Actions & Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading athletes...
                  </td>
                </tr>
              ) : rankedAthletes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted)]">
                    No athletes found matching the selected filter. Click <strong>"➕ Add Dummy Runner"</strong> to put an athlete on the board!
                  </td>
                </tr>
              ) : (
                rankedAthletes.map((ath, idx) => (
                  <tr
                    key={ath.id}
                    className={`hover:bg-[var(--line)]/20 transition ${
                      !ath.isLiveOnLeaderboard ? "opacity-60 bg-rose-950/5" : ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      {ath.isLiveOnLeaderboard ? (
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                            ath.rank === 1
                              ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/40"
                              : ath.rank === 2
                              ? "bg-slate-300 text-slate-950 font-bold"
                              : ath.rank === 3
                              ? "bg-amber-700 text-white font-bold"
                              : "bg-[var(--line)] text-[var(--muted)]"
                          }`}
                        >
                          #{ath.rank}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[var(--muted)]">--</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--foreground)]">{ath.runnerName}</span>
                        {ath.isDummy && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Dummy
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] font-mono">{ath.email}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-yellow-400">{ath.bibNumber}</td>
                    <td className="p-3 font-mono text-sm font-bold text-[var(--foreground)]">
                      {ath.finishTimeFormatted}
                    </td>
                    <td className="p-3 text-[11px] text-[var(--muted)]">
                      {ath.city || ath.state ? `${ath.city || ""}${ath.city && ath.state ? ", " : ""}${ath.state || ""}` : "--"}
                    </td>
                    <td className="p-3">
                      {ath.isLiveOnLeaderboard ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Eye className="w-3 h-3" /> Live on Board
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Toggle Visibility */}
                        {ath.isLiveOnLeaderboard ? (
                          <button
                            type="button"
                            disabled={togglingId === ath.id}
                            onClick={() => handleToggleVisibility(ath, true)}
                            title="Hide from public leaderboard"
                            className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                          >
                            <EyeOff className="w-3.5 h-3.5" /> Hide
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={togglingId === ath.id}
                            onClick={() => handleToggleVisibility(ath, false)}
                            title="Show on public leaderboard"
                            className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                          >
                            <Eye className="w-3.5 h-3.5" /> Show Live
                          </button>
                        )}

                        {/* Rank Bump Controls (only if live with time) */}
                        {ath.isLiveOnLeaderboard && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleBump(idx, "up")}
                              title="Move Rank Up (Faster by 1s)"
                              className="p-1 rounded-lg border border-[var(--line)] bg-[var(--background)] hover:bg-emerald-500/20 text-emerald-400 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBump(idx, "down")}
                              title="Move Rank Down (Slower by 1s)"
                              className="p-1 rounded-lg border border-[var(--line)] bg-[var(--background)] hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Edit Athlete (Name, Distance, BIB, Time) */}
                        <button
                          type="button"
                          onClick={() => openEditAthlete(ath)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--background)] hover:border-yellow-500/50 text-xs font-semibold text-[var(--foreground)] cursor-pointer transition"
                        >
                          ✏️ Edit Athlete
                        </button>

                        {/* Delete Dummy Athlete */}
                        {ath.isDummy && (
                          <button
                            type="button"
                            disabled={deletingId === ath.id}
                            onClick={() => handleDeleteEntry(ath)}
                            title="Delete this dummy athlete"
                            className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: ➕ Add Dummy / Custom Runner ───────────────── */}
      {showAddDummyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--foreground)]">
                    Add Dummy / Custom Runner
                  </h3>
                  <p className="text-[11px] text-[var(--muted)]">
                    Create a custom podium runner or mock participant with any timing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDummyModal(false)}
                className="text-[var(--muted)] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDummy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  Runner Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singh"
                  value={dummyName}
                  onChange={(e) => setDummyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-yellow-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Event *</label>
                  <select
                    value={dummyEventId}
                    onChange={(e) => {
                      setDummyEventId(e.target.value);
                      const ev = events.find((x) => x.id === e.target.value);
                      if (ev?.distances?.[0]) {
                        setDummyDistance(ev.distances[0]);
                        const p = getPacePresets(ev.distances[0]);
                        if (p[2]) setDummyTime(p[2].time);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-yellow-500 outline-none"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Distance Category *</label>
                  <select
                    value={dummyDistance}
                    onChange={(e) => {
                      setDummyDistance(e.target.value);
                      const p = getPacePresets(e.target.value);
                      if (p[2]) setDummyTime(p[2].time);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-yellow-500 outline-none"
                  >
                    {(events.find((e) => e.id === dummyEventId)?.distances || ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"]).map(
                      (d: string) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Finish Time & Presets */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  Finish Time (HH:MM:SS) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="00:22:30"
                  value={dummyTime}
                  onChange={(e) => setDummyTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-mono text-[var(--foreground)] focus:border-yellow-500 outline-none"
                />

                {/* 1-Click Pace Presets */}
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] text-[var(--muted)] font-semibold uppercase">
                    1-Click Time Presets for {dummyDistance}:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getPacePresets(dummyDistance).map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setDummyTime(preset.time)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition ${
                          dummyTime === preset.time
                            ? "bg-yellow-500 text-slate-950 border-yellow-500 shadow-xs"
                            : "bg-[var(--background)] border-[var(--line)] text-[var(--muted)] hover:text-white hover:border-yellow-500/50"
                        }`}
                      >
                        {preset.label} ({preset.time})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* BIB Number */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  BIB Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-generate unique BIB"
                  value={dummyBib}
                  onChange={(e) => setDummyBib(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-mono text-[var(--foreground)] focus:border-yellow-500 outline-none"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Shimla"
                    value={dummyCity}
                    onChange={(e) => setDummyCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Himachal Pradesh"
                    value={dummyState}
                    onChange={(e) => setDummyState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              {/* Live Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--background)]">
                <div>
                  <div className="text-xs font-bold text-[var(--foreground)]">Show on Leaderboard Immediately</div>
                  <div className="text-[11px] text-[var(--muted)]">Runner will appear publicly upon creation.</div>
                </div>
                <input
                  type="checkbox"
                  checked={dummyShowLive}
                  onChange={(e) => setDummyShowLive(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowAddDummyModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dummySubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold text-xs transition shadow-md shadow-yellow-500/20 cursor-pointer disabled:opacity-50"
                >
                  {dummySubmitting ? "Creating Runner..." : "➕ Create & Add to Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: ✏️ Edit Athlete (Fix Leaderboard Errors) ────── */}
      {editingAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  ✏️
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--foreground)]">
                    Edit Leaderboard Athlete
                  </h3>
                  <p className="text-[11px] text-[var(--muted)]">
                    Fix name typos, change distance category, edit BIB, or adjust timing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAthlete(null)}
                className="text-[var(--muted)] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAthlete} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  Athlete Name (Fix Typos) *
                </label>
                <input
                  type="text"
                  required
                  value={editRunnerName}
                  onChange={(e) => setEditRunnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-yellow-500 outline-none"
                />
                <p className="text-[10px] text-[var(--muted)] mt-1">
                  Updates name across leaderboard, certificate, and medals.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    Distance Category *
                  </label>
                  <select
                    value={editDistance}
                    onChange={(e) => setEditDistance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-yellow-500 outline-none"
                  >
                    {(activeEvent?.distances || ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"]).map((d: string) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    BIB Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editBib}
                    onChange={(e) => setEditBib(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs font-mono font-bold text-yellow-400 focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              {/* Finish Time */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  Finish Time (HH:MM:SS) *
                </label>
                <input
                  type="text"
                  required
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-mono text-[var(--foreground)] focus:border-yellow-500 outline-none"
                />

                {/* 1-Click Pace Presets */}
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] text-[var(--muted)] font-semibold uppercase">
                    Quick Presets for {editDistance}:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getPacePresets(editDistance).map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setEditTime(preset.time)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition ${
                          editTime === preset.time
                            ? "bg-yellow-500 text-slate-950 border-yellow-500"
                            : "bg-[var(--background)] border-[var(--line)] text-[var(--muted)] hover:text-white"
                        }`}
                      >
                        {preset.label} ({preset.time})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              {/* Public Visibility Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--background)]">
                <div>
                  <div className="text-xs font-bold text-[var(--foreground)]">Show on Public Leaderboard</div>
                  <div className="text-[11px] text-[var(--muted)]">Toggle to hide or display publicly.</div>
                </div>
                <input
                  type="checkbox"
                  checked={editShowLive}
                  onChange={(e) => setEditShowLive(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setEditingAthlete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold text-xs transition shadow-md shadow-yellow-500/20 cursor-pointer disabled:opacity-50"
                >
                  {editSubmitting ? "Saving Changes..." : "Save Corrections"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   TAB 7: 🖼️ GALLERY PHOTO MANAGER
===================================================================== */
function TabGalleryManager({ toast, getToken }: { toast: any; getToken: any }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Form
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [tag, setTag] = useState("Community Runner");

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res: any = await adminFetch("/api/admin/content/media", token);
      setPhotos(res.data?.filter((m: any) => m.type === "IMAGE") || []);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, toast]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast("error", "Image URL is required!");
      return;
    }

    setAdding(true);
    try {
      const token = await getToken();
      await adminFetch("/api/admin/content/media", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "IMAGE",
          url: imageUrl.trim(),
          title: caption.trim() || "Mountain Run Athlete",
          caption: caption.trim() || undefined,
          tag: tag.trim() || "National Unity Day 2026",
          featured: true,
        }),
      });

      toast("success", "Photo added to gallery successfully!");
      setImageUrl("");
      setCaption("");
      loadPhotos();
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleDeletePhoto(id: string) {
    if (!confirm("Are you sure you want to remove this photo from the gallery?")) return;
    try {
      const token = await getToken();
      await adminFetch(`/api/admin/content/media/${id}`, token, { method: "DELETE" });
      toast("success", "Photo removed from gallery!");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Gallery Photo Manager
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Upload finisher memories and manage photos featured on the public community gallery.
            </p>
          </div>
        </div>

        {/* Add photo bar */}
        <form onSubmit={handleAddPhoto} className="p-4 rounded-xl border border-[var(--line)] bg-[var(--background)] mb-6 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-pink-400">
            Add New Photo to Gallery
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-[var(--muted)] mb-1">Image URL (Cloudinary / Direct Link) *</label>
              <input
                type="url"
                required
                placeholder="https://res.cloudinary.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--muted)] mb-1">Event / Tag</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Event tag or category"
                className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Photo caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] outline-none"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              {adding ? "Adding..." : "+ Add to Gallery"}
            </button>
          </div>
        </form>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="group relative rounded-xl border border-[var(--line)] overflow-hidden bg-[var(--background)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.title || "Gallery"} className="w-full h-36 object-cover" />
              <div className="p-2 text-[10px] text-[var(--muted)] truncate">
                {p.caption || p.title || "Community Photo"}
              </div>
              <button
                type="button"
                onClick={() => handleDeletePhoto(p.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   TAB 8: 📸 WHATSAPP PROOF UPLOAD
===================================================================== */
function TabManualProof({ toast, getToken }: { toast: any; getToken: any }) {
  const [bibInput, setBibInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [runner, setRunner] = useState<any>(null);

  // Proof form
  const [finishTime, setFinishTime] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [sourceApp, setSourceApp] = useState("WhatsApp Screenshot");
  const [note, setNote] = useState("Verified WhatsApp proof submission");
  const [submitting, setSubmitting] = useState(false);

  async function handleFindRunner(e: React.FormEvent) {
    e.preventDefault();
    if (!bibInput.trim()) return;

    setSearching(true);
    setRunner(null);
    try {
      const token = await getToken();
      const term = encodeURIComponent(bibInput.trim());
      const res = await adminFetch<{ data: any[] }>(
        `/api/admin/registrations?q=${term}&search=${term}&pageSize=5`,
        token
      );
      if (res.data?.[0]) {
        setRunner(res.data[0]);
      } else {
        toast("error", "No runner found with this BIB / mobile number / email!");
      }
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleApproveProof(e: React.FormEvent) {
    e.preventDefault();
    if (!runner) return;
    if (!finishTime.trim()) {
      toast("error", "Please enter finish time (format HH:MM:SS)");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const res: any = await adminFetch("/api/admin/manual-proof", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: runner.id,
          finishTime: finishTime.trim(),
          activityImageUrl: proofUrl.trim() || null,
          sourceApp,
          reviewerNote: note.trim(),
          approveAndCertify: true,
        }),
      });

      toast("success", `Proof approved & Certificate issued for ${runner.bibNumber}!`);
      setRunner(null);
      setBibInput("");
      setFinishTime("");
      setProofUrl("");
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              WhatsApp Proof Upload
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Approve activity screenshots received on WhatsApp, record finish times, and issue certificates immediately.
            </p>
          </div>
        </div>

        {/* Step 1: Search Runner */}
        <form onSubmit={handleFindRunner} className="max-w-xl flex gap-2 mb-6">
          <input
            type="text"
            required
            placeholder="Search by BIB number, email, or phone..."
            value={bibInput}
            onChange={(e) => setBibInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] font-mono outline-none"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm cursor-pointer flex items-center gap-2"
          >
            {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Find Runner
          </button>
        </form>

        {/* Step 2: Proof Details Form */}
        {runner && (
          <form onSubmit={handleApproveProof} className="max-w-xl rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5 space-y-4">
            <div className="border-b border-[var(--line)] pb-3">
              <span className="text-xs font-bold uppercase text-teal-400">Runner Found</span>
              <div className="font-bold text-base text-[var(--foreground)]">{runner.shippingName || runner.user?.name}</div>
              <div className="text-xs text-[var(--muted)] font-mono mt-0.5">
                {runner.bibNumber} • {runner.event?.title} • {runner.distance}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Finish Time (HH:MM:SS) *
              </label>
              <input
                type="text"
                required
                placeholder="HH:MM:SS"
                value={finishTime}
                onChange={(e) => setFinishTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-mono font-bold text-[var(--foreground)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Tracking App</label>
                <select
                  value={sourceApp}
                  onChange={(e) => setSourceApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                >
                  <option value="WhatsApp Screenshot">WhatsApp Screenshot</option>
                  <option value="Strava">Strava</option>
                  <option value="Garmin">Garmin</option>
                  <option value="Nike Run Club">Nike Run Club</option>
                  <option value="Apple Fitness">Apple Fitness</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Screenshot Link (Optional)</label>
                <input
                  type="url"
                  placeholder="Screenshot URL or note (optional)"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Reviewer Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs text-[var(--foreground)]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition shadow-lg shadow-teal-900/30 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Approving & Generating Certificate...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Approve Proof & Issue Certificate
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   TAB 9: 👕 T-SHIRT SIZE MANAGER
===================================================================== */
function TabTshirtManager({
  events,
  toast,
  getToken,
}: {
  events: any[];
  toast: any;
  getToken: any;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  useEffect(() => {
    if (activeEvent && !selectedEventId) {
      setSelectedEventId(activeEvent.id);
    }
  }, [activeEvent, selectedEventId]);

  const loadWinners = useCallback(async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res: any = await adminFetch(`/api/admin/tshirts?eventId=${selectedEventId}`, token);
      setWinners(res.data || []);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, getToken, toast]);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  async function handleUpdateSize(registrationId: string, size: string) {
    try {
      const token = await getToken();
      await adminFetch(`/api/admin/tshirts/${registrationId}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tshirtSize: size }),
      });
      toast("success", `T-Shirt size updated to ${size}!`);
      setWinners((prev) =>
        prev.map((w) => (w.id === registrationId ? { ...w, tshirtSize: size } : w))
      );
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  async function handleSendReminder(registrationId: string, name: string) {
    try {
      const token = await getToken();
      await adminFetch("/api/admin/tshirts/send-reminder", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      toast("success", `Size collection email sent to ${name}!`);
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  function copyClaimLink(bibNumber: string) {
    const url = `https://mountainrun.in/claim-jersey?bib=${bibNumber}`;
    navigator.clipboard.writeText(url);
    toast("info", `Copied WhatsApp Claim Link: ${url}`);
  }

  function handleExportCsv() {
    const headers = ["Rank", "Category", "BIB", "Runner Name", "Phone", "Email", "T-Shirt Size", "Submitted At", "Shipping Address"];
    const rows = winners.map((w) => [
      `"${w.rank}"`,
      `"${w.category}"`,
      `"${w.bibNumber}"`,
      `"${w.runnerName}"`,
      `"${w.phone}"`,
      `"${w.email}"`,
      `"${w.tshirtSize || "PENDING"}"`,
      `"${w.tshirtSubmittedAt ? new Date(w.tshirtSubmittedAt).toISOString().split("T")[0] : ""}"`,
      `"${w.shippingAddress || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mountainrun-winner-tshirts-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("success", "T-Shirt Sizes CSV downloaded!");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Winner T-Shirt Size Manager
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Manage jersey sizes for Top 3 podium winners, copy WhatsApp claim links, send reminder emails, and export sizes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={winners.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export Sizes (.csv for Tailors)
          </button>
        </div>

        {/* Event selector */}
        <div className="max-w-md mb-6">
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Select Event</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {/* Winners Table */}
        <div className="border border-[var(--line)] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--line)] text-[var(--muted)] uppercase font-semibold">
                <th className="p-3">Category & Rank</th>
                <th className="p-3">Runner Name</th>
                <th className="p-3 font-mono">BIB</th>
                <th className="p-3 font-mono">Finish Time</th>
                <th className="p-3">T-Shirt Size</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading winners...
                  </td>
                </tr>
              ) : winners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">
                    No podium finishers found for this event.
                  </td>
                </tr>
              ) : (
                winners.map((w) => (
                  <tr key={w.id} className="hover:bg-[var(--line)]/20">
                    <td className="p-3">
                      <span className="font-bold text-orange-400">{w.category}</span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-[var(--line)] font-semibold text-[10px]">
                        {w.rank}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-sm text-[var(--foreground)]">{w.runnerName}</div>
                      <div className="text-[11px] text-[var(--muted)] font-mono">{w.phone}</div>
                    </td>
                    <td className="p-3 font-mono font-bold">{w.bibNumber}</td>
                    <td className="p-3 font-mono">{w.finishTimeFormatted}</td>
                    <td className="p-3">
                      <select
                        value={w.tshirtSize || "PENDING"}
                        onChange={(e) => handleUpdateSize(w.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg border font-bold text-xs ${
                          w.tshirtSize
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="S">S (36-38)</option>
                        <option value="M">M (38-40)</option>
                        <option value="L">L (40-42)</option>
                        <option value="XL">XL (42-44)</option>
                        <option value="XXL">XXL (44-46)</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyClaimLink(w.bibNumber)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--background)] hover:border-orange-500/50 text-[11px] font-semibold text-[var(--foreground)] inline-flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> WhatsApp Link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReminder(w.id, w.runnerName)}
                          className="px-2.5 py-1 rounded-lg border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-[11px] font-semibold text-orange-300 inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Send Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
