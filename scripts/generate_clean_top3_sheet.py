import os
import sys
import re
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.path.insert(0, os.path.abspath("scripts"))
from rise_and_run_tshirt_dispatch import get_rise_and_run_top3_winners

winners = get_rise_and_run_top3_winners()

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Top 3 T-Shirt Status"

# Styling definitions
font_title = Font(name="Calibri", size=15, bold=True, color="FFFFFF")
fill_title = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")

font_summary = Font(name="Calibri", size=11, bold=True, color="334155")
fill_summary = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")

font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
fill_header = PatternFill(start_color="0F766E", end_color="0F766E", fill_type="solid")

font_data = Font(name="Calibri", size=10)
font_bold = Font(name="Calibri", size=10, bold=True)

# Status styling
fill_confirmed = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid") # light green
font_confirmed = Font(name="Calibri", size=10, bold=True, color="166534")

fill_pending = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # light yellow
font_pending = Font(name="Calibri", size=10, bold=True, color="92400E")

thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

align_center = Alignment(horizontal="center", vertical="center")
align_left = Alignment(horizontal="left", vertical="center")

# Title Header
ws.merge_cells("A1:G1")
ws["A1"] = "Rise and Run 2026 - Top 3 Winners T-Shirt Status"
ws["A1"].font = font_title
ws["A1"].fill = fill_title
ws["A1"].alignment = align_center
ws.row_dimensions[1].height = 34

# Count metrics
confirmed_count = sum(1 for w in winners if w.get('tshirt_size'))
pending_count = len(winners) - confirmed_count

ws.merge_cells("A2:G2")
ws["A2"] = f"Total Winners: 15  |  Size Received (Confirmed): {confirmed_count}  |  Pending Size: {pending_count}"
ws["A2"].font = font_summary
ws["A2"].fill = fill_summary
ws["A2"].alignment = align_center
ws.row_dimensions[2].height = 24

# Blank separator row
ws.row_dimensions[3].height = 10

# Headers (Clean and essential only)
headers = [
    "S.No",
    "BIB Number",
    "Runner Name",
    "Contact Number",
    "Email",
    "Address",
    "T-Shirt Size"
]

ws.row_dimensions[4].height = 26
for col_idx, h in enumerate(headers, 1):
    cell = ws.cell(row=4, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = thin_border

# Data rows
for idx, w in enumerate(winners, 1):
    row_num = idx + 4
    ws.row_dimensions[row_num].height = 24

    # Clean address
    raw_addr = w.get('shipping_address', '')
    cleaned_addr = re.sub(r',\s*,+', ', ', raw_addr).strip(' ,')

    size_val = w.get('tshirt_size')
    is_confirmed = bool(size_val)
    display_size = size_val if is_confirmed else "PENDING"

    row_data = [
        idx,
        w['bib'],
        w['name'],
        w['phone'],
        w['email'],
        cleaned_addr,
        display_size
    ]

    for col_idx, val in enumerate(row_data, 1):
        cell = ws.cell(row=row_num, column=col_idx, value=val)
        cell.font = font_data
        cell.border = thin_border

        if col_idx in [1, 2, 4]:
            cell.alignment = align_center
        elif col_idx == 7:
            cell.alignment = align_center
            if is_confirmed:
                cell.fill = fill_confirmed
                cell.font = font_confirmed
            else:
                cell.fill = fill_pending
                cell.font = font_pending
        else:
            cell.alignment = align_left

# Column widths
for col in ws.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.row >= 4 and cell.value:
            max_len = max(max_len, len(str(cell.value)))
    ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

# Specific optimal column widths
ws.column_dimensions['A'].width = 8   # S.No
ws.column_dimensions['B'].width = 16  # BIB
ws.column_dimensions['C'].width = 28  # Name
ws.column_dimensions['D'].width = 18  # Contact Number
ws.column_dimensions['E'].width = 32  # Email
ws.column_dimensions['F'].width = 50  # Address
ws.column_dimensions['G'].width = 16  # T-Shirt Size

out_file = "TOP_3_WINNERS_TSHIRT_SIZES.xlsx"
wb.save(out_file)
print(f"[✓] Created clean Excel workbook: {out_file}")
