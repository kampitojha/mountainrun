"use client";

import { useAuth } from "@clerk/nextjs";
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Filter,
  IndianRupee,
  Mail,
  RefreshCw,
  Repeat,
  Sparkles,
  TrendingUp,
  Trophy,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../lib/admin-api";
import { AdminEmpty, AdminPageHeader, AdminPanel } from "./ui";

type EventBreakdown = {
  eventId: string;
  slug: string;
  title: string;
  status: string;
  priceInPaise: number;
  totalRegistrations: number;
  paidCount: number;
  pendingCount: number;
  revenueInPaise: number;
  revenueInr: number;
  conversionRate: number;
  sharePercent: number;
};

type DailyTrend = {
  date: string;
  label: string;
  revenuePaise: number;
  revenueInr: number;
  regsCount: number;
  paidCount: number;
};

type Overview = {
  timeRange: "today" | "3d" | "7d" | "30d" | "all";
  eventId: string | null;
  stats: {
    revenueInPaise: number;
    revenueInr: number;
    registrations: number;
    confirmedRegs: number;
    pendingPayment: number;
    paidCount: number;
    avgOrderValueInr: number;
    conversionRate: number;
    events: number;
    openEvents: number;
    pendingProofs: number;
    proofsNotSubmitted?: number;
    proofsApproved?: number;
    proofsRejected?: number;
    medalsPending: number;
    medalsDispatched?: number;
    medalsDelivered?: number;
    medalsFulfilled?: number;
    users: number;
    newRunners?: number;
    repeatRunners?: number;
    repeatRate?: number;
    subscribers?: number;
    certificates: number;
  };
  eventBreakdown: EventBreakdown[];
  dailyTrend: DailyTrend[];
  allEvents: Array<{ id: string; slug: string; title: string; status: string }>;
  recentRegistrations: Array<{
    id: string;
    bibNumber: string;
    distance: string;
    status: string;
    registeredAt: string;
    user: { name: string; email: string };
    event: { title: string; slug: string };
    payment?: { status: string; amountInPaise: number } | null;
  }>;
  recentPayments: Array<{
    id: string;
    status: string;
    amountInPaise: number;
    createdAt: string;
    registration: {
      bibNumber: string;
      user: { name: string };
      event: { title: string };
    };
  }>;
};

const TIME_RANGES = [
  { key: "today", label: "Today" },
  { key: "3d", label: "Past 3 Days" },
  { key: "7d", label: "Past 7 Days" },
  { key: "30d", label: "This Month (30d)" },
  { key: "all", label: "All Time" },
] as const;

const GRAPH_RANGES = [
  { key: "7d", label: "7 Days" },
  { key: "14d", label: "14 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "1y", label: "1 Year" },
] as const;

export default function AdminOverviewPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRange, setSelectedRange] = useState<"today" | "3d" | "7d" | "30d" | "all">("today");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [selectedGraphRange, setSelectedGraphRange] = useState<"7d" | "14d" | "30d" | "90d" | "1y">("7d");
  const [graphMetric, setGraphMetric] = useState<"revenue" | "orders">("revenue");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken().catch(() => null);
      const queryParams = new URLSearchParams();
      queryParams.set("range", selectedRange);
      queryParams.set("graphRange", selectedGraphRange);
      if (selectedEventId && selectedEventId !== "all") {
        queryParams.set("eventId", selectedEventId);
      }

      const json = await adminFetch<{ data: Overview }>(`/api/admin/overview?${queryParams.toString()}`, token);
      setData(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  }, [getToken, selectedEventId, selectedGraphRange, selectedRange]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div>
        <AdminPageHeader title="Executive Overview" description="Could not load live metrics." />
        <div className="admin-panel admin-panel-pad">
          <p className="admin-danger" style={{ margin: 0 }}>
            {error}
          </p>
          <button className="btn btn-secondary" onClick={() => void load()} style={{ marginTop: "0.85rem" }} type="button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxDailyRev = data ? Math.max(...data.dailyTrend.map((d) => d.revenueInr), 100) : 100;

  return (
    <div className="admin-stack pb-12">
      {/* ── TOP HEADER WITH CONTROLS ──────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-(--line) pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 font-bold text-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="admin-kicker mb-0">Executive Analytics</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-(--foreground)">
            Revenue & Performance
          </h1>
          <p className="text-xs sm:text-sm text-(--muted) mt-0.5">
            Real-time breakdown of event revenue, conversions, and fulfillment pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void load()}
            disabled={loading}
            className="btn btn-secondary h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link className="btn btn-secondary h-9 px-3 text-xs" href="/admin/proofs">
            Review Proofs ({data?.stats.pendingProofs ?? 0})
          </Link>
          <Link className="btn btn-primary h-9 px-3 text-xs" href="/admin/events">
            + New Event
          </Link>
        </div>
      </div>

      {/* ── FILTER TOOLBAR (Time Range & Event Filter) ───────── */}
      <div className="rounded-2xl border border-(--line) bg-(--panel) p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Time Range Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) mr-1 flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3 text-(--sage)" /> Range:
            </span>
            {TIME_RANGES.map((t) => {
              const active = selectedRange === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedRange(t.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-(--sage) text-(--on-accent) shadow-sm"
                      : "border border-(--line) bg-(--panel-soft) text-(--muted) hover:border-(--sage)/30 hover:text-(--foreground)"
                  }`}
                  type="button"
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Event Filter Dropdown */}
          <div className="flex items-center gap-2 min-w-0 sm:min-w-64">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3 text-(--sage)" /> Event:
            </span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="input text-xs font-medium h-9 w-full"
            >
              <option value="all">All Events (Combined)</option>
              {data?.allEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS: FINANCIALS & RUNNERS COMMUNITY ──────────────── */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2 px-0.5">
            <span className="text-[0.68rem] font-black uppercase tracking-wider text-(--muted) flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-(--sage)" /> Financials & Runner Reach
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {/* Revenue */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Revenue
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                  <IndianRupee className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
                  {formatInrFromPaise(data?.stats.revenueInPaise ?? 0)}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  Avg ₹{data?.stats.avgOrderValueInr ?? 0} / order
                </p>
              </div>
            </div>

            {/* Registrations */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Registrations
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--panel-soft) text-(--sage)">
                  <Users className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
                  {data?.stats.registrations ?? 0}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  <Link href="/admin/registrations" className="text-(--sage) hover:underline">
                    {data?.stats.confirmedRegs ?? 0} paid · {data?.stats.pendingPayment ?? 0} pending
                  </Link>
                </p>
              </div>
            </div>

            {/* Conversion */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Conversion
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--panel-soft) text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                  {data?.stats.conversionRate ?? 0}%
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">Paid vs Total</p>
              </div>
            </div>

            {/* Total Users */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Users
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--panel-soft) text-sky-400">
                  <UserCheck className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
                  {data?.stats.users ?? 0}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  <Link href="/admin/users" className="text-(--sage) hover:underline">
                    Registered runners →
                  </Link>
                </p>
              </div>
            </div>

            {/* Active vs New Runners */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Runner Loyalty
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                  <Repeat className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-indigo-400">
                  {data?.stats.repeatRunners ?? 0} <span className="text-xs font-bold text-(--muted)">repeat</span>
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  {data?.stats.newRunners ?? 0} new · {data?.stats.repeatRate ?? 0}% repeat rate
                </p>
              </div>
            </div>

            {/* Email Subscribers */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Subscribers
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                  <Mail className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-rose-400">
                  {data?.stats.subscribers ?? 0}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  <Link href="/admin/newsletter" className="text-(--sage) hover:underline">
                    Newsletter audience →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI METRICS: OPERATIONS & FULFILLMENT LIFECYCLE ───────── */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-0.5">
            <span className="text-[0.68rem] font-black uppercase tracking-wider text-(--muted) flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-(--sage)" /> Operations & Fulfillment Pipeline
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {/* Proof Queue (In Review) */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-500">
                  Proof Queue
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                  <Clock className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-amber-500">
                  {data?.stats.pendingProofs ?? 0}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  <Link href="/admin/proofs" className="text-(--sage) hover:underline">
                    Needs review →
                  </Link>
                </p>
              </div>
            </div>

            {/* Proof Not Submitted */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Proof Pending
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                  <Activity className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
                  {data?.stats.proofsNotSubmitted ?? 0}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">Runners yet to submit proof</p>
              </div>
            </div>

            {/* Approved Finishers */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Finishers
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Award className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-emerald-500">
                  {data?.stats.proofsApproved ?? 0}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  {data?.stats.proofsRejected ? `${data.stats.proofsRejected} rejected · ` : ""}Verified runs
                </p>
              </div>
            </div>

            {/* Medals Fulfillment Tracker */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Medals Dispatched
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400">
                  <Truck className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
                  {data?.stats.medalsFulfilled ?? (data?.stats.medalsDispatched ?? 0) + (data?.stats.medalsDelivered ?? 0)}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  <Link href="/admin/medals" className="text-(--sage) hover:underline">
                    {data?.stats.medalsPending ?? 0} pending fulfillment →
                  </Link>
                </p>
              </div>
            </div>

            {/* Certificates */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Certificates
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                  <Trophy className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
                  {data?.stats.certificates ?? 0}
                </div>
                <p className="text-[0.65rem] text-(--muted) mt-0.5">
                  <Link href="/admin/certificates" className="text-(--sage) hover:underline">
                    Generated & sent →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PERFORMANCE TRAJECTORY CHART (Multi-Period & Metric Selector) ── */}
      {data?.dailyTrend && data.dailyTrend.length > 0 && (() => {
        const trend = data.dailyTrend;
        const totalTrajectoryRev = trend.reduce((acc, d) => acc + d.revenueInr, 0);
        const totalTrajectoryOrders = trend.reduce((acc, d) => acc + d.paidCount, 0);
        const activeDays = trend.filter((d) => (graphMetric === "revenue" ? d.revenueInr > 0 : d.paidCount > 0)).length;
        const avgTrajectoryVal = activeDays > 0
          ? Math.round((graphMetric === "revenue" ? totalTrajectoryRev : totalTrajectoryOrders) / activeDays)
          : 0;
        const peakDay = trend.reduce((max, d) => {
          const val = graphMetric === "revenue" ? d.revenueInr : d.paidCount;
          const maxVal = graphMetric === "revenue" ? max.revenueInr : max.paidCount;
          return val > maxVal ? d : max;
        }, trend[0]);

        const peakVal = graphMetric === "revenue" ? peakDay.revenueInr : peakDay.paidCount;
        const maxVal = Math.max(
          ...trend.map((d) => (graphMetric === "revenue" ? d.revenueInr : d.paidCount)),
          graphMetric === "revenue" ? 100 : 5,
        );

        return (
          <div className="rounded-3xl border border-(--line) bg-(--panel) p-4 sm:p-6 shadow-xs space-y-5">
            {/* Chart Header Controls */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-(--line) pb-4">
              <div>
                <h2 className="text-sm sm:text-base font-black text-(--foreground) flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-(--sage)" /> Performance Trajectory
                </h2>
                <p className="text-xs text-(--muted) mt-0.5">
                  Historical collections and daily order velocity across selected timeframe.
                </p>
              </div>

              {/* Period & Metric Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Metric Selector Pill */}
                <div className="flex items-center rounded-xl bg-(--panel-soft) p-0.5 border border-(--line)">
                  <button
                    onClick={() => setGraphMetric("revenue")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      graphMetric === "revenue"
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "text-(--muted) hover:text-(--foreground)"
                    }`}
                    type="button"
                  >
                    ₹ Revenue
                  </button>
                  <button
                    onClick={() => setGraphMetric("orders")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      graphMetric === "orders"
                        ? "bg-(--sage) text-(--on-accent) shadow-xs"
                        : "text-(--muted) hover:text-(--foreground)"
                    }`}
                    type="button"
                  >
                    🏃 Orders
                  </button>
                </div>

                {/* Period Selector Tabs */}
                <div className="flex items-center gap-1 rounded-xl bg-(--panel-soft) p-0.5 border border-(--line)">
                  {GRAPH_RANGES.map((gr) => {
                    const active = selectedGraphRange === gr.key;
                    return (
                      <button
                        key={gr.key}
                        onClick={() => setSelectedGraphRange(gr.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? "bg-(--foreground) text-(--background) shadow-xs"
                            : "text-(--muted) hover:text-(--foreground)"
                        }`}
                        type="button"
                      >
                        {gr.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Trajectory Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-(--line) bg-(--panel-soft)/50 p-3">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) block">
                  {GRAPH_RANGES.find((r) => r.key === selectedGraphRange)?.label} Total
                </span>
                <span className="text-base sm:text-lg font-black text-(--foreground) font-mono mt-0.5 block">
                  {graphMetric === "revenue"
                    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalTrajectoryRev)
                    : `${totalTrajectoryOrders} orders`}
                </span>
              </div>

              <div className="rounded-2xl border border-(--line) bg-(--panel-soft)/50 p-3">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) block">
                  Active Day Avg
                </span>
                <span className="text-base sm:text-lg font-black text-(--foreground) font-mono mt-0.5 block">
                  {graphMetric === "revenue"
                    ? `₹${avgTrajectoryVal.toLocaleString("en-IN")}/day`
                    : `${avgTrajectoryVal} orders/day`}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-(--line) bg-(--panel-soft)/50 p-3">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) block">
                  Peak ({peakDay?.label || "—"})
                </span>
                <span className="text-base sm:text-lg font-black text-amber-500 font-mono mt-0.5 block">
                  {graphMetric === "revenue" ? `₹${peakVal.toLocaleString("en-IN")}` : `${peakVal} orders`}
                </span>
              </div>
            </div>

            {/* Visual Bars Container */}
            <div className="pt-4 pb-2 border-b border-(--line) overflow-x-auto scrollbar-none">
              <div
                className={`flex items-end h-44 gap-1.5 sm:gap-2 ${
                  trend.length <= 14 ? "justify-between min-w-full" : "min-w-[620px] justify-between"
                }`}
              >
                {trend.map((day, idx) => {
                  const val = graphMetric === "revenue" ? day.revenueInr : day.paidCount;
                  const heightPercent = val > 0 ? Math.max(12, Math.min(100, Math.round((val / maxVal) * 100))) : 4;

                  // For label visibility on dense charts (30d / 90d)
                  const showLabel =
                    trend.length <= 14 ||
                    (trend.length === 30 && (idx % 3 === 0 || idx === trend.length - 1)) ||
                    (trend.length > 30 && (idx % 7 === 0 || idx === trend.length - 1));

                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative min-w-[14px]"
                    >
                      {/* Floating Hover Tooltip */}
                      <div className="opacity-0 pointer-events-none group-hover:opacity-100 absolute -top-12 bg-slate-950 text-white border border-(--line) text-[0.65rem] font-bold py-1.5 px-2.5 rounded-xl shadow-2xl transition-all duration-200 whitespace-nowrap z-30 transform -translate-y-1 group-hover:translate-y-0">
                        <div className="text-(--sage) font-mono text-[0.6rem] uppercase tracking-wider">{day.label}</div>
                        <div className="text-white text-xs font-black font-mono">₹{day.revenueInr.toLocaleString("en-IN")}</div>
                        <div className="text-slate-400 text-[0.6rem] font-medium">{day.paidCount} paid orders</div>
                      </div>

                      {/* Top value indicator (on wider charts) */}
                      {trend.length <= 14 && (
                        <div className="text-[0.6rem] sm:text-xs font-mono font-bold text-(--foreground) opacity-75">
                          {val > 0 ? (graphMetric === "revenue" ? `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}` : val) : "—"}
                        </div>
                      )}

                      {/* Animated Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-12 rounded-t-lg sm:rounded-t-xl transition-all duration-300 ${
                          val > 0
                            ? graphMetric === "revenue"
                              ? "bg-gradient-to-t from-amber-500 to-yellow-400 group-hover:brightness-125 shadow-xs"
                              : "bg-gradient-to-t from-(--sage) to-emerald-400 group-hover:brightness-125 shadow-xs"
                            : "bg-(--panel-soft) border border-dashed border-(--line)"
                        }`}
                      />

                      {/* Date Axis Label */}
                      <span
                        className={`text-[0.55rem] sm:text-xs font-semibold text-(--muted) tracking-tight truncate ${
                          showLabel ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── RECENT REGISTRATIONS & RECENT PAYMENTS SPLIT ───────── */}
      <div className="admin-split">
        <AdminPanel
          fill
          action={
            <Link className="admin-link" href="/admin/registrations">
              View all
            </Link>
          }
          title="Recent registrations"
          subtitle="Latest runners who joined"
        >
          {data?.recentRegistrations.length === 0 ? (
            <AdminEmpty>No registrations in this time window.</AdminEmpty>
          ) : (
            <div className="admin-list is-stretch">
              {data?.recentRegistrations.map((row) => (
                <Link className="admin-list-item" href={`/admin/registrations/${row.id}`} key={row.id}>
                  <div>
                    <div className="title">{row.user.name}</div>
                    <div className="sub">
                      {row.event.title} · {row.distance} · {row.bibNumber}
                    </div>
                  </div>
                  <div className="right">
                    <span className="badge">{row.status}</span>
                    <div className="sub" style={{ marginTop: "0.35rem" }}>
                      {formatDateTime(row.registeredAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel
          fill
          action={
            <Link className="admin-link" href="/admin/payments">
              View all
            </Link>
          }
          title="Recent payments"
          subtitle="Latest successful transactions"
        >
          {data?.recentPayments.length === 0 ? (
            <AdminEmpty>No payments in this time window.</AdminEmpty>
          ) : (
            <div className="admin-list is-stretch">
              {data?.recentPayments.map((row) => (
                <div className="admin-list-item" key={row.id}>
                  <div>
                    <div className="title">{row.registration.user.name}</div>
                    <div className="sub">
                      {row.registration.event.title} · {row.registration.bibNumber}
                    </div>
                  </div>
                  <div className="right">
                    <div className="title font-bold text-emerald-600 dark:text-emerald-400">
                      {formatInrFromPaise(row.amountInPaise)}
                    </div>
                    <div style={{ marginTop: "0.35rem" }}>
                      <span className="badge">{row.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
