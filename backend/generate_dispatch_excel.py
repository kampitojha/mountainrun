import json
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_courier_dispatch_sheet():
    with open('backend/proof_data.json', 'r', encoding='utf-8') as f:
        records = json.load(f)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Unity Day Dispatch List"
    ws.views.sheetView[0].showGridLines = True

    # ── Palettes & Styles ──
    NAVY_HEADER = "0B2545"
    GOLD_ACCENT = "C9A227"
    ICE_BLUE_ROW = "F4F7FB"
    WHITE_ROW = "FFFFFF"
    BORDER_COLOR = "CBD5E1"

    thin_border = Border(
        left=Side(style='thin', color=BORDER_COLOR),
        right=Side(style='thin', color=BORDER_COLOR),
        top=Side(style='thin', color=BORDER_COLOR),
        bottom=Side(style='thin', color=BORDER_COLOR)
    )

    header_font = Font(name='Segoe UI', size=11, bold=True, color='FFFFFF')
    header_fill = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type='solid')

    title_font = Font(name='Segoe UI', size=14, bold=True, color='0B2545')
    subtitle_font = Font(name='Segoe UI', size=10, italic=False, color='475569')

    regular_font = Font(name='Segoe UI', size=10, color='1E293B')
    bold_font = Font(name='Segoe UI', size=10, bold=True, color='0F172A')

    # ── Row 1: Title Banner ──
    ws.merge_cells('A1:J1')
    title_cell = ws['A1']
    title_cell.value = "MOUNTAIN RUN — NATIONAL UNITY DAY 2026 (COURIER DISPATCH MANIFEST)"
    title_cell.font = title_font
    title_cell.alignment = Alignment(horizontal='center', vertical='center')
    ws.row_dimensions[1].height = 28

    # ── Row 2: Subtitle Banner ──
    ws.merge_cells('A2:J2')
    sub_cell = ws['A2']
    sub_cell.value = f"Total Verified Proof Shipments: {len(records)}  |  Contents: Antique Bronze 3D Medal & Finisher Certificate  |  Payment: 100% PREPAID (COD: INR 0)"
    sub_cell.font = subtitle_font
    sub_cell.alignment = Alignment(horizontal='center', vertical='center')
    ws.row_dimensions[2].height = 20

    # ── Row 3: Blank separator ──
    ws.row_dimensions[3].height = 8

    # ── Row 4: Column Headers ──
    headers = [
        "S.No.",
        "Bib Number",
        "Consignee / Runner Name",
        "Mobile Number",
        "Full Delivery Address",
        "City",
        "State",
        "Pincode",
        "Category / Item",
        "Courier Tracking ID / AWB"
    ]

    ws.row_dimensions[4].height = 28
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col_idx)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(
            horizontal='center' if col_idx in [1, 2, 4, 8, 10] else 'left',
            vertical='center',
            wrap_text=True
        )
        cell.border = thin_border

    # ── Data Rows (starting from Row 5) ──
    for row_idx, r in enumerate(records, 5):
        ws.row_dimensions[row_idx].height = 24
        is_even = (row_idx % 2 == 0)
        row_fill = PatternFill(
            start_color=ICE_BLUE_ROW if is_even else WHITE_ROW,
            end_color=ICE_BLUE_ROW if is_even else WHITE_ROW,
            fill_type='solid'
        )

        row_data = [
            r['sNo'],
            r['bibNumber'],
            r['name'],
            r['phone'],
            r['fullAddress'],
            r['city'],
            r['state'],
            r['pincode'],
            r['category'],
            r['trackingId']
        ]

        for col_idx, val in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.value = val
            cell.fill = row_fill
            cell.border = thin_border

            # Number formatting to avoid scientific notation & leading zero truncations
            if col_idx == 1:  # S.No.
                cell.font = bold_font
                cell.alignment = Alignment(horizontal='center', vertical='center')
            elif col_idx == 2:  # Bib Number
                cell.font = bold_font
                cell.alignment = Alignment(horizontal='center', vertical='center')
                cell.number_format = '@'
            elif col_idx == 3:  # Runner Name
                cell.font = bold_font
                cell.alignment = Alignment(horizontal='left', vertical='center')
            elif col_idx == 4:  # Phone
                cell.font = regular_font
                cell.alignment = Alignment(horizontal='center', vertical='center')
                cell.number_format = '@'
            elif col_idx == 5:  # Address
                cell.font = regular_font
                cell.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
            elif col_idx in [6, 7]:  # City, State
                cell.font = regular_font
                cell.alignment = Alignment(horizontal='left', vertical='center')
            elif col_idx == 8:  # Pincode
                cell.font = bold_font
                cell.alignment = Alignment(horizontal='center', vertical='center')
                cell.number_format = '@'
            elif col_idx == 9:  # Category
                cell.font = regular_font
                cell.alignment = Alignment(horizontal='left', vertical='center')
            elif col_idx == 10:  # Tracking ID
                cell.font = bold_font
                cell.alignment = Alignment(horizontal='center', vertical='center')
                cell.number_format = '@'

    # ── Auto-adjust column widths ──
    column_widths = {
        1: 8,    # S.No.
        2: 16,   # Bib Number
        3: 28,   # Runner Name
        4: 16,   # Phone
        5: 46,   # Address
        6: 20,   # City
        7: 20,   # State
        8: 12,   # Pincode
        9: 36,   # Category / Item
        10: 28   # Tracking ID
    }

    for col_idx, width in column_widths.items():
        col_letter = get_column_letter(col_idx)
        ws.column_dimensions[col_letter].width = width

    # Freeze panes below header (row 4)
    ws.freeze_panes = 'A5'

    # Save to both Desktop and current project directory
    desktop_path = r"c:\Users\91991\OneDrive\Desktop\UNITY_DAY_COURIER_DISPATCH_LIST.xlsx"
    project_path = r"c:\Users\91991\OneDrive\Desktop\mountainrun\UNITY_DAY_COURIER_DISPATCH_LIST.xlsx"

    wb.save(desktop_path)
    wb.save(project_path)
    print(f"Saved cleanly to:\n  {desktop_path}\n  {project_path}")

if __name__ == "__main__":
    create_courier_dispatch_sheet()

