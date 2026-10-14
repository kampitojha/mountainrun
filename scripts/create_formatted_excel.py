import openpyxl
from openpyxl import load_workbook
from openpyxl.styles import (
    Font, Fill, PatternFill, Alignment, Border, Side, GradientFill
)
from openpyxl.utils import get_column_letter
from openpyxl.styles.numbers import FORMAT_DATE_DDMMYY
from copy import copy
import os

SRC = r"c:\Users\91991\OneDrive\Desktop\mountainrun\SPORTS_DAY_APPROVED_PROOFS_DISPATCH_LIST.xlsx"
DST = r"c:\Users\91991\OneDrive\Desktop\mountainrun\SPORTS_DAY_DISPATCH_LIST_v2.xlsx"

# ── Color Palette ────────────────────────────────────────────────
DARK_GREEN    = "1A5C38"   # header bg
MED_GREEN     = "2D7D52"   # sub-header bg
LIGHT_GREEN   = "E8F5EE"   # even rows
WHITE         = "FFFFFF"   # odd rows
ACCENT_YELLOW = "FFF9C4"   # pending highlight
ACCENT_RED    = "FFEBEE"   # none/missing
ACCENT_BLUE   = "E3F2FD"   # section headers
BORDER_COLOR  = "C8E6C9"   # grid lines
HEADER_TEXT   = "FFFFFF"   # header font
BODY_TEXT     = "1A1A1A"   # body font

def make_fill(hex_color):
    return PatternFill(fill_type="solid", fgColor=hex_color)

def make_border(color=BORDER_COLOR, style="thin"):
    side = Side(style=style, color=color)
    return Border(left=side, right=side, top=side, bottom=side)

def make_thick_border(color=DARK_GREEN):
    thick = Side(style="medium", color=color)
    thin  = Side(style="thin",   color=BORDER_COLOR)
    return Border(left=thick, right=thick, top=thin, bottom=thin)

def header_font(size=9, bold=True):
    return Font(name="Calibri", size=size, bold=bold, color=HEADER_TEXT)

def body_font(size=9, bold=False, color=BODY_TEXT, italic=False):
    return Font(name="Calibri", size=size, bold=bold, color=color, italic=italic)

def center_align(wrap=True):
    return Alignment(horizontal="center", vertical="center", wrap_text=wrap)

def left_align(wrap=True):
    return Alignment(horizontal="left", vertical="center", wrap_text=wrap)


# ── Load Source ───────────────────────────────────────────────────
src_wb = load_workbook(SRC)
src_ws = src_wb.active

all_rows = list(src_ws.iter_rows(values_only=True))
headers = all_rows[0]
data    = all_rows[1:]

num_runners = len(data)

# ── New Workbook ──────────────────────────────────────────────────
wb = openpyxl.Workbook()

# ═══════════════════════════════════════════════════════════════════
# SHEET 1 — DISPATCH LIST (Main)
# ═══════════════════════════════════════════════════════════════════
ws1 = wb.active
ws1.title = "Dispatch List"

# ── Freeze top rows + first 3 cols
ws1.freeze_panes = "D4"

# ── Banner Row 1 (merged title)
ws1.merge_cells("A1:Y1")
banner = ws1["A1"]
banner.value = "MOUNTAIN RUN — SPORTS DAY CELEBRATION 2026"
banner.font = Font(name="Calibri", size=16, bold=True, color=HEADER_TEXT)
banner.fill = make_fill(DARK_GREEN)
banner.alignment = center_align()
banner.border = make_border(DARK_GREEN, "medium")
ws1.row_dimensions[1].height = 32

# ── Banner Row 2 (sub info)
ws1.merge_cells("A2:Y2")
sub = ws1["A2"]
sub.value = f"Approved Medal Dispatch — {num_runners} Athletes  |  Generated: 03-Sep-2026"
sub.font = Font(name="Calibri", size=10, bold=False, italic=True, color=HEADER_TEXT)
sub.fill = make_fill(MED_GREEN)
sub.alignment = center_align()
sub.border = make_border(MED_GREEN)
ws1.row_dimensions[2].height = 20

# ── Column Definitions (label, width)
COLS = [
    ("S.No",                  5),
    ("BIB Number",            12),
    ("Runner Name",           18),
    ("Shipping Recipient",    18),
    ("Mobile",                13),
    ("Email",                 25),
    ("Distance",               9),
    ("Activity",               9),
    ("Finish Time",           10),
    ("Address Line 1",        25),
    ("Address Line 2",        20),
    ("City",                  13),
    ("State",                 13),
    ("Pincode",                8),
    ("Proof Status",          12),
    ("Proof Date",            16),
    ("Medal Status",          12),
    ("AWB / Tracking",        15),
    ("Courier",               12),
    ("Certificate No",        18),
    ("Reg Date",              12),
    ("Amount (Rs)",           11),
    ("Payment ID",            20),
]

# Set column widths
for i, (_, w) in enumerate(COLS, start=1):
    ws1.column_dimensions[get_column_letter(i)].width = w

# ── Header Row 3
HEADER_LABELS = [c[0] for c in COLS]

# Map from original 25-col xlsx → our 23 cols (drop Full Address col 10 and Screenshot URL col 18)
# Original col indices (0-based):
# 0=S.No,1=BIB,2=Runner,3=Recipient,4=Mobile,5=Email,6=Category,7=Activity,
# 8=FinishTime,9=FullAddr,10=Addr1,11=Addr2,12=City,13=State,14=Pincode,
# 15=ProofStatus,16=ProofDate,17=ScreenshotURL,18=MedalStatus,19=AWB,
# 20=Courier,21=CertNo,22=RegDate,23=Amount,24=PaymentID
SRC_COLS = [0,1,2,3,4,5,6,7,8,10,11,12,13,14,15,16,18,19,20,21,22,23,24]

for col_idx, label in enumerate(HEADER_LABELS, start=1):
    cell = ws1.cell(row=3, column=col_idx, value=label)
    cell.font    = header_font(9)
    cell.fill    = make_fill("2E7D52")
    cell.alignment = center_align()
    cell.border  = make_border("0D4A2A", "thin")

ws1.row_dimensions[3].height = 22

# ── Data Rows
for row_i, src_row in enumerate(data, start=1):
    excel_row = row_i + 3   # data starts at row 4
    is_even   = (row_i % 2 == 0)
    row_fill  = make_fill(LIGHT_GREEN if is_even else WHITE)

    mapped = [src_row[c] if c < len(src_row) else "" for c in SRC_COLS]

    for col_idx, value in enumerate(mapped, start=1):
        cell = ws1.cell(row=excel_row, column=col_idx)

        # Format value
        if value is None:
            display = "—"
        else:
            display = str(value).strip() if str(value).strip() else "—"

        cell.value     = display
        cell.border    = make_border()
        cell.alignment = center_align(wrap=True) if col_idx in [1,2,7,8,9,14,15,16,17] else left_align(wrap=True)

        # Status color coding
        label_col_idx = col_idx  # 1-based
        if label_col_idx == 15:   # Proof Status
            if display == "APPROVED":
                cell.fill = make_fill("C8E6C9")
                cell.font = body_font(bold=True, color="1B5E20")
            else:
                cell.fill = row_fill
                cell.font = body_font()
        elif label_col_idx == 17:  # Medal Status
            if display == "PENDING":
                cell.fill = make_fill("FFF9C4")
                cell.font = body_font(bold=True, color="F57F17")
            elif display == "DISPATCHED":
                cell.fill = make_fill("C8E6C9")
                cell.font = body_font(bold=True, color="1B5E20")
            elif display == "—":
                cell.fill = make_fill("FFEBEE")
                cell.font = body_font(color="C62828", italic=True)
            else:
                cell.fill = row_fill
                cell.font = body_font()
        else:
            cell.fill = row_fill
            cell.font = body_font(color="555555" if display == "—" else BODY_TEXT,
                                   italic=(display == "—"))

    ws1.row_dimensions[excel_row].height = 20

# ── Auto Filter on header row
ws1.auto_filter.ref = f"A3:{get_column_letter(len(COLS))}{3 + num_runners}"

# ── Print settings
ws1.print_title_rows = "1:3"
ws1.page_setup.orientation = ws1.ORIENTATION_LANDSCAPE
ws1.page_setup.paperSize   = ws1.PAPERSIZE_A4
ws1.page_setup.fitToPage   = True
ws1.page_setup.fitToWidth  = 1
ws1.page_setup.fitToHeight = 0
ws1.sheet_view.showGridLines = True


# ═══════════════════════════════════════════════════════════════════
# SHEET 2 — SUMMARY DASHBOARD
# ═══════════════════════════════════════════════════════════════════
ws2 = wb.create_sheet("Summary Dashboard")
ws2.column_dimensions["A"].width = 28
ws2.column_dimensions["B"].width = 18
ws2.column_dimensions["C"].width = 18
ws2.column_dimensions["D"].width = 18

# Banner
ws2.merge_cells("A1:D1")
ws2["A1"].value = "SPORTS DAY — SUMMARY DASHBOARD"
ws2["A1"].font  = Font(name="Calibri", size=14, bold=True, color=HEADER_TEXT)
ws2["A1"].fill  = make_fill(DARK_GREEN)
ws2["A1"].alignment = center_align()
ws2.row_dimensions[1].height = 28

def dash_section(ws, row, title):
    ws.merge_cells(f"A{row}:D{row}")
    c = ws.cell(row=row, column=1, value=title)
    c.font = Font(name="Calibri", size=10, bold=True, color=HEADER_TEXT)
    c.fill = make_fill(MED_GREEN)
    c.alignment = center_align()
    c.border = make_border(MED_GREEN)
    ws.row_dimensions[row].height = 18

def dash_row(ws, row, label, value, bg=WHITE):
    lc = ws.cell(row=row, column=1, value=label)
    vc = ws.cell(row=row, column=2, value=value)
    lc.font = body_font(bold=True)
    vc.font = body_font(color="1B5E20", bold=True)
    lc.fill = vc.fill = make_fill(bg)
    lc.alignment = left_align(False)
    vc.alignment = center_align(False)
    lc.border = vc.border = make_border()
    ws.row_dimensions[row].height = 18
    # merge unused cols
    for c in [3,4]:
        xc = ws.cell(row=row, column=c)
        xc.fill  = make_fill(bg)
        xc.border = make_border()

# Compute stats
distances  = [str(r[6]).strip() if r[6] else "" for r in data]
activities = [str(r[7]).strip().lower() if r[7] else "" for r in data]
medals     = [str(r[18]).strip().upper() if r[18] else "NONE" for r in data]
amounts    = []
for r in data:
    try: amounts.append(float(r[23]))
    except: pass

dist_counts = {}
for d in distances:
    dist_counts[d] = dist_counts.get(d, 0) + 1

act_counts = {}
for a in activities:
    act_counts[a] = act_counts.get(a, 0) + 1

medal_pending    = sum(1 for m in medals if m == "PENDING")
medal_dispatched = sum(1 for m in medals if m == "DISPATCHED")
medal_none       = sum(1 for m in medals if m not in ["PENDING","DISPATCHED"])
total_rev        = sum(amounts)

r = 2
dash_section(ws2, r, "REGISTRATION OVERVIEW"); r+=1
dash_row(ws2, r, "Total Athletes", num_runners, LIGHT_GREEN); r+=1
dash_row(ws2, r, "Total Revenue Collected", f"Rs. {int(total_rev):,}"); r+=1

r+=1
dash_section(ws2, r, "BY DISTANCE"); r+=1
for dist, cnt in sorted(dist_counts.items()):
    dash_row(ws2, r, dist, cnt, LIGHT_GREEN if r%2==0 else WHITE); r+=1

r+=1
dash_section(ws2, r, "BY ACTIVITY TYPE"); r+=1
for act, cnt in sorted(act_counts.items()):
    dash_row(ws2, r, act.capitalize(), cnt, LIGHT_GREEN if r%2==0 else WHITE); r+=1

r+=1
dash_section(ws2, r, "MEDAL DISPATCH STATUS"); r+=1
dash_row(ws2, r, "Pending Dispatch",   medal_pending,    "FFF9C4"); r+=1
dash_row(ws2, r, "Dispatched",         medal_dispatched, "C8E6C9"); r+=1
dash_row(ws2, r, "Not Assigned",       medal_none,       "FFEBEE"); r+=1


# ═══════════════════════════════════════════════════════════════════
# SHEET 3 — COURIER READY (simplified dispatch sheet)
# ═══════════════════════════════════════════════════════════════════
ws3 = wb.create_sheet("Courier Ready")
ws3.freeze_panes = "A3"

ws3.merge_cells("A1:J1")
ws3["A1"].value = "COURIER DISPATCH SHEET — SPORTS DAY 2026"
ws3["A1"].font  = Font(name="Calibri", size=13, bold=True, color=HEADER_TEXT)
ws3["A1"].fill  = make_fill(DARK_GREEN)
ws3["A1"].alignment = center_align()
ws3.row_dimensions[1].height = 26

COURIER_COLS = [
    ("S.No",        5),
    ("BIB No",     12),
    ("Runner Name",18),
    ("Mobile",     13),
    ("Address",    35),
    ("City",       12),
    ("State",      13),
    ("Pincode",     9),
    ("Medal Status",13),
    ("AWB / Tracking",16),
]
for i, (label, w) in enumerate(COURIER_COLS, start=1):
    ws3.column_dimensions[get_column_letter(i)].width = w
    cell = ws3.cell(row=2, column=i, value=label)
    cell.font      = header_font(9)
    cell.fill      = make_fill(MED_GREEN)
    cell.alignment = center_align()
    cell.border    = make_border("0D4A2A")
ws3.row_dimensions[2].height = 20

for row_i, src_row in enumerate(data, start=1):
    er = row_i + 2
    is_even = row_i % 2 == 0
    bg = LIGHT_GREEN if is_even else WHITE

    full_addr = f"{src_row[10] or ''}, {src_row[11] or ''}".strip(", ")
    medal_val = str(src_row[18] or "PENDING").upper()

    vals = [
        row_i,
        src_row[1],
        src_row[2],
        src_row[4],
        full_addr,
        src_row[12],
        src_row[13],
        src_row[14],
        medal_val,
        src_row[19] if src_row[19] else "—",
    ]
    for ci, v in enumerate(vals, start=1):
        cell = ws3.cell(row=er, column=ci, value=v if v else "—")
        cell.fill      = make_fill("FFF9C4") if (medal_val == "PENDING" and ci == 9) else make_fill(bg)
        cell.font      = body_font(bold=(ci==9 and medal_val=="PENDING"), color=("F57F17" if medal_val=="PENDING" and ci==9 else BODY_TEXT))
        cell.alignment = center_align() if ci in [1,2,4,7,8,9] else left_align()
        cell.border    = make_border()
    ws3.row_dimensions[er].height = 18

ws3.auto_filter.ref = f"A2:{get_column_letter(len(COURIER_COLS))}{2+num_runners}"
ws3.print_title_rows = "1:2"
ws3.page_setup.orientation = ws3.ORIENTATION_LANDSCAPE

# ── Save
wb.save(DST)
print(f"Done! Saved to: {DST}")
print(f"  Sheet 1: Dispatch List ({num_runners} rows, 23 cols)")
print(f"  Sheet 2: Summary Dashboard")
print(f"  Sheet 3: Courier Ready")
