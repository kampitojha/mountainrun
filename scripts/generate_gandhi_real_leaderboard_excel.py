#!/usr/bin/env python3
"""
Generate comprehensive Gandhi Jayanti Leaderboard Excel Workbook:
1. Sheet 1: "Top 3 Podium (Real vs Dummy)" - Official Top 3 with real vs dummy flags & T-shirt status.
2. Sheet 2: "Real Top 3 Athletes (Clean)" - Top 3 genuine verified athletes per distance.
3. Sheet 3: "1st Rank T-Shirt Winners" - 5 Champions for T-shirt dispatch.
4. Sheet 4: "All Real Finishers (143)" - Full real leaderboard.
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.path.insert(0, os.path.abspath('scripts'))
from tshirt_list_manager import get_backend_env

env = get_backend_env()
db_url = env.get("DATABASE_URL")
if not db_url:
    raise RuntimeError("DATABASE_URL not found!")

conn = psycopg2.connect(db_url)
cur = conn.cursor(cursor_factory=RealDictCursor)

# 1. Fetch Gandhi Event
cur.execute('SELECT id, title, slug, distances FROM "Event" WHERE slug ILIKE %s', ('%gandhi%',))
event = cur.fetchone()
if not event:
    raise RuntimeError("Gandhi event not found")

# 2. Fetch all approved registrations with user details
cur.execute('''
    SELECT 
        r.id as registration_id,
        r."bibNumber" as bib_number,
        r."userId" as user_id,
        u.name as user_name,
        u.email as email,
        COALESCE(r."shippingPhone", u.phone) as phone,
        r.distance as distance,
        r."finishTimeSeconds" as finish_time_seconds,
        r."shippingName" as shipping_name,
        r."shippingLine1" as address_line1,
        COALESCE(r."shippingLine2", '') as address_line2,
        r."shippingCity" as city,
        r."shippingState" as state,
        r."shippingPincode" as pincode,
        r."adminNote" as admin_note,
        r."tshirtSize" as tshirt_size,
        r."proofStatus" as proof_status,
        r.status as status
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    WHERE r."eventId" = %s AND r."proofStatus" = 'APPROVED'
    ORDER BY r."finishTimeSeconds" ASC NULLS LAST
''', (event['id'],))

all_approved = cur.fetchall()
conn.close()

def format_time(sec):
    if not sec:
        return "N/A"
    try:
        sec = int(sec)
        h = sec // 3600
        m = (sec % 3600) // 60
        s = sec % 60
        if h > 0:
            return f"{h:02d}:{m:02d}:{s:02d}"
        return f"{m:02d}:{s:02d}"
    except Exception:
        return str(sec)

# Styling Constants
DARK_GREEN = "0F3E2E"
WHITE = "FFFFFF"
GRAY_TEXT = "4B5563"

font_title = Font(name="Calibri", size=16, bold=True, color=DARK_GREEN)
font_sub = Font(name="Calibri", size=11, italic=True, color=GRAY_TEXT)
font_header = Font(name="Calibri", size=11, bold=True, color=WHITE)
fill_header = PatternFill(start_color=DARK_GREEN, end_color=DARK_GREEN, fill_type="solid")

font_gold = Font(name="Calibri", size=11, bold=True, color="92400E")
fill_gold = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")

font_silver = Font(name="Calibri", size=11, bold=True, color="374151")
fill_silver = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")

font_bronze = Font(name="Calibri", size=11, bold=True, color="7C2D12")
fill_bronze = PatternFill(start_color="FFEDD5", end_color="FFEDD5", fill_type="solid")

font_real = Font(name="Calibri", size=11, bold=True, color="166534")
fill_real = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")

font_dummy = Font(name="Calibri", size=10, italic=True, color="6B7280")
fill_dummy = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")

font_data = Font(name="Calibri", size=11)
align_center = Alignment(horizontal="center", vertical="center")
align_left = Alignment(horizontal="left", vertical="center")

thin_border = Border(
    left=Side(style='thin', color='D1D5DB'),
    right=Side(style='thin', color='D1D5DB'),
    top=Side(style='thin', color='D1D5DB'),
    bottom=Side(style='thin', color='D1D5DB')
)

distances_ordered = ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"]

wb = openpyxl.Workbook()
# Remove default sheet
wb.remove(wb.active)

# ==============================================================================
# SHEET 1: Top 3 Podium (Real Athletes Clean)
# ==============================================================================
ws1 = wb.create_sheet(title="Top 3 Podium (Real Athletes)")

ws1.merge_cells("A1:M1")
ws1["A1"] = "MOUNTAIN RUN — GANDHI JAYANTI VICTORY RUN 2026"
ws1["A1"].font = font_title
ws1["A1"].alignment = align_center

ws1.merge_cells("A2:M2")
ws1["A2"] = "Official Top 3 Leaderboard Podium Breakdown — Real Verified Athletes & T-Shirt Status"
ws1["A2"].font = font_sub
ws1["A2"].alignment = align_center

ws1.row_dimensions[1].height = 28
ws1.row_dimensions[2].height = 20
ws1.row_dimensions[4].height = 26

headers1 = [
    "S.No",
    "Category",
    "Podium Rank",
    "Athlete Classification",
    "T-Shirt Eligibility",
    "BIB Number",
    "Runner Name",
    "Finish Time",
    "Contact Number",
    "Email Address",
    "City & State",
    "Shipping Address",
    "T-Shirt Size"
]

for col_idx, h in enumerate(headers1, 1):
    cell = ws1.cell(row=4, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = thin_border

sno = 1
for dist in distances_ordered:
    cat_rows = [
        r for r in all_approved 
        if r['distance'].lower().replace(' ', '') == dist.lower().replace(' ', '')
        and r['admin_note'] != 'PODIUM_DUMMY_RANK_PLACEHOLDER'
    ]
    cat_rows.sort(key=lambda x: x['finish_time_seconds'] if x['finish_time_seconds'] is not None else 999999)
    
    top3 = cat_rows[:3]
    for rank_idx, r in enumerate(top3, 1):
        row_num = 4 + sno
        ws1.row_dimensions[row_num].height = 22
        
        rank_label = "🥇 1st (Winner)" if rank_idx == 1 else ("🥈 2nd (Silver)" if rank_idx == 2 else "🥉 3rd (Bronze)")
        
        if rank_idx == 1:
            athlete_type = "Real Verified Winner"
            tshirt_status = "✅ DISPATCH T-SHIRT (Winner)"
        else:
            athlete_type = "Real Athlete (Verified)"
            tshirt_status = "❌ NO T-SHIRT (Rank 1 Only)"
            
        full_loc = f"{r['city']}, {r['state']}" if r['city'] and r['state'] else (r['city'] or r['state'] or "India")
        addr_line = f"{r['address_line1']}, {r['address_line2']}".strip().rstrip(',')
        if r['pincode']:
            addr_line = f"{addr_line} - {r['pincode']}"
            
        row_data = [
            sno,
            dist,
            rank_label,
            athlete_type,
            tshirt_status,
            r['bib_number'],
            r['shipping_name'] or r['user_name'],
            format_time(r['finish_time_seconds']),
            r['phone'],
            r['email'],
            full_loc,
            addr_line,
            r['tshirt_size'] or "PENDING"
        ]
        
        for c_idx, val in enumerate(row_data, 1):
            cell = ws1.cell(row=row_num, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            
            if c_idx in [1, 2, 3, 4, 5, 6, 8, 13]:
                cell.alignment = align_center
            else:
                cell.alignment = align_left
                
            # Styling for Rank
            if c_idx == 3:
                if rank_idx == 1:
                    cell.fill = fill_gold
                    cell.font = font_gold
                elif rank_idx == 2:
                    cell.fill = fill_silver
                    cell.font = font_silver
                else:
                    cell.fill = fill_bronze
                    cell.font = font_bronze
                    
            # Styling for Athlete Classification
            if c_idx == 4:
                if "Real" in athlete_type:
                    cell.fill = fill_real
                    cell.font = font_real
                else:
                    cell.fill = fill_dummy
                    cell.font = font_dummy
                    
            # Styling for T-Shirt
            if c_idx == 5:
                if "DISPATCH" in tshirt_status:
                    cell.fill = fill_real
                    cell.font = font_real
                else:
                    cell.fill = fill_dummy
                    cell.font = font_dummy

        sno += 1

for col in ws1.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.row < 4:
            continue
        val = str(cell.value or '')
        max_len = max(max_len, len(val))
    ws1.column_dimensions[col_letter].width = max(max_len + 4, 12)


# ==============================================================================
# SHEET 2: Real Top 3 Athletes (Clean)
# ==============================================================================
ws2 = wb.create_sheet(title="Real Top 3 Athletes (Clean)")

ws2.merge_cells("A1:L1")
ws2["A1"] = "MOUNTAIN RUN — GANDHI JAYANTI VICTORY RUN 2026"
ws2["A1"].font = font_title
ws2["A1"].alignment = align_center

ws2.merge_cells("A2:L2")
ws2["A2"] = "Clean Real Athletes Podium — Genuine Top 3 Finishers per Distance"
ws2["A2"].font = font_sub
ws2["A2"].alignment = align_center

ws2.row_dimensions[1].height = 28
ws2.row_dimensions[2].height = 20
ws2.row_dimensions[4].height = 26

headers2 = [
    "S.No",
    "Category",
    "Real Rank",
    "BIB Number",
    "Runner Name",
    "Finish Time",
    "Contact Number",
    "Email Address",
    "City & State",
    "Shipping Address",
    "Pincode",
    "T-Shirt Size"
]

for col_idx, h in enumerate(headers2, 1):
    cell = ws2.cell(row=4, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = thin_border

sno2 = 1
for dist in distances_ordered:
    # Filter only REAL runners
    real_cat_rows = [
        r for r in all_approved 
        if r['distance'].lower().replace(' ', '') == dist.lower().replace(' ', '')
        and r['admin_note'] != 'PODIUM_DUMMY_RANK_PLACEHOLDER'
    ]
    real_cat_rows.sort(key=lambda x: x['finish_time_seconds'] if x['finish_time_seconds'] is not None else 999999)
    
    top3_real = real_cat_rows[:3]
    for r_idx, r in enumerate(top3_real, 1):
        row_num = 4 + sno2
        ws2.row_dimensions[row_num].height = 22
        
        rank_label = "🥇 Real 1st" if r_idx == 1 else ("🥈 Real 2nd" if r_idx == 2 else "🥉 Real 3rd")
        full_loc = f"{r['city']}, {r['state']}" if r['city'] and r['state'] else (r['city'] or r['state'] or "India")
        addr_line = f"{r['address_line1']}, {r['address_line2']}".strip().rstrip(',')
        
        row_data = [
            sno2,
            dist,
            rank_label,
            r['bib_number'],
            r['shipping_name'] or r['user_name'],
            format_time(r['finish_time_seconds']),
            r['phone'],
            r['email'],
            full_loc,
            addr_line,
            r['pincode'],
            r['tshirt_size'] or "PENDING"
        ]
        
        for c_idx, val in enumerate(row_data, 1):
            cell = ws2.cell(row=row_num, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            
            if c_idx in [1, 2, 3, 4, 6, 7, 11, 12]:
                cell.alignment = align_center
            else:
                cell.alignment = align_left
                
            if c_idx == 3:
                if r_idx == 1:
                    cell.fill = fill_gold
                    cell.font = font_gold
                elif r_idx == 2:
                    cell.fill = fill_silver
                    cell.font = font_silver
                else:
                    cell.fill = fill_bronze
                    cell.font = font_bronze

        sno2 += 1

for col in ws2.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.row < 4:
            continue
        val = str(cell.value or '')
        max_len = max(max_len, len(val))
    ws2.column_dimensions[col_letter].width = max(max_len + 4, 12)


# ==============================================================================
# SHEET 3: 1st Rank T-Shirt Winners
# ==============================================================================
ws3 = wb.create_sheet(title="1st Rank T-Shirt Winners")

ws3.merge_cells("A1:K1")
ws3["A1"] = "MOUNTAIN RUN — GANDHI JAYANTI VICTORY RUN 2026"
ws3["A1"].font = font_title
ws3["A1"].alignment = align_center

ws3.merge_cells("A2:K2")
ws3["A2"] = "Official 1st Rank Winners — DRI-FIT T-Shirt Dispatch List (5 Category Champions)"
ws3["A2"].font = font_sub
ws3["A2"].alignment = align_center

ws3.row_dimensions[1].height = 28
ws3.row_dimensions[2].height = 20
ws3.row_dimensions[4].height = 26

headers3 = [
    "S.No",
    "Category",
    "Rank",
    "BIB Number",
    "Runner Name",
    "Finish Time",
    "Mobile Number",
    "Email Address",
    "Shipping Address",
    "City & State",
    "T-Shirt Size"
]

for col_idx, h in enumerate(headers3, 1):
    cell = ws3.cell(row=4, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = thin_border

sno3 = 1
for dist in distances_ordered:
    cat_rows = [
        r for r in all_approved 
        if r['distance'].lower().replace(' ', '') == dist.lower().replace(' ', '')
        and r['admin_note'] != 'PODIUM_DUMMY_RANK_PLACEHOLDER'
    ]
    cat_rows.sort(key=lambda x: x['finish_time_seconds'] if x['finish_time_seconds'] is not None else 999999)
    winner = cat_rows[0]
    
    row_num = 4 + sno3
    ws3.row_dimensions[row_num].height = 24
    
    full_loc = f"{winner['city']}, {winner['state']}" if winner['city'] and winner['state'] else (winner['city'] or winner['state'] or "India")
    addr_line = f"{winner['address_line1']}, {winner['address_line2']}".strip().rstrip(',')
    if winner['pincode']:
        addr_line = f"{addr_line} - {winner['pincode']}"
        
    row_data = [
        sno3,
        dist,
        "🥇 1st (Champion)",
        winner['bib_number'],
        winner['shipping_name'] or winner['user_name'],
        format_time(winner['finish_time_seconds']),
        winner['phone'],
        winner['email'],
        addr_line,
        full_loc,
        winner['tshirt_size'] or "PENDING"
    ]
    
    for c_idx, val in enumerate(row_data, 1):
        cell = ws3.cell(row=row_num, column=c_idx, value=val)
        cell.font = font_data
        cell.border = thin_border
        
        if c_idx in [1, 2, 3, 4, 6, 7, 11]:
            cell.alignment = align_center
        else:
            cell.alignment = align_left
            
        if c_idx == 3:
            cell.fill = fill_gold
            cell.font = font_gold

    sno3 += 1

# Additional Confirmed Winner added via WhatsApp
manual_entries = [
    {
        "category": "7 km (Sports Day Winner)",
        "rank": "🎖️ Confirmed Winner (WhatsApp)",
        "bib": "SDC-114076",
        "name": "Swaraj (Kumar Swaraj)",
        "time": "01:05:39",
        "phone": "+918969261421",
        "email": "anshu152raj@gmail.com",
        "address": "barsana prime near double diamond hostel, E-60, coral park gate no 1 - 324002",
        "location": "Kota, Rajasthan",
        "size": "XL"
    }
]

for m in manual_entries:
    row_num = 4 + sno3
    ws3.row_dimensions[row_num].height = 24
    row_data = [
        sno3,
        m["category"],
        m["rank"],
        m["bib"],
        m["name"],
        m["time"],
        m["phone"],
        m["email"],
        m["address"],
        m["location"],
        m["size"]
    ]
    for c_idx, val in enumerate(row_data, 1):
        cell = ws3.cell(row=row_num, column=c_idx, value=val)
        cell.font = font_data
        cell.border = thin_border
        if c_idx in [1, 2, 3, 4, 6, 7, 11]:
            cell.alignment = align_center
        else:
            cell.alignment = align_left
        if c_idx == 3:
            cell.fill = fill_real
            cell.font = font_real
        if c_idx == 11:
            cell.fill = fill_gold
            cell.font = font_gold
    sno3 += 1

for col in ws3.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.row < 4:
            continue
        val = str(cell.value or '')
        max_len = max(max_len, len(val))
    ws3.column_dimensions[col_letter].width = max(max_len + 4, 12)


# ==============================================================================
# SHEET 4: All Real Finishers (143)
# ==============================================================================
ws4 = wb.create_sheet(title="All Real Finishers (143)")

ws4.merge_cells("A1:J1")
ws4["A1"] = "MOUNTAIN RUN — GANDHI JAYANTI VICTORY RUN 2026"
ws4["A1"].font = font_title
ws4["A1"].alignment = align_center

ws4.merge_cells("A2:J2")
ws4["A2"] = "Complete Official Real Finishers List (143 Athletes Approved with Timings)"
ws4["A2"].font = font_sub
ws4["A2"].alignment = align_center

ws4.row_dimensions[1].height = 28
ws4.row_dimensions[2].height = 20
ws4.row_dimensions[4].height = 26

headers4 = [
    "S.No",
    "Category",
    "Category Rank",
    "BIB Number",
    "Runner Name",
    "Finish Time",
    "Phone",
    "Email",
    "City & State",
    "Shipping Address"
]

for col_idx, h in enumerate(headers4, 1):
    cell = ws4.cell(row=4, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = thin_border

sno4 = 1
for dist in distances_ordered:
    cat_rows = [
        r for r in all_approved 
        if r['distance'].lower().replace(' ', '') == dist.lower().replace(' ', '')
        and r['admin_note'] != 'PODIUM_DUMMY_RANK_PLACEHOLDER'
    ]
    cat_rows.sort(key=lambda x: x['finish_time_seconds'] if x['finish_time_seconds'] is not None else 999999)
    
    for r_idx, r in enumerate(cat_rows, 1):
        row_num = 4 + sno4
        ws4.row_dimensions[row_num].height = 20
        
        full_loc = f"{r['city']}, {r['state']}" if r['city'] and r['state'] else (r['city'] or r['state'] or "India")
        addr_line = f"{r['address_line1']}, {r['address_line2']}".strip().rstrip(',')
        if r['pincode']:
            addr_line = f"{addr_line} - {r['pincode']}"
            
        row_data = [
            sno4,
            dist,
            f"Rank {r_idx}",
            r['bib_number'],
            r['shipping_name'] or r['user_name'],
            format_time(r['finish_time_seconds']),
            r['phone'],
            r['email'],
            full_loc,
            addr_line
        ]
        
        for c_idx, val in enumerate(row_data, 1):
            cell = ws4.cell(row=row_num, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            
            if c_idx in [1, 2, 3, 4, 6, 7]:
                cell.alignment = align_center
            else:
                cell.alignment = align_left

        sno4 += 1

for col in ws4.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.row < 4:
            continue
        val = str(cell.value or '')
        max_len = max(max_len, len(val))
    ws4.column_dimensions[col_letter].width = max(max_len + 4, 12)

# Save Workbook
out_file1 = "GANDHI_JAYANTI_LEADERBOARD_TSHIRT_WINNERS.xlsx"
out_file2 = "GANDHI_JAYANTI_REAL_LEADERBOARD_MASTER.xlsx"

wb.save(out_file1)
wb.save(out_file2)

print(f"Successfully created:")
print(f"1. {out_file1}")
print(f"2. {out_file2}")
