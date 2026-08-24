"use client";

import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  IndianRupee,
  Mail,
  Medal,
  Phone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Tag,
  Trophy,
  Truck,
  User,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../lib/admin-api";

export type OmniRegistration = {
  id: string;
  bibNumber: string;
  distance: string;
  activityType: string;
  status: string;
  proofStatus: string;
  shippingName: string;
  shippingPhone: string;
  shippingCity: string;
  registeredAt: string;
  finishTimeSeconds: number | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  event: {
    id: string;
    title: string;
    slug: string;
    distances: string[];
    startsAt: string;
    endsAt: string;
    bannerImageUrl: string | null;
  };
  payment: {
    id: string;
    status: string;
    amountInPaise: number;
    razorpayPaymentId: string | null;
    razorpayOrderId: string;
    paidAt: string | null;
  } | null;
  proofUpload: {
    id: string;
    status: string;
    activityImageUrl: string;
    sourceApp: string;
    submittedAt: string;
  } | null;
  certificate: {
    id: string;
    certificateNumber: string;
    pdfUrl: string | null;
  } | null;
  medalDelivery: {
    id: string;
    status: string;
    trackingNumber: string | null;
    courier: string | null;
    trackingUrl: string | null;
    dispatchedAt: string | null;
    deliveredAt: string | null;
  } | null;
};

export type OmniUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  username: string | null;
  createdAt: string;
  _count: { registrations: number };
  registrations: Array<{
    event: { title: string; slug: string };
    payment: { status: string; amountInPaise: number } | null;
  }>;
};

export type OmniPayment = {
  id: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string;
  amountInPaise: number;
  status: string;
  createdAt: string;
  registration: {
    id: string;
    bibNumber: string;
    distance: string;
    user: { id: string; name: string; email: string; phone: string | null };
    event: { id: string; title: string; slug: string };
  };
};

export type OmniSearchResult = {
  query: string;
  registrations: OmniRegistration[];
  users: OmniUser[];
  payments: OmniPayment[];
};

export function OmniSearch() {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OmniSearchResult | null>(null);
  const [activeModalReg, setActiveModalReg] = useState<OmniRegistration | null>(null);

  // Quick action states inside modal
  const [selectedDistance, setSelectedDistance] = useState<string>("");
  const [updatingDistance, setUpdatingDistance] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        if (!activeModalReg) {
          setResults(null);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalReg]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const token = await getToken().catch(() => null);
        const json = await adminFetch<{ data: OmniSearchResult }>(
          `/api/admin/omni-search?q=${encodeURIComponent(trimmed)}`,
          token,
        );
        setResults(json.data);
      } catch (err) {
        console.error("Omni search error:", err);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(handler);
  }, [query, getToken]);

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenRegistrationModal = (reg: OmniRegistration) => {
    setActiveModalReg(reg);
    setSelectedDistance(reg.distance);
    setActionMessage(null);
    setIsOpen(false);
  };

  const handleSaveDistance = async () => {
    if (!activeModalReg || !selectedDistance || selectedDistance === activeModalReg.distance) return;
    setUpdatingDistance(true);
    setActionMessage(null);
    try {
      const token = await getToken().catch(() => null);
      const res = await adminFetch<{ data: OmniRegistration }>(
        `/api/admin/registrations/${activeModalReg.id}`,
        token,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ distance: selectedDistance }),
        },
      );
      setActiveModalReg(res.data);
      setActionMessage({ text: `Distance updated to ${selectedDistance} successfully!`, type: "success" });
    } catch (err: any) {
      setActionMessage({ text: err.message || "Failed to update distance", type: "error" });
    } finally {
      setUpdatingDistance(false);
    }
  };

  const handleResendEmail = async () => {
    if (!activeModalReg) return;
    setResendingEmail(true);
    setActionMessage(null);
    try {
      const token = await getToken().catch(() => null);
      const res = await adminFetch<{ data: { success: boolean; email: string } }>(
        `/api/admin/registrations/${activeModalReg.id}/resend-email`,
        token,
        { method: "POST" },
      );
      if (res.data.success) {
        setActionMessage({ text: `Confirmation email delivered to ${res.data.email}!`, type: "success" });
      } else {
        setActionMessage({ text: "Email dispatch failed. Please check Resend logs.", type: "error" });
      }
    } catch (err: any) {
      setActionMessage({ text: err.message || "Failed to send email", type: "error" });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!activeModalReg) return;
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/registrations/${activeModalReg.id}/mark-paid`, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInPaise: activeModalReg.event.distances ? 39900 : undefined }),
      });
      // Refresh modal
      const refreshed = await adminFetch<{ data: OmniRegistration }>(
        `/api/admin/registrations/${activeModalReg.id}`,
        token,
      );
      setActiveModalReg(refreshed.data);
      setActionMessage({ text: "Registration marked as PAID successfully!", type: "success" });
    } catch (err: any) {
      setActionMessage({ text: err.message || "Failed to mark as paid", type: "error" });
    }
  };

  const hasResults =
    results &&
    ((results.registrations?.length ?? 0) > 0 ||
      (results.users?.length ?? 0) > 0 ||
      (results.payments?.length ?? 0) > 0);

  return (
    <>
      {/* ── TOP SEARCH BAR ────────────────────────────────────── */}
      <div className="relative w-full max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-(--muted) pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search BIB (SDC-879448), runner name, email, phone, or Razorpay ID..."
            className="w-full h-10 pl-10 pr-24 rounded-xl border border-(--line) bg-(--panel) text-xs sm:text-sm text-(--foreground) placeholder:text-(--muted-soft) focus:outline-none focus:border-(--sage) focus:ring-1 focus:ring-(--sage) transition-all shadow-xs"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-(--sage) mr-1" />}
            {query ? (
              <button
                onClick={() => {
                  setQuery("");
                  setResults(null);
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded-md text-(--muted) hover:text-(--foreground) hover:bg-(--panel-soft) cursor-pointer"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-(--line) bg-(--panel-soft) px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold text-(--muted)">
                <span className="text-[0.6rem]">⌘</span>K
              </kbd>
            )}
          </div>
        </div>

        {/* ── SEARCH RESULTS DROPDOWN ─────────────────────────── */}
        <AnimatePresence>
          {isOpen && query.trim().length >= 2 && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: 6, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-12 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-(--line) bg-(--panel) p-2 shadow-2xl backdrop-blur-xl"
            >
              {loading && !results ? (
                <div className="p-6 text-center text-xs text-(--muted) flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-(--sage)" />
                  Searching runners, BIBs, and payments...
                </div>
              ) : !hasResults ? (
                <div className="p-8 text-center">
                  <p className="text-xs font-semibold text-(--foreground)">No matches found for &quot;{query}&quot;</p>
                  <p className="text-[0.7rem] text-(--muted) mt-1">
                    Try searching by BIB number (e.g. SDC-...), email, name, phone, or Razorpay ID.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 p-1">
                  {/* 1. Registrations / BIB Matches */}
                  {results && results.registrations.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                        <span className="flex items-center gap-1 text-(--sage)">
                          <Medal className="h-3 w-3" /> Registrations & BIBs ({results.registrations.length})
                        </span>
                        <span>Click for 360° Operations</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {results.registrations.map((reg) => (
                          <div
                            key={reg.id}
                            onClick={() => handleOpenRegistrationModal(reg)}
                            className="group flex items-center justify-between gap-3 p-2.5 rounded-xl border border-transparent hover:border-(--sage)/30 hover:bg-(--sage-soft)/30 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono text-xs font-black px-2 py-1 rounded-lg bg-(--panel-soft) border border-(--line) text-(--foreground) group-hover:border-(--sage)/40 shrink-0">
                                {reg.bibNumber}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-(--foreground) truncate flex items-center gap-1.5">
                                  {reg.shippingName || reg.user?.name || "Runner"}
                                  <span className="text-[0.65rem] font-mono font-medium px-1.5 py-0.2 rounded bg-(--panel-soft) text-(--muted)">
                                    {reg.distance}
                                  </span>
                                </p>
                                <p className="text-[0.68rem] text-(--muted) truncate">
                                  {reg.user?.email} · {reg.event?.title}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[0.65rem] font-bold uppercase ${
                                  reg.payment?.status === "PAID"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {reg.payment?.status === "PAID" ? "PAID" : "PENDING"}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-(--muted) group-hover:translate-x-0.5 group-hover:text-(--sage) transition-all" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. User Accounts */}
                  {results && results.users.length > 0 && (
                    <div className="border-t border-(--line) pt-2">
                      <div className="flex items-center justify-between px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                        <span className="flex items-center gap-1 text-sky-400">
                          <UserCheck className="h-3 w-3" /> Runners / Users ({results.users.length})
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {results.users.map((usr) => (
                          <Link
                            key={usr.id}
                            href={`/admin/users/${usr.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-transparent hover:border-sky-500/30 hover:bg-sky-500/5 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-7 w-7 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {usr.name?.slice(0, 1).toUpperCase() || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-(--foreground) truncate">{usr.name}</p>
                                <p className="text-[0.68rem] text-(--muted) truncate">
                                  {usr.email} {usr.phone ? `· ${usr.phone}` : ""}
                                </p>
                              </div>
                            </div>
                            <span className="text-[0.65rem] font-semibold text-(--muted) shrink-0">
                              {usr._count.registrations} race{usr._count.registrations === 1 ? "" : "s"}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Payments */}
                  {results && results.payments.length > 0 && (
                    <div className="border-t border-(--line) pt-2">
                      <div className="flex items-center justify-between px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                        <span className="flex items-center gap-1 text-amber-500">
                          <IndianRupee className="h-3 w-3" /> Payments ({results.payments.length})
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {results.payments.map((pmt) => (
                          <Link
                            key={pmt.id}
                            href={`/admin/payments`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-transparent hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                          >
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-bold text-(--foreground) truncate">
                                {pmt.razorpayPaymentId || pmt.razorpayOrderId}
                              </p>
                              <p className="text-[0.68rem] text-(--muted) truncate">
                                {pmt.registration?.user?.name} · {pmt.registration?.event?.title} (BIB:{" "}
                                {pmt.registration?.bibNumber})
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-(--foreground)">
                                {formatInrFromPaise(pmt.amountInPaise)}
                              </span>
                              <span className="block text-[0.6rem] uppercase font-bold text-emerald-500">
                                {pmt.status}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 360° RUNNER QUICK OPERATIONS MODAL ─────────────────── */}
      <AnimatePresence>
        {activeModalReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-(--line) bg-(--panel) p-5 sm:p-7 shadow-2xl"
            >
              {/* Modal Top Bar */}
              <div className="flex items-start justify-between gap-3 border-b border-(--line) pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black text-sm">
                    <Medal className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-(--foreground)">
                        {activeModalReg.shippingName || activeModalReg.user?.name || "Runner Profile"}
                      </h2>
                      <button
                        onClick={() => copyToClipboard(activeModalReg.bibNumber, "bib")}
                        className="inline-flex items-center gap-1 font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-(--sage-soft) text-(--sage) border border-(--sage)/30 hover:bg-(--sage) hover:text-(--on-accent) transition-all cursor-pointer"
                        title="Click to copy BIB"
                        type="button"
                      >
                        <span>{activeModalReg.bibNumber}</span>
                        {copiedField === "bib" ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-70" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-(--muted) mt-0.5">
                      {activeModalReg.event?.title} · Registered on {formatDateTime(activeModalReg.registeredAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalReg(null)}
                  className="h-8 w-8 rounded-xl border border-(--line) bg-(--panel-soft) flex items-center justify-center text-(--muted) hover:text-(--foreground) hover:border-(--sage) cursor-pointer"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action Banner Notifications */}
              {actionMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    actionMessage.type === "success"
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{actionMessage.text}</span>
                </motion.div>
              )}

              {/* 360° Data Grid */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Runner Contact Info */}
                <div className="rounded-2xl border border-(--line) bg-(--panel-soft) p-4 space-y-2.5">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) flex items-center gap-1.5">
                    <User className="h-3 w-3 text-(--sage)" /> Runner Contact
                  </p>
                  <div className="text-xs space-y-1.5 font-medium text-(--foreground)">
                    <div className="flex items-center justify-between">
                      <span className="text-(--muted)">Email:</span>
                      <button
                        onClick={() => copyToClipboard(activeModalReg.user?.email, "email")}
                        className="font-mono text-[0.72rem] text-(--sage) hover:underline flex items-center gap-1 cursor-pointer"
                        type="button"
                      >
                        {activeModalReg.user?.email}
                        {copiedField === "email" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-(--muted)">Phone:</span>
                      <span className="font-mono text-[0.72rem]">
                        {activeModalReg.shippingPhone || activeModalReg.user?.phone || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-(--muted)">City:</span>
                      <span>{activeModalReg.shippingCity || "Virtual"}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Card */}
                <div className="rounded-2xl border border-(--line) bg-(--panel-soft) p-4 space-y-2.5">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <IndianRupee className="h-3 w-3 text-amber-500" /> Payment Status
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase ${
                        activeModalReg.payment?.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {activeModalReg.payment?.status === "PAID" ? "PAID" : "PENDING"}
                    </span>
                  </p>
                  <div className="text-xs space-y-1.5 font-medium text-(--foreground)">
                    <div className="flex items-center justify-between">
                      <span className="text-(--muted)">Amount:</span>
                      <span className="font-bold text-sm">
                        {formatInrFromPaise(activeModalReg.payment?.amountInPaise ?? 39900)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-(--muted)">Payment ID:</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            activeModalReg.payment?.razorpayPaymentId || activeModalReg.payment?.razorpayOrderId || "",
                            "pmt",
                          )
                        }
                        className="font-mono text-[0.7rem] text-(--muted) hover:text-(--foreground) flex items-center gap-1 cursor-pointer"
                        type="button"
                      >
                        {activeModalReg.payment?.razorpayPaymentId || activeModalReg.payment?.razorpayOrderId || "—"}
                        {copiedField === "pmt" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── QUICK ACTION CONTROLS ───────────────────────── */}
              <div className="mt-5 rounded-2xl border border-(--sage)/30 bg-(--sage-soft)/10 p-4 space-y-4">
                <p className="text-xs font-black uppercase tracking-wider text-(--sage) flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Instant Quick Operations
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  {/* Distance Update Dropdown */}
                  <div>
                    <label className="block text-[0.7rem] font-bold text-(--muted) mb-1.5">
                      Change Runner Distance
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedDistance}
                        onChange={(e) => setSelectedDistance(e.target.value)}
                        className="input text-xs font-semibold h-9 flex-1"
                      >
                        {(
                          activeModalReg.event.distances || [
                            "1.6 km",
                            "3.2 km",
                            "5 km",
                            "7 km",
                            "10 km",
                            "15 km",
                            "21 km",
                          ]
                        ).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleSaveDistance}
                        disabled={updatingDistance || selectedDistance === activeModalReg.distance}
                        className="btn btn-primary h-9 px-3 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                        type="button"
                      >
                        {updatingDistance ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* Resend Confirmation Email */}
                  <div>
                    <label className="block text-[0.7rem] font-bold text-(--muted) mb-1.5">
                      Email Dispatch
                    </label>
                    <button
                      onClick={handleResendEmail}
                      disabled={resendingEmail}
                      className="btn btn-secondary w-full h-9 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      type="button"
                    >
                      {resendingEmail ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-(--sage)" />
                      ) : (
                        <Send className="h-3.5 w-3.5 text-(--sage)" />
                      )}
                      <span>Resend Confirmation Email</span>
                    </button>
                  </div>
                </div>

                {/* Mark as Paid Action if pending */}
                {activeModalReg.payment?.status !== "PAID" && (
                  <div className="pt-2 border-t border-(--line) flex items-center justify-between">
                    <span className="text-xs text-amber-500 font-semibold">
                      Payment is currently PENDING. Mark as paid if received via UPI/Cash:
                    </span>
                    <button
                      onClick={handleMarkPaid}
                      className="btn btn-primary h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                      type="button"
                    >
                      Mark as Paid (₹399)
                    </button>
                  </div>
                )}
              </div>

              {/* Proof, Certificate & Medal Details */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Proof */}
                <div className="p-3 rounded-xl border border-(--line) bg-(--panel-soft)">
                  <span className="text-[0.65rem] font-bold uppercase text-(--muted) block mb-1">
                    GPS Proof Status
                  </span>
                  <span className="font-bold text-(--foreground) block">
                    {activeModalReg.proofStatus}
                  </span>
                  {activeModalReg.proofUpload?.activityImageUrl && (
                    <a
                      href={activeModalReg.proofUpload.activityImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.7rem] text-(--sage) hover:underline flex items-center gap-1 mt-1 font-semibold"
                    >
                      View Proof Screenshot <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Certificate */}
                <div className="p-3 rounded-xl border border-(--line) bg-(--panel-soft)">
                  <span className="text-[0.65rem] font-bold uppercase text-(--muted) block mb-1">
                    E-Certificate
                  </span>
                  <span className="font-bold text-(--foreground) block">
                    {activeModalReg.certificate?.certificateNumber || "Not generated yet"}
                  </span>
                  {activeModalReg.certificate && (
                    <Link
                      href={`/certificates/${activeModalReg.certificate.certificateNumber}`}
                      target="_blank"
                      className="text-[0.7rem] text-(--sage) hover:underline flex items-center gap-1 mt-1 font-semibold"
                    >
                      Open Certificate <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {/* Medal */}
                <div className="p-3 rounded-xl border border-(--line) bg-(--panel-soft)">
                  <span className="text-[0.65rem] font-bold uppercase text-(--muted) block mb-1">
                    Medal Dispatch
                  </span>
                  <span className="font-bold text-(--foreground) block">
                    {activeModalReg.medalDelivery?.status || "PENDING"}
                  </span>
                  {activeModalReg.medalDelivery?.trackingNumber && (
                    <span className="text-[0.7rem] font-mono text-(--muted) block mt-0.5">
                      {activeModalReg.medalDelivery.courier}: {activeModalReg.medalDelivery.trackingNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Navigation Link */}
              <div className="mt-5 pt-4 border-t border-(--line) flex items-center justify-between">
                <Link
                  href={`/admin/registrations/${activeModalReg.id}`}
                  onClick={() => setActiveModalReg(null)}
                  className="btn btn-secondary text-xs flex items-center gap-1.5 font-bold"
                >
                  <span>Open Full Registration Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>

                <button
                  onClick={() => setActiveModalReg(null)}
                  className="btn btn-ghost text-xs text-(--muted)"
                  type="button"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
