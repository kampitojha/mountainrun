import openpyxl
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def xlsx_to_pdf(xlsx_path: str, pdf_path: str):
    wb = openpyxl.load_workbook(xlsx_path)
    ws = wb.active

    print(f"Sheet: {ws.title}, Rows: {ws.max_row}, Cols: {ws.max_column}")

    # Read all data
    raw_data = []
    for row in ws.iter_rows(values_only=True):
        cleaned = [str(cell).strip() if cell is not None else "" for cell in row]
        raw_data.append(cleaned)

    if not raw_data:
        print("No data found!")
        return

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(A4),
        rightMargin=0.5*cm,
        leftMargin=0.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1*cm,
    )

    styles = getSampleStyleSheet()
    title_style = styles["Title"]
    
    header_style = ParagraphStyle(
        "HeaderCell",
        fontName="Helvetica-Bold",
        fontSize=6,
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
        leading=7,
        wordWrap='LTR',
    )

    elements = []
    elements.append(Paragraph("Sports Day — Approved Proofs Dispatch List", title_style))
    elements.append(Spacer(1, 0.3*cm))

    num_cols = len(raw_data[0]) if raw_data else 1
    page_width = landscape(A4)[0] - 1*cm  # usable width

    # Assign narrower widths to less important cols, wider to name/address
    col_widths = [page_width / num_cols] * num_cols

    # Wrap cells
    table_data = []
    for i, row in enumerate(raw_data):
        row_cells = []
        for cell in row:
            if i == 0:
                row_cells.append(Paragraph(cell, header_style))
            else:
                row_cells.append(Paragraph(cell, cell_style))
        table_data.append(row_cells)

    # Split into chunks of 40 rows per page to avoid overflow
    header_row = table_data[0]
    chunk_size = 40
    chunks = [table_data[1:][i:i+chunk_size] for i in range(0, len(table_data)-1, chunk_size)]

    for chunk_idx, chunk in enumerate(chunks):
        chunk_with_header = [header_row] + chunk

        table = Table(chunk_with_header, colWidths=col_widths, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a7a4a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#eef8f3")]),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
            ("LINEBELOW", (0, 0), (-1, 0), 1.2, colors.HexColor("#0e5c36")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ]))

        elements.append(table)
        if chunk_idx < len(chunks) - 1:
            from reportlab.platypus import PageBreak
            elements.append(PageBreak())

    doc.build(elements)
    print(f"✅ PDF saved: {pdf_path}")

if __name__ == "__main__":
    input_file = r"c:\Users\91991\OneDrive\Desktop\mountainrun\SPORTS_DAY_APPROVED_PROOFS_DISPATCH_LIST.xlsx"
    output_file = r"c:\Users\91991\OneDrive\Desktop\mountainrun\SPORTS_DAY_APPROVED_PROOFS_DISPATCH_LIST.pdf"
    xlsx_to_pdf(input_file, output_file)
