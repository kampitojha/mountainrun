import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import qrcode

def polish_certificate(
    runner_name: str = "Kampit Ojha",
    distance_str: str = "10.00 KM",
    time_str: str = "00:58:24",
    cert_number: str = "MR-2026-GJVR-109452",
    output_path: str = r"backend\assets\kampit_gandhi_polished.png"
):
    template_path = r"backend\assets\templates\gandhi_cert_master_template.png"
    im = Image.open(template_path).convert("RGB")
    W, H = im.size # 1000, 700
    draw = ImageDraw.Draw(im)

    # 1. Subtle warm vignette & contrast boost on the template
    # Let's add delicate gold corner filigree brackets (vintage diploma style)
    GOLD_COLOR = (201, 162, 39)
    BRIGHT_GOLD = (235, 189, 58)
    DEEP_NAVY = (10, 26, 40)
    DARK_FOREST = (8, 32, 24)

    # Draw Corner Ornaments (delicate double L-brackets with corner dots)
    corner_margin = 18
    bracket_len = 32
    # Top-Left
    draw.line([(corner_margin, corner_margin), (corner_margin + bracket_len, corner_margin)], fill=BRIGHT_GOLD, width=2)
    draw.line([(corner_margin, corner_margin), (corner_margin, corner_margin + bracket_len)], fill=BRIGHT_GOLD, width=2)
    draw.ellipse([corner_margin - 2, corner_margin - 2, corner_margin + 2, corner_margin + 2], fill=GOLD_COLOR)

    # Top-Right
    draw.line([(W - corner_margin - bracket_len, corner_margin), (W - corner_margin, corner_margin)], fill=BRIGHT_GOLD, width=2)
    draw.line([(W - corner_margin, corner_margin), (W - corner_margin, corner_margin + bracket_len)], fill=BRIGHT_GOLD, width=2)
    draw.ellipse([W - corner_margin - 2, corner_margin - 2, W - corner_margin + 2, corner_margin + 2], fill=GOLD_COLOR)

    # Bottom-Left
    draw.line([(corner_margin, H - corner_margin), (corner_margin + bracket_len, H - corner_margin)], fill=BRIGHT_GOLD, width=2)
    draw.line([(corner_margin, H - corner_margin - bracket_len), (corner_margin, H - corner_margin)], fill=BRIGHT_GOLD, width=2)
    draw.ellipse([corner_margin - 2, H - corner_margin - 2, corner_margin + 2, H - corner_margin + 2], fill=GOLD_COLOR)

    # Bottom-Right
    draw.line([(W - corner_margin - bracket_len, H - corner_margin), (W - corner_margin, H - corner_margin)], fill=BRIGHT_GOLD, width=2)
    draw.line([(W - corner_margin, H - corner_margin - bracket_len), (W - corner_margin, H - corner_margin)], fill=BRIGHT_GOLD, width=2)
    draw.ellipse([W - corner_margin - 2, H - corner_margin - 2, W - corner_margin + 2, H - corner_margin + 2], fill=GOLD_COLOR)

    # 2. Render Runner Name in AlexBrush with richer weight & subtle ink drop shadow
    name_font = ImageFont.truetype(r"backend\assets\fonts\AlexBrush-Regular.ttf", 68)
    name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]
    name_x = int(502 - name_w / 2)
    name_y = 268

    # Subtle soft warm shadow for depth
    draw.text((name_x + 1, name_y + 1), runner_name, fill=(210, 195, 175), font=name_font)
    # Main crisp dark navy ink
    draw.text((name_x, name_y), runner_name, fill=DEEP_NAVY, font=name_font)

    # Decorative gold flourishes flanking the name
    flourish_y = name_y + 44
    left_x = name_x - 18
    right_x = name_x + name_w + 18
    
    # Left diamond & tapered line
    if left_x > 320:
        draw.line([(left_x - 35, flourish_y), (left_x - 8, flourish_y)], fill=GOLD_COLOR, width=1)
        # Small diamond
        draw.polygon([(left_x - 4, flourish_y - 3), (left_x - 1, flourish_y), (left_x - 4, flourish_y + 3), (left_x - 7, flourish_y)], fill=BRIGHT_GOLD)

    # Right diamond & tapered line
    if right_x < 685:
        draw.polygon([(right_x + 4, flourish_y - 3), (right_x + 7, flourish_y), (right_x + 4, flourish_y + 3), (right_x + 1, flourish_y)], fill=BRIGHT_GOLD)
        draw.line([(right_x + 8, flourish_y), (right_x + 35, flourish_y)], fill=GOLD_COLOR, width=1)

    # 3. Stats Font (Montserrat-Bold)
    stats_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 15)
    stats_color = (15, 25, 40)

    # Distance
    formatted_dist = distance_str.upper()
    if not formatted_dist.endswith("KM"):
        formatted_dist += " KM"
    draw.text((328, 475), formatted_dist, fill=stats_color, font=stats_font)

    # Time
    draw.text((502, 475), time_str, fill=stats_color, font=stats_font)

    # 4. QR Code in rounded white container with subtle gold border
    draw.rounded_rectangle([45, 611, 103, 670], radius=6, fill=(255, 255, 255), outline=GOLD_COLOR, width=1)
    verify_url = f"https://mountainrun.in/certificates/{cert_number}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=2,
        border=0,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    qr_img = qr_img.resize((50, 50), Image.Resampling.LANCZOS)
    im.paste(qr_img, (49, 615))

    # 5. Certificate ID:
    draw.rectangle([112, 658, 280, 673], fill=(1, 23, 20))
    id_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 11)
    id_text = f"Certificate ID: {cert_number}"
    draw.text((115, 659), id_text, fill=(255, 255, 255), font=id_font)

    # 6. Official Gold Foil Finisher Seal Stamp on Right Side!
    # Place a circular medallion at x=895, y=365
    seal_x = 885
    seal_y = 350
    seal_radius = 42

    # Draw circular gold foil badge
    # Outer gold scalloped / double circle
    draw.ellipse([seal_x - seal_radius, seal_y - seal_radius, seal_x + seal_radius, seal_y + seal_radius], fill=(247, 241, 226), outline=BRIGHT_GOLD, width=2)
    draw.ellipse([seal_x - seal_radius + 4, seal_y - seal_radius + 4, seal_x + seal_radius - 4, seal_y + seal_radius - 4], outline=GOLD_COLOR, width=1)

    # Inner seal text & star
    seal_font_sm = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 7)
    seal_font_md = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 8)
    seal_font_star = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 14)

    # Star in center
    draw.text((seal_x - 5, seal_y - 14), "★", fill=(201, 162, 39), font=seal_font_star)
    # FINISHER text
    fin_bbox = draw.textbbox((0, 0), "VERIFIED", font=seal_font_md)
    fin_w = fin_bbox[2] - fin_bbox[0]
    draw.text((int(seal_x - fin_w / 2), seal_y + 2), "VERIFIED", fill=(13, 56, 41), font=seal_font_md)

    off_bbox = draw.textbbox((0, 0), "FINISHER 2026", font=seal_font_sm)
    off_w = off_bbox[2] - off_bbox[0]
    draw.text((int(seal_x - off_w / 2), seal_y + 13), "FINISHER 2026", fill=GOLD_COLOR, font=seal_font_sm)

    # Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    im.save(output_path, quality=98)
    print(f"Saved polished certificate: {output_path}")

if __name__ == "__main__":
    polish_certificate()
