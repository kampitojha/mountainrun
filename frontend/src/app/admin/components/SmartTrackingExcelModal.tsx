"use client";

import React, { useState, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Send,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { adminFetch } from "../../../lib/admin-api";

interface SmartTrackingExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  getToken: () => Promise<string | null>;
}

type ParsedRow = Record<string, string>;

interface CleanTrackingRow {
  bibNumber: string;
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  originalRowIndex: number;
}

const COMMON_COURIERS = [
  "India Post Speed Post",
  "Delhivery",
  "DTDC Express",
  "BlueDart",
  "Shadowfax",
  "Trackon",
  "Xpressbees",
];

export function SmartTrackingExcelModal({
  isOpen,
  onClose,
  onSuccess,
  getToken,
}: SmartTrackingExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [allHeaders, setAllHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<ParsedRow[]>([]);

  // Column Mappings
  const [bibColumn, setBibColumn] = useState<string>("");
  const [trackingColumn, setTrackingColumn] = useState<string>("");
  const [courierMode, setCourierMode] = useState<"column" | "fixed">("column");
  const [courierColumn, setCourierColumn] = useState<string>("");
  const [fixedCourier, setFixedCourier] = useState<string>("India Post Speed Post");

  // Optional manual text paste tab
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const [pasteText, setPasteText] = useState<string>("");

  // Preview & Processing
  const [searchPreview, setSearchPreview] = useState<string>("");
  const [sendDispatchEmails, setSendDispatchEmails] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resultSummary, setResultSummary] = useState<{
    updated: number;
    errors: Array<{ item: { bibNumber?: string }; error: string }>;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto detect columns from header names
  function autoDetectColumns(headers: string[]) {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Detect BIB column
    let detectedBib = headers.find((h) => {
      const n = normalize(h);
      return (
        n === "bib" ||
        n === "bibnumber" ||
        n === "bibno" ||
        n === "chestno" ||
        n === "chest" ||
        n.includes("bib")
      );
    });
    if (!detectedBib) {
      detectedBib = headers.find((h) => {
        const n = normalize(h);
        return n.includes("order") || n.includes("reg") || n.includes("id");
      });
    }

    // 2. Detect Tracking column
    const detectedTracking = headers.find((h) => {
      const n = normalize(h);
      return (
        n.includes("tracking") ||
        n.includes("track") ||
        n.includes("awb") ||
        n.includes("article") ||
        n.includes("consignment") ||
        n.includes("barcode") ||
        n.includes("waybill") ||
        n.includes("docket")
      );
    });

    // 3. Detect Courier column
    const detectedCourier = headers.find((h) => {
      const n = normalize(h);
      return (
        n.includes("courier") ||
        n.includes("carrier") ||
        n.includes("partner") ||
        n.includes("service") ||
        n.includes("mode")
      );
    });

    setBibColumn(detectedBib || (headers[0] ?? ""));
    setTrackingColumn(detectedTracking || (headers[1] ?? ""));
    if (detectedCourier) {
      setCourierMode("column");
      setCourierColumn(detectedCourier);
    } else {
      setCourierMode("fixed");
    }
  }

  // Handle file reading via SheetJS
  function handleFileSelected(selectedFile: File) {
    setErrorMessage(null);
    setResultSummary(null);
    setFile(selectedFile);
    setFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: "array" });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("No readable sheets found in this Excel file.");
        }

        setSheetNames(workbook.SheetNames);
        const firstSheetName = workbook.SheetNames[0];
        setSelectedSheet(firstSheetName);
        parseWorksheet(workbook, firstSheetName);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to parse file. Please upload a valid .xlsx or .csv.");
      }
    };
    reader.onerror = () => {
      setErrorMessage("Error reading file.");
    };
    reader.readAsArrayBuffer(selectedFile);
  }

  // Parse worksheet data into rows & headers
  function parseWorksheet(workbook: XLSX.WorkBook, sheetName: string) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;

    // Convert sheet to json array of objects
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: "",
      raw: false,
    });

    if (jsonData.length === 0) {
      setErrorMessage("The selected sheet is empty.");
      setAllHeaders([]);
      setRawRows([]);
      return;
    }

    // Extract all unique headers across rows
    const headerSet = new Set<string>();
    jsonData.forEach((row) => {
      Object.keys(row).forEach((k) => headerSet.add(k.trim()));
    });
    const headers = Array.from(headerSet).filter(Boolean);

    // Normalize rows
    const stringRows: ParsedRow[] = jsonData.map((row) => {
      const clean: ParsedRow = {};
      headers.forEach((h) => {
        clean[h] = row[h] != null ? String(row[h]).trim() : "";
      });
      return clean;
    });

    setAllHeaders(headers);
    setRawRows(stringRows);
    autoDetectColumns(headers);
  }

  // Handle Sheet Tab Change
  function handleSheetChange(sheetName: string) {
    if (!file) return;
    setSelectedSheet(sheetName);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(buffer, { type: "array" });
      parseWorksheet(workbook, sheetName);
    };
    reader.readAsArrayBuffer(file);
  }

  // Handle direct text paste (CSV / Tab separated)
  function handlePasteParse() {
    setErrorMessage(null);
    if (!pasteText.trim()) return;

    try {
      const workbook = XLSX.read(pasteText, { type: "string" });
      const firstSheetName = workbook.SheetNames[0];
      setSheetNames(workbook.SheetNames);
      setSelectedSheet(firstSheetName);
      setFileName("Pasted Data.csv");
      parseWorksheet(workbook, firstSheetName);
    } catch {
      setErrorMessage("Could not parse pasted data. Ensure it has header rows.");
    }
  }

  // Generate clean 3-column rows
  const cleanRows: CleanTrackingRow[] = useMemo(() => {
    if (!rawRows.length || !bibColumn || !trackingColumn) return [];

    return rawRows
      .map((row, idx) => {
        const bib = row[bibColumn]?.trim() || "";
        const tracking = row[trackingColumn]?.trim() || "";
        const courier =
          courierMode === "fixed"
            ? fixedCourier.trim()
            : row[courierColumn]?.trim() || fixedCourier.trim();

        // Skip completely empty rows or headers mistakenly captured
        if (!bib && !tracking) return null;

        // Auto-generate tracking URL if recognizable
        let trackingUrl = "";
        const cLower = courier.toLowerCase();
        if (cLower.includes("delhivery")) {
          trackingUrl = `https://www.delhivery.com/track/package/${tracking}`;
        } else if (cLower.includes("post") || cLower.includes("speed")) {
          trackingUrl = `https://www.indiapost.gov.in/`;
        } else if (cLower.includes("dtdc")) {
          trackingUrl = `https://www.dtdc.in/`;
        } else if (cLower.includes("bluedart")) {
          trackingUrl = `https://www.bluedart.com/`;
        }

        return {
          bibNumber: bib.toUpperCase(),
          courier,
          trackingNumber: tracking,
          trackingUrl: trackingUrl || undefined,
          originalRowIndex: idx + 1,
        };
      })
      .filter(Boolean) as CleanTrackingRow[];
  }, [rawRows, bibColumn, trackingColumn, courierMode, courierColumn, fixedCourier]);

  // Valid rows have both BIB and Tracking Number
  const validRows = useMemo(
    () => cleanRows.filter((r) => r.bibNumber && r.trackingNumber),
    [cleanRows]
  );
  const skippedRows = useMemo(
    () => cleanRows.filter((r) => !r.bibNumber || !r.trackingNumber),
    [cleanRows]
  );

  // Filtered rows for preview table search
  const previewList = useMemo(() => {
    if (!searchPreview.trim()) return cleanRows;
    const q = searchPreview.toLowerCase();
    return cleanRows.filter(
      (r) =>
        r.bibNumber.toLowerCase().includes(q) ||
        r.trackingNumber.toLowerCase().includes(q) ||
        r.courier.toLowerCase().includes(q)
    );
  }, [cleanRows, searchPreview]);

  // ACTION 1: Download Clean 3-Column Excel (.xlsx)
  // (Fulfills: 8-10 कॉलम वाली Excel Sheet से जरूरी डेटा चुनकर केवल 3 कॉलम में ट्रैकिंग आईडी की शीट तैयार करने का ऑप्शन)
  function handleDownload3ColumnExcel() {
    if (validRows.length === 0) {
      alert("No valid tracking records to export. Please check your column mappings.");
      return;
    }

    // Format data for sheet: BIB Number, Courier Partner, Tracking ID
    const excelData = validRows.map((r, i) => ({
      "S.No.": i + 1,
      "BIB Number": r.bibNumber,
      "Courier Partner": r.courier,
      "Tracking ID / AWB": r.trackingNumber,
      "Tracking URL": r.trackingUrl || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 },  // S.No.
      { wch: 18 }, // BIB Number
      { wch: 25 }, // Courier Partner
      { wch: 22 }, // Tracking ID
      { wch: 40 }, // Tracking URL
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "3-Col Tracking List");

    const dateStr = new Date().toISOString().split("T")[0];
    const exportName = `Tracking_3Column_${fileName.replace(/\.[^/.]+$/, "") || "Export"}_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, exportName);
  }

  // Sample 3-Column Template Download
  function handleDownloadSampleTemplate() {
    const templateData = [
      { "BIB Number": "SDC-1001", "Courier Partner": "India Post Speed Post", "Tracking ID": "EU123456789IN" },
      { "BIB Number": "SDC-1002", "Courier Partner": "Delhivery", "Tracking ID": "14238918239" },
      { "BIB Number": "SDC-1003", "Courier Partner": "DTDC Express", "Tracking ID": "7D136259434" },
      { "BIB Number": "SDC-1004", "Courier Partner": "BlueDart", "Tracking ID": "8892182910" },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [{ wch: 18 }, { wch: 25 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample Template");
    XLSX.writeFile(wb, "MountainRun_Tracking_3Column_Template.xlsx");
  }

  // ACTION 2: Direct 1-Click Update to Database (Bulk Tracking)
  async function handleApplyToDatabase() {
    if (validRows.length === 0) {
      alert("No valid tracking records to upload.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setResultSummary(null);

    try {
      const token = await getToken();
      const items = validRows.map((r) => ({
        bibNumber: r.bibNumber,
        courier: r.courier,
        trackingNumber: r.trackingNumber,
        trackingUrl: r.trackingUrl || null,
      }));

      // 1. Bulk update tracking in database
      const res = await adminFetch<{ data: { updated: number; errors: any[] } }>(
        "/api/admin/medals/bulk-tracking",
        token,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        }
      );

      setResultSummary(res.data);

      // 2. If dispatch email requested, trigger email notification
      if (sendDispatchEmails && res.data.updated > 0) {
        try {
          await adminFetch("/api/admin/medals/dispatch-email", token, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          });
        } catch {
          // Non-blocking email alert
        }
      }

      if (res.data.updated > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update tracking numbers in database.");
    } finally {
      setSubmitting(false);
    }
  }

  // Reset modal state
  function handleReset() {
    setFile(null);
    setFileName("");
    setSheetNames([]);
    setSelectedSheet("");
    setAllHeaders([]);
    setRawRows([]);
    setBibColumn("");
    setTrackingColumn("");
    setCourierColumn("");
    setPasteText("");
    setResultSummary(null);
    setErrorMessage(null);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-(--line) bg-(--panel) shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--line) px-6 py-4 bg-(--panel-soft)">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-(--foreground)">
                  Excel Tracking ID Assistant
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  3-Column Converter & Uploader
                </span>
              </div>
              <p className="text-xs text-(--muted)">
                8-10 कॉलम वाली किसी भी शीट से जरूरी 3 कॉलम (BIB, Courier, Tracking) चुनकर अपडेट या एक्सपोर्ट करें।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-(--muted) hover:bg-(--line) hover:text-(--foreground) transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top helper banner & Sample Template Download */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 text-xs text-sky-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-sky-400" />
              <span>
                <strong>Easy Rule:</strong> आप India Post, Delhivery या किसी भी कूरियर की 8-10 कॉलम वाली फाइल सीधे ड्रैग-ड्रॉप करें।
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleTemplate}
              className="inline-flex items-center gap-1.5 font-bold text-sky-300 hover:text-white underline underline-offset-4 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download 3-Column Sample Template (.xlsx)
            </button>
          </div>

          {/* STEP 1: Upload or Paste File */}
          {allHeaders.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-(--line) pb-2">
                <button
                  type="button"
                  onClick={() => setInputMode("file")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    inputMode === "file"
                      ? "bg-(--foreground) text-(--background)"
                      : "text-(--muted) hover:text-(--foreground)"
                  }`}
                >
                  Upload Excel / CSV File (.xlsx, .csv)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    inputMode === "paste"
                      ? "bg-(--foreground) text-(--background)"
                      : "text-(--muted) hover:text-(--foreground)"
                  }`}
                >
                  Paste Data from Excel / Clipboard
                </button>
              </div>

              {inputMode === "file" ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--line) hover:border-emerald-500 bg-(--panel-soft)/50 hover:bg-(--panel-soft) p-10 text-center cursor-pointer transition group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelected(f);
                    }}
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                    <Upload className="h-7 w-7" />
                  </div>
                  <h3 className="text-sm font-bold text-(--foreground)">
                    Click to browse or Drag & Drop your Excel file
                  </h3>
                  <p className="mt-1 text-xs text-(--muted)">
                    Supports <strong>.xlsx, .xls, .csv</strong> files with any number of columns
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste rows directly from Excel (including headers)...&#10;BIB Number	Courier	Tracking Number&#10;SDC-1001	Delhivery	123456789"
                    className="w-full rounded-2xl border border-(--line) bg-(--panel-soft) p-3 font-mono text-xs text-(--foreground) focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handlePasteParse}
                    disabled={!pasteText.trim()}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                  >
                    Parse Pasted Data &rarr;
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: Intelligent 3-Column Mapping & Options */
            <div className="space-y-6">
              {/* File Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--line) bg-(--panel-soft) p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-(--foreground)">{fileName}</p>
                    <p className="text-[11px] text-(--muted)">
                      {rawRows.length} rows loaded · {allHeaders.length} total columns detected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sheetNames.length > 1 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-(--muted)">Sheet:</span>
                      <select
                        value={selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="rounded-lg border border-(--line) bg-(--panel) px-2.5 py-1 text-xs font-bold text-(--foreground)"
                      >
                        {sheetNames.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-(--line) px-3 py-1.5 text-xs font-bold text-(--muted) hover:text-(--foreground) hover:bg-(--line) transition"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* 3 Column Selector Cards */}
              <div className="rounded-2xl border border-(--line) bg-(--panel-soft)/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-(--foreground) flex items-center gap-2">
                    <Filter className="h-4 w-4 text-emerald-400" />
                    Select 3 Required Columns (जरूरी 3 कॉलम चुनें)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    ✓ System auto-matched the best columns
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1: BIB / Identifier */}
                  <div className="rounded-xl border border-(--line) bg-(--panel) p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-(--foreground)">
                        1. Runner Identifier (BIB) *
                      </label>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Primary Key
                      </span>
                    </div>
                    <select
                      value={bibColumn}
                      onChange={(e) => setBibColumn(e.target.value)}
                      className="w-full rounded-xl border border-(--line) bg-(--panel-soft) px-3 py-2 text-xs font-semibold text-(--foreground) focus:border-emerald-500 outline-none"
                    >
                      {allHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h} {rawRows[0]?.[h] ? `(e.g. ${rawRows[0][h]})` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-(--muted)">
                      Matches runner BIB number, Order ID, or Phone.
                    </p>
                  </div>

                  {/* Column 2: Tracking Number */}
                  <div className="rounded-xl border border-(--line) bg-(--panel) p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-(--foreground)">
                        2. Tracking ID / AWB No. *
                      </label>
                      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">
                        Consignment No.
                      </span>
                    </div>
                    <select
                      value={trackingColumn}
                      onChange={(e) => setTrackingColumn(e.target.value)}
                      className="w-full rounded-xl border border-(--line) bg-(--panel-soft) px-3 py-2 text-xs font-semibold text-(--foreground) focus:border-sky-500 outline-none"
                    >
                      {allHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h} {rawRows[0]?.[h] ? `(e.g. ${rawRows[0][h]})` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-(--muted)">
                      Speed Post article no, Delhivery waybill, or DTDC AWB.
                    </p>
                  </div>

                  {/* Column 3: Courier Partner */}
                  <div className="rounded-xl border border-(--line) bg-(--panel) p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-(--foreground)">
                        3. Courier Partner *
                      </label>
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                        Logistics
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-(--muted) pb-1">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="courierMode"
                          checked={courierMode === "column"}
                          onChange={() => setCourierMode("column")}
                          className="accent-emerald-500"
                        />
                        <span>From Sheet Column</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="courierMode"
                          checked={courierMode === "fixed"}
                          onChange={() => setCourierMode("fixed")}
                          className="accent-emerald-500"
                        />
                        <span>Use Fixed Courier</span>
                      </label>
                    </div>

                    {courierMode === "column" ? (
                      <select
                        value={courierColumn}
                        onChange={(e) => setCourierColumn(e.target.value)}
                        className="w-full rounded-xl border border-(--line) bg-(--panel-soft) px-3 py-2 text-xs font-semibold text-(--foreground) focus:border-amber-500 outline-none"
                      >
                        <option value="">-- Pick Courier Column --</option>
                        {allHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h} {rawRows[0]?.[h] ? `(e.g. ${rawRows[0][h]})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={fixedCourier}
                        onChange={(e) => setFixedCourier(e.target.value)}
                        className="w-full rounded-xl border border-(--line) bg-(--panel-soft) px-3 py-2 text-xs font-semibold text-(--foreground) focus:border-amber-500 outline-none"
                      >
                        {COMMON_COURIERS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="text-[11px] text-(--muted)">
                      Delhivery, Speed Post, DTDC, Blue Dart, etc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Stats Preview Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--line) pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-(--foreground)">
                    Clean 3-Column Preview:
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                    {validRows.length} Valid Records
                  </span>
                  {skippedRows.length > 0 && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                      {skippedRows.length} Empty/Skipped
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-(--muted)" />
                  <input
                    type="text"
                    value={searchPreview}
                    onChange={(e) => setSearchPreview(e.target.value)}
                    placeholder="Filter preview..."
                    className="w-48 rounded-lg border border-(--line) bg-(--panel) pl-8 pr-3 py-1 text-xs text-(--foreground) outline-none"
                  />
                </div>
              </div>

              {/* 3-Column Preview Table */}
              <div className="max-h-56 overflow-y-auto rounded-2xl border border-(--line) bg-(--panel)">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-(--panel-soft) text-[11px] font-bold uppercase tracking-wider text-(--muted) border-b border-(--line)">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">1. BIB Number</th>
                      <th className="py-2.5 px-3">2. Courier Partner</th>
                      <th className="py-2.5 px-3">3. Tracking ID / AWB</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--line)">
                    {previewList.slice(0, 100).map((row, idx) => {
                      const isValid = Boolean(row.bibNumber && row.trackingNumber);
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-(--panel-soft) ${
                            !isValid ? "opacity-40 bg-amber-500/5" : ""
                          }`}
                        >
                          <td className="py-2 px-3 text-[11px] text-(--muted)">
                            {row.originalRowIndex}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-amber-400">
                            {row.bibNumber || "—"}
                          </td>
                          <td className="py-2 px-3 text-(--foreground)">{row.courier}</td>
                          <td className="py-2 px-3 font-mono font-semibold text-sky-400">
                            {row.trackingNumber || "—"}
                          </td>
                          <td className="py-2 px-3">
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Ready
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-semibold">
                                Missing data
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Email Option Checkbox */}
              <div className="rounded-xl border border-(--line) bg-(--panel-soft) p-3 flex items-center justify-between">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-(--foreground) cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendDispatchEmails}
                    onChange={(e) => setSendDispatchEmails(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                  <span>
                    Also dispatch official tracking notification emails to runners now
                  </span>
                </label>
                <span className="text-[11px] text-(--muted)">Optional</span>
              </div>
            </div>
          )}

          {/* Feedback & Result Notification */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resultSummary && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>
                  Successfully updated {resultSummary.updated} tracking numbers in database!
                </span>
              </div>
              {resultSummary.errors.length > 0 && (
                <div className="rounded-xl bg-black/40 p-3 text-xs text-rose-300 space-y-1 max-h-32 overflow-y-auto">
                  <p className="font-bold">
                    {resultSummary.errors.length} rows could not be matched:
                  </p>
                  {resultSummary.errors.map((err, i) => (
                    <p key={i} className="font-mono text-[11px]">
                      • {err.item?.bibNumber || "Unknown"}: {err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--line) px-6 py-4 bg-(--panel-soft)">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-(--muted) hover:text-(--foreground) transition"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {/* ACTION 1: Download Clean 3-Column Sheet */}
            <button
              type="button"
              disabled={validRows.length === 0}
              onClick={handleDownload3ColumnExcel}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 transition disabled:opacity-40 cursor-pointer shadow-sm"
              title="Download clean 3-column tracking sheet (.xlsx)"
            >
              <Download className="h-4 w-4" />
              Download Clean 3-Column Sheet ({validRows.length})
            </button>

            {/* ACTION 2: Direct 1-Click Update Database */}
            <button
              type="button"
              disabled={submitting || validRows.length === 0}
              onClick={handleApplyToDatabase}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-40 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Updating Database...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Apply & Update {validRows.length} to Database
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartTrackingExcelModal;
