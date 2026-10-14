import os
import sys
import openpyxl
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def generate_pdf():
    xlsx_path = os.path.join(os.getcwd(), "RISE_AND_RUN_MEDAL_DISPATCH_LIST.xlsx")
    pdf_path = os.path.join(os.getcwd(), "RISE_AND_RUN_MEDAL_DISPATCH_LIST.pdf")

    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb["Courier Dispatch Ready"]

    # Extract data starting from row 3 (headers)
    all_rows = list(ws.iter_rows(values_only=True))
    headers = all_rows[2]  # Row 3 is header
    data = all_rows[3:]    # Row 4 onwards is data

    # Select key printable columns for A4 Landscape
    # S.No (0), BIB (1), Recipient (2), Mobile (3), Address (8), City (9), State (10), Pincode (11), Category (13), AWB (18)
    selected_indices = [0, 1, 2, 3, 8, 9, 10, 11, 13, 18]
    selected_headers = ["S#", "BIB No", "Recipient Name", "Mobile No", "Full Shipping Address", "City", "State", "PIN", "Category", "AWB Tracking"]

    # Usable page width: 29.7cm - 1cm = 28.7cm
    col_widths = [0.8*cm, 2.2*cm, 3.2*cm, 2.2*cm, 8.5*cm, 2.4*cm, 2.6*cm, 1.6*cm, 2.2*cm, 3.0*cm]

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(A4),
        rightMargin=0.5*cm,
        leftMargin=0.5*cm,
        topMargin=0.8*cm,
        bottomMargin=0.8*cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "PDFTitle",
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=colors.HexColor("#0F3D24"),
        alignment=TA_CENTER,
        leading=14,
    )
    subtitle_style = ParagraphStyle(
        "PDFSubtitle",
        fontName="Helvetica",
        fontSize=8,
        textColor=colors.HexColor("#4B5563"),
        alignment=TA_CENTER,
        leading=10,
    )
    header_style = ParagraphStyle(
        "HeaderCell",
        fontName="Helvetica-Bold",
        fontSize=6.5,
        textColor=colors.white,
        alignment=TA_CENTER,
        leading=8,
    )
    cell_style = ParagraphStyle(
        "DataCell",
        fontName="Helvetica",
        fontSize=6,
        textColor=colors.black,
        alignment=TA_LEFT,
        leading=7.5,
    )
    cell_center_style = ParagraphStyle(
        "DataCellCenter",
        fontName="Helvetica",
        fontSize=6,
        textColor=colors.black,
        alignment=TA_CENTER,
        leading=7.5,
    )
    bib_style = ParagraphStyle(
        "BIBStyle",
        fontName="Helvetica-Bold",
        fontSize=6,
        textColor=colors.HexColor("#0F3D24"),
        alignment=TA_CENTER,
        leading=7.5,
    )

    elements = []
    elements.append(Paragraph("MOUNTAIN RUN — RISE AND RUN VIRTUAL CHALLENGE 2026", title_style))
    elements.append(Paragraph(f"Official Medal Dispatch & Delivery Sheet  •  Total Approved Finishers: {len(data)}", subtitle_style))
    elements.append(Spacer(1, 0.25*cm))

    table_data = []
    # Header row
    h_row = [Paragraph(f"<b>{h}</b>", header_style) for h in selected_headers]
    table_data.append(h_row)

    # Data rows
    for r in data:
        row_cells = []
        for idx_pos, col_idx in enumerate(selected_indices):
            val = str(r[col_idx] or "").strip()
            if idx_pos == 1: # BIB
                row_cells.append(Paragraph(val, bib_style))
            elif idx_pos in [0, 3, 7, 8]: # S.No, Mobile, PIN, Category
                row_cells.append(Paragraph(val, cell_center_style))
            else:
                row_cells.append(Paragraph(val, cell_style))
        table_data.append(row_cells)

    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1B633D')),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 3),
        ('TOPPADDING', (0, 0), (-1, 0), 3),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#D1E2D8')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#F6FAF7'), colors.white]),
        ('TOPPADDING', (0, 1), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
    ]))

    elements.append(t)
    doc.build(elements)
    print(f"✅ Generated PDF at: {pdf_path}")

if __name__ == "__main__":
    generate_pdf()
