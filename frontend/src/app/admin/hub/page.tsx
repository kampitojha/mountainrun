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
  { id: "manual-reg",    label: "1. Manual Reg",     sub: "Offline & UPI Entry",     icon: UserPlus,        color: "#10b981" },
  { id: "certificate",   label: "2. e-Certificate",  sub: "Edit Details & Resend",   icon: FileCheck2,      color: "#3b82f6" },
  { id: "tracking",      label: "3. Tracking Email", sub: "Dispatch Notifications",  icon: Truck,           color: "#8b5cf6" },
  { id: "courier-excel", label: "4. Courier Excel",  sub: "Delivery Manifest (.csv)", icon: FileSpreadsheet, color: "#06b6d4" },
  { id: "events",        label: "5. Events",         sub: "Posters, Pricing & Setup", icon: Calendar,        color: "#f59e0b" },
  { id: "leaderboard",   label: "6. Leaderboard",    sub: "Ranks & Finish Times",    icon: Trophy,          color: "#eab308" },
  { id: "gallery",       label: "7. Gallery",        sub: "Community Showcase",      icon: ImageIcon,       color: "#ec4899" },
  { id: "proof",         label: "8. WhatsApp Proof", sub: "Manual Verification",     icon: CheckCircle2,    color: "#14b8a6" },
  { id: "tshirts",       label: "9. T-Shirt Sizes",  sub: "Podium Winner Claims",    icon: Shirt,           color: "#f97316" },
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
              All 9 essential organizer tools in one unified dashboard: manual registrations, certificate corrections, tracking emails, courier manifests, event setup, leaderboard ranks, gallery, WhatsApp proof verification, and winner jersey sizes.
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
          <TabCertificateEditor toast={toast} getToken={getToken} />
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
              Register runners who paid offline via UPI or WhatsApp. Unique BIB is assigned, registration is confirmed in database, and a confirmation email is dispatched immediately.
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
                  placeholder="e.g. Madaveri Akshay"
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
                    placeholder="runner@gmail.com"
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
                    placeholder="+91 9912063980"
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
                  Address Line 1 (House No, Street, Landmark) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. House No. 6-126/3, Near Temple"
                  value={shippingLine1}
                  onChange={(e) => setShippingLine1(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Address Line 2 (Optional Area / Locality)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dichpalli"
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
                    placeholder="e.g. Nizamabad"
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
                    placeholder="e.g. Telangana"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Pincode (6 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="503175"
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
   TAB 2: 📜 E-CERTIFICATE EDITOR
===================================================================== */
function TabCertificateEditor({ toast, getToken }: { toast: any; getToken: any }) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedReg, setSelectedReg] = useState<any>(null);

  // Edit fields
  const [runnerName, setRunnerName] = useState("");
  const [distance, setDistance] = useState("");
  const [finishTimeInput, setFinishTimeInput] = useState("");
  const [saving, setSaving] = useState(false);

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

    setSearching(true);
    try {
      const token = await getToken();
      const res = await adminFetch<{ data: any[] }>(
        `/api/admin/registrations?search=${encodeURIComponent(search.trim())}&pageSize=10`,
        token
      );
      setResults(res.data || []);
      if (!res.data?.length) {
        toast("info", "No registration found with this search term");
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
    setFinishTimeInput(formatSecs(reg.finishTimeSeconds));
  }

  async function handleSaveChanges() {
    if (!selectedReg) return;
    setSaving(true);
    try {
      const token = await getToken();

      // Parse finish time input to seconds
      let finishSeconds: number | null = null;
      if (finishTimeInput.trim()) {
        const parts = finishTimeInput.split(":").map(Number);
        if (parts.length === 3) finishSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) finishSeconds = parts[0] * 60 + parts[1];
        else if (parts.length === 1 && !isNaN(parts[0])) finishSeconds = parts[0];
      }

      // Update registration
      await adminFetch(`/api/admin/registrations/${selectedReg.id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName: runnerName.trim(),
          distance: distance.trim(),
          finishTimeSeconds: finishSeconds,
        }),
      });

      // Ensure / regenerate certificate
      const certRes: any = await adminFetch(
        `/api/admin/registrations/${selectedReg.id}/certificate`,
        token,
        { method: "POST" }
      );

      toast("success", "Certificate details updated and re-generated successfully!");

      // Update local state
      setSelectedReg((prev: any) => ({
        ...prev,
        shippingName: runnerName.trim(),
        distance: distance.trim(),
        finishTimeSeconds: finishSeconds,
        certificate: certRes?.data?.certificate || prev.certificate,
      }));
    } catch (err: any) {
      toast("error", `Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendEmail() {
    if (!selectedReg?.certificate?.id) {
      toast("error", "Please save & generate certificate first before sending email.");
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      await adminFetch(`/api/admin/certificates/${selectedReg.certificate.id}/send`, token, {
        method: "POST",
      });
      toast("success", `Certificate email sent to ${selectedReg.user?.email}!`);
    } catch (err: any) {
      toast("error", `Email sending failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              e-Certificate Editor
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Quickly search any runner to fix typographical errors in their name, distance category, or finish timing (HH:MM:SS), regenerate certificate, and resend confirmation.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search by BIB (e.g. NUD2-867357), Name, or Email..."
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

        {/* Search Results list */}
        {results.length > 0 && !selectedReg && (
          <div className="mt-4 border border-[var(--line)] rounded-xl overflow-hidden divide-y divide-[var(--line)]">
            {results.map((r) => (
              <div
                key={r.id}
                onClick={() => selectRegistration(r)}
                className="p-3.5 flex items-center justify-between hover:bg-[var(--line)]/50 cursor-pointer transition"
              >
                <div>
                  <div className="font-bold text-sm text-[var(--foreground)]">
                    {r.shippingName || r.user?.name}
                  </div>
                  <div className="text-xs text-[var(--muted)] flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-blue-400 font-bold">{r.bibNumber}</span>
                    <span>•</span>
                    <span>{r.event?.title}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{r.distance}</span>
                    {r.finishTimeSeconds && (
                      <>
                        <span>•</span>
                        <span>{formatSecs(r.finishTimeSeconds)}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
                >
                  Select & Edit &rarr;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Selected Runner Edit Card */}
        {selectedReg && (
          <div className="mt-6 border border-blue-500/30 rounded-2xl p-5 bg-gradient-to-b from-blue-950/20 to-transparent space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Editing Runner Certificate</span>
                <div className="font-mono text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                  {selectedReg.bibNumber}
                  <span className="text-xs font-normal text-[var(--muted)]">({selectedReg.event?.title})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                className="text-xs text-[var(--muted)] hover:text-white underline cursor-pointer"
              >
                Change Runner
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Runner Name on Certificate *
                </label>
                <input
                  type="text"
                  value={runnerName}
                  onChange={(e) => setRunnerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-blue-500 outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Distance Category *
                </label>
                <input
                  type="text"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="e.g. 10 km"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-blue-500 outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Finish Time (HH:MM:SS or MM:SS) *
                </label>
                <input
                  type="text"
                  placeholder="00:24:45"
                  value={finishTimeInput}
                  onChange={(e) => setFinishTimeInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-blue-500 outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-[var(--muted)]">
                Certificate Status:{" "}
                <span className="font-semibold text-blue-400">
                  {selectedReg.certificate?.status || "NOT GENERATED YET"}
                </span>
                {selectedReg.certificate?.certificateNumber && (
                  <span className="ml-2 font-mono">({selectedReg.certificate.certificateNumber})</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveChanges}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${saving ? "animate-spin" : ""}`} />
                  Save & Regenerate Certificate
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSendEmail}
                  className="px-4 py-2 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Send Certificate Email
                </button>

                {selectedReg.certificate?.pdfUrl && (
                  <a
                    href={selectedReg.certificate.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--foreground)] inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Certificate
                  </a>
                )}
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
  const [dispatchMode, setDispatchMode] = useState<"single" | "bulk">("single");
  const [loading, setLoading] = useState(false);

  // Single runner state
  const [singleBib, setSingleBib] = useState("");
  const [singleCourier, setSingleCourier] = useState("DTDC Express");
  const [singleTracking, setSingleTracking] = useState("");
  const [singleUrl, setSingleUrl] = useState("");

  // Bulk state
  const [bulkText, setBulkText] = useState("");
  const [bulkResults, setBulkResults] = useState<any>(null);

  const COURIER_SUGGESTIONS = ["DTDC Express", "Delhivery", "BlueDart", "India Post Speed Post", "Xpressbees"];

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

      if (res.data.sentCount > 0) {
        toast("success", `Tracking email sent successfully for ${singleBib}!`);
        setSingleBib("");
        setSingleTracking("");
        setSingleUrl("");
      } else {
        toast("error", `Failed: ${res.data.results?.[0]?.error || "Could not find registration"}`);
      }
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkText.trim()) {
      toast("error", "Please paste lines in format: BIB, Courier, TrackingNumber");
      return;
    }

    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const items = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      return {
        bibNumber: parts[0] || "",
        courier: parts[1] || "DTDC Express",
        trackingNumber: parts[2] || "",
      };
    }).filter((item) => item.bibNumber && item.trackingNumber);

    if (items.length === 0) {
      toast("error", "No valid items parsed. Format should be: BIB, Courier, TrackingNumber");
      return;
    }

    setLoading(true);
    setBulkResults(null);

    try {
      const token = await getToken();
      const res: any = await adminFetch("/api/admin/medals/dispatch-email", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      setBulkResults(res.data);
      toast("success", `Dispatched ${res.data.sentCount} tracking emails!`);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Send Tracking ID Emails
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Send courier dispatch details and live tracking links to runners individually or in bulk via batch paste.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 border-b border-[var(--line)] pb-4 mb-5">
          <button
            type="button"
            onClick={() => setDispatchMode("single")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              dispatchMode === "single"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                : "bg-[var(--background)] border border-[var(--line)] text-[var(--muted)] hover:text-white"
            }`}
          >
            Single Runner Dispatch
          </button>
          <button
            type="button"
            onClick={() => setDispatchMode("bulk")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              dispatchMode === "bulk"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                : "bg-[var(--background)] border border-[var(--line)] text-[var(--muted)] hover:text-white"
            }`}
          >
            Bulk Batch Dispatch
          </button>
        </div>

        {/* Mode 1: Single */}
        {dispatchMode === "single" && (
          <form onSubmit={handleSingleDispatch} className="max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Runner BIB Number (e.g. NUD2-867357 or GJVR-620288) *
              </label>
              <input
                type="text"
                required
                placeholder="NUD2-867357"
                value={singleBib}
                onChange={(e) => setSingleBib(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
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
                    className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--background)] hover:border-purple-500 text-[11px] text-[var(--muted)] hover:text-white transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Tracking / AWB Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 7D136259434"
                value={singleTracking}
                onChange={(e) => setSingleTracking(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Tracking URL (Optional - leave blank for auto-generated tracking link)
              </label>
              <input
                type="url"
                placeholder="https://www.dtdc.com/track-your-shipment/"
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
                  <Send className="w-4 h-4" /> Save Tracking & Send Email
                </>
              )}
            </button>
          </form>
        )}

        {/* Mode 2: Bulk */}
        {dispatchMode === "bulk" && (
          <form onSubmit={handleBulkDispatch} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Paste Multiple Rows (Format: BIB, Courier, TrackingNumber) *
              </label>
              <textarea
                rows={6}
                required
                placeholder={`NUD2-867357, DTDC Express, 7D136259434\nNUD2-787753, DTDC Express, 7D136259435\nGJVR-620288, Delhivery, 14238918239`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-purple-500 outline-none font-mono resize-y"
              />
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Tip: Copy 3 columns (BIB, Courier, Tracking) from Excel or Google Sheets and paste directly here.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition shadow-lg shadow-purple-900/30 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Sending Bulk Emails...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Tracking Emails to All
                </>
              )}
            </button>

            {bulkResults && (
              <div className="mt-4 p-4 rounded-xl border border-purple-500/30 bg-purple-950/30 space-y-2">
                <div className="font-bold text-sm text-purple-300">
                  Batch Dispatch Summary: {bulkResults.sentCount} Sent, {bulkResults.failCount} Failed
                </div>
                <div className="max-h-48 overflow-y-auto text-xs space-y-1 divide-y divide-[var(--line)]">
                  {bulkResults.results?.map((r: any, idx: number) => (
                    <div key={idx} className="pt-1 flex items-center justify-between">
                      <span className="font-mono">{r.bibNumber || r.item?.bibNumber}</span>
                      <span className={r.success ? "text-emerald-400" : "text-rose-400"}>
                        {r.success ? "Sent ✅" : r.error || "Failed ❌"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                Export a formatted delivery manifest (.csv) with runner names, contact numbers, full addresses, and medal dispatch status ready for courier partners.
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
                Configure virtual running events, change registration fees, update posters, edit distances, and manage registration availability.
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
  const [rankedAthletes, setRankedAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTimeInput, setEditTimeInput] = useState("");

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  useEffect(() => {
    if (activeEvent && !selectedEventId) {
      setSelectedEventId(activeEvent.id);
      setSelectedDistance(activeEvent.distances?.[0] || "5 km");
    }
  }, [activeEvent, selectedEventId]);

  const loadLeaderboard = useCallback(async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res: any = await adminFetch(
        `/api/admin/leaderboard-manager?eventId=${selectedEventId}&distance=${encodeURIComponent(selectedDistance)}`,
        token
      );
      setRankedAthletes(res.data || []);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, selectedDistance, getToken, toast]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  function startEdit(ath: any) {
    setEditingId(ath.id);
    setEditTimeInput(ath.finishTimeFormatted || "00:25:00");
  }

  async function handleSaveTime(athleteId: string) {
    const parts = editTimeInput.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];

    if (!seconds) {
      toast("error", "Enter time in format HH:MM:SS");
      return;
    }

    try {
      const token = await getToken();
      await adminFetch(`/api/admin/leaderboard-manager/${athleteId}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finishTimeSeconds: seconds }),
      });
      toast("success", "Timing updated! Rank recalculated.");
      setEditingId(null);
      loadLeaderboard();
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  async function handleBump(athleteIndex: number, direction: "up" | "down") {
    const current = rankedAthletes[athleteIndex];
    if (!current) return;

    let newSeconds = current.finishTimeSeconds;
    if (direction === "up") {
      if (athleteIndex === 0) {
        // Already #1, shave off 2 seconds
        newSeconds = Math.max(10, current.finishTimeSeconds - 2);
      } else {
        const above = rankedAthletes[athleteIndex - 1];
        newSeconds = Math.max(10, above.finishTimeSeconds - 1);
      }
    } else {
      if (athleteIndex >= rankedAthletes.length - 1) {
        newSeconds = current.finishTimeSeconds + 5;
      } else {
        const below = rankedAthletes[athleteIndex + 1];
        newSeconds = below.finishTimeSeconds + 1;
      }
    }

    try {
      const token = await getToken();
      await adminFetch(`/api/admin/leaderboard-manager/${current.id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finishTimeSeconds: newSeconds }),
      });
      toast("success", `Bumped ${direction}! Re-ranked.`);
      loadLeaderboard();
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Leaderboard Controller
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Adjust runner placements on the public leaderboard. Edit finish timings in seconds or use Move Up / Move Down to reposition podium contenders.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadLeaderboard}
            className="px-3.5 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--line)] inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Leaderboard
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Event</label>
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
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Distance Category</label>
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
        </div>

        {/* Leaderboard Table */}
        <div className="mt-4 border border-[var(--line)] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--line)] text-[var(--muted)] uppercase font-semibold">
                <th className="p-3 w-16 text-center">Rank</th>
                <th className="p-3">Athlete</th>
                <th className="p-3 font-mono">BIB</th>
                <th className="p-3">Official Finish Time</th>
                <th className="p-3">Proof Status</th>
                <th className="p-3 text-right">Actions (Rank Adjustment)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading ranking...
                  </td>
                </tr>
              ) : rankedAthletes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">
                    No approved finishers found for this distance category yet.
                  </td>
                </tr>
              ) : (
                rankedAthletes.map((ath, idx) => (
                  <tr key={ath.id} className="hover:bg-[var(--line)]/20">
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                        idx === 0
                          ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
                          : idx === 1
                          ? "bg-slate-300 text-slate-950 font-bold"
                          : idx === 2
                          ? "bg-amber-700 text-white font-bold"
                          : "bg-[var(--line)] text-[var(--muted)]"
                      }`}>
                        #{ath.rank}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-sm text-[var(--foreground)]">{ath.runnerName}</div>
                      <div className="text-[11px] text-[var(--muted)]">{ath.email}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">{ath.bibNumber}</td>
                    <td className="p-3">
                      {editingId === ath.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editTimeInput}
                            onChange={(e) => setEditTimeInput(e.target.value)}
                            className="px-2 py-1 rounded border border-yellow-500 bg-[var(--background)] font-mono text-xs w-24"
                          />
                          <button
                            onClick={() => handleSaveTime(ath.id)}
                            className="px-2 py-1 rounded bg-yellow-500 text-black font-bold text-[11px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-base font-bold text-[var(--foreground)]">
                          {ath.finishTimeFormatted}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {ath.proofStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleBump(idx, "up")}
                          title="Move Rank Up (Faster)"
                          className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--background)] hover:bg-emerald-500/20 text-emerald-400 hover:border-emerald-500/40"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBump(idx, "down")}
                          title="Move Rank Down (Slower)"
                          className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--background)] hover:bg-rose-500/20 text-rose-400 hover:border-rose-500/40"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(ath)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-xs text-[var(--muted)] hover:text-white"
                        >
                          Edit Time
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
              Manage the community photo showcase. Upload runner memories, medal photos, or remove outdated entries from the website gallery.
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
                placeholder="National Unity Day 2026"
                className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--foreground)] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Caption (e.g. Rahul finishing his 10 km run in Delhi)"
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
      const res = await adminFetch<{ data: any[] }>(
        `/api/admin/registrations?search=${encodeURIComponent(bibInput.trim())}&pageSize=1`,
        token
      );
      if (res.data?.[0]) {
        setRunner(res.data[0]);
      } else {
        toast("error", "No runner found with this BIB / mobile number!");
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
              For runners who share activity screenshots via WhatsApp instead of the website: enter their finish time to approve their proof and issue certificates instantly.
            </p>
          </div>
        </div>

        {/* Step 1: Search Runner */}
        <form onSubmit={handleFindRunner} className="max-w-xl flex gap-2 mb-6">
          <input
            type="text"
            required
            placeholder="Enter BIB Number (e.g. NUD2-867357) or Phone Number..."
            value={bibInput}
            onChange={(e) => setBibInput(e.target.value.toUpperCase())}
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
                Finish Time (Total time in HH:MM:SS) *
              </label>
              <input
                type="text"
                required
                placeholder="00:26:45"
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
                  placeholder="https://..."
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
                Track jersey sizes for Top 3 podium finishers across all categories. Copy WhatsApp claim links, send reminder emails, and export sizes for merchandise printing.
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
