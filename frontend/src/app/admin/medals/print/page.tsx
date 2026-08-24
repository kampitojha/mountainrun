"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../../lib/admin-api";
import { Loader2 } from "lucide-react";

type PrintItem = {
  id: string;
  bibNumber: string;
  distance: string;
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  event: { title: string };
};

export default function PrintLabelsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<PrintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = await getToken().catch(() => null);
        // Fetch only PENDING (Ready to Ship)
        const params = new URLSearchParams({ pageSize: "500", status: "PENDING" });
        const json = await adminFetch<{ data: PrintItem[] }>(`/api/admin/medals?${params.toString()}`, token);
        setItems(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load records for printing");
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white text-gray-500">
        <p>No pending labels to print.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-8 print:py-0 print:bg-white">
      {/* Non-print controls */}
      <div className="mb-8 flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded bg-black px-6 py-2 font-bold text-white shadow-lg transition hover:bg-gray-800"
        >
          Print Labels
        </button>
      </div>

      {/* Label Grid */}
      <div className="flex flex-col items-center gap-4 print:block print:gap-0">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="print-label relative flex flex-col justify-between overflow-hidden border-2 border-black bg-white text-black"
            style={{
              width: "4in",
              height: "6in",
              padding: "0.25in",
              boxSizing: "border-box",
              pageBreakAfter: "always",
              margin: "0 auto", // center in screen view
            }}
          >
            {/* Top Section - Sender */}
            <div className="border-b-2 border-black pb-2 text-xs">
              <p className="font-black text-sm uppercase">Sender: Mountain Run</p>
              <p>contact@mountainrun.in</p>
            </div>

            {/* Middle Section - Recipient */}
            <div className="flex-1 py-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-600">
                Ship To:
              </p>
              <h2 className="text-2xl font-black uppercase leading-tight">{item.shippingName}</h2>
              <p className="mt-2 text-base font-medium leading-snug">
                {item.shippingLine1}
                {item.shippingLine2 ? `, ${item.shippingLine2}` : ""}
              </p>
              <p className="text-base font-bold uppercase leading-snug">
                {item.shippingCity}, {item.shippingState}
              </p>
              <p className="mt-1 text-2xl font-black">{item.shippingPincode}</p>
              
              <div className="mt-4 inline-block border-2 border-black px-3 py-1">
                <p className="text-sm font-bold">Ph: {item.shippingPhone || "N/A"}</p>
              </div>
            </div>

            {/* Bottom Section - Product Info */}
            <div className="border-t-2 border-black pt-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-600">Product</p>
                  <p className="text-lg font-black uppercase">{item.event.title}</p>
                  <p className="text-base font-bold">Finisher Medal - {item.distance}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-gray-600">BIB</p>
                  <p className="text-xl font-black">{item.bibNumber}</p>
                </div>
              </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page { size: 4in 6in; margin: 0; }
                body { margin: 0; padding: 0; background: white; }
                .print-label { margin: 0 !important; border: none !important; }
              }
            `}} />
          </div>
        ))}
      </div>
    </div>
  );
}
