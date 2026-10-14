import os
from PIL import Image, ImageDraw, ImageFont
import qrcode

def polish_certificate(
    runner_name: str = "Kampit Ojha",
    distance_str: str = "10.00 KM",
    time_str: str = "00:58:24",
    cert_number: str = "MR-2026-GJVR-109452",
    output_path: str = r"backend\assets\kampit_gandhi_polished_v2.png"
):
    template_path = r"backend\assets\templates\gandhi_cert_master_template.png"
    im = Image.open(template_path).convert("RGB")
    W, H = im.size # 1000, 700
    draw = ImageDraw.Draw(im)

    GOLD_COLOR = (201, 162, 39)
    BRIGHT_GOLD = (235, 189, 58)
    DEEP_NAVY = (10, 26, 40)

    # 1. Elegant Gold Corner Accents (delicate diploma filigree)
    corner_m = 17
    b_len = 34
    for cx, cy, dx, dy in [
        (corner_m, corner_m, 1, 1),           # Top-Left
        (W - corner_m, corner_m, -1, 1),       # Top-Right
        (corner_m, H - corner_m, 1, -1),      # Bottom-Left
        (W - corner_m, H - corner_m, -1, -1),  # Bottom-Right
    ]:
        draw.line([(cx, cy), (cx + dx * b_len, cy)], fill=BRIGHT_GOLD, width=2)
        draw.line([(cx, cy), (cx, cy + dy * b_len)], fill=BRIGHT_GOLD, width=2)
        draw.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=GOLD_COLOR)

    # 2. Render Runner Name in AlexBrush (size 68) with dual-layer depth
    name_font = ImageFont.truetype(r"backend\assets\fonts\AlexBrush-Regular.ttf", 68)
    name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]
    name_x = int(502 - name_w / 2)
    name_y = 268

    # Soft warm ivory drop shadow
    draw.text((name_x + 1, name_y + 1), runner_name, fill=(210, 195, 175), font=name_font)
    # Deep midnight navy calligraphy ink
    draw.text((name_x, name_y), runner_name, fill=DEEP_NAVY, font=name_font)

    # Delicate gold flourish accents flanking the name
    flourish_y = name_y + 44
    left_x = name_x - 14
    right_x = name_x + name_w + 14

    if left_x > 330:
        draw.line([(left_x - 32, flourish_y), (left_x - 8, flourish_y)], fill=GOLD_COLOR, width=1)
        # Small diamond
        draw.polygon([(left_x - 4, flourish_y - 3), (left_x - 1, flourish_y), (left_x - 4, flourish_y + 3), (left_x - 7, flourish_y)], fill=BRIGHT_GOLD)

    if right_x < 670:
        draw.polygon([(right_x + 4, flourish_y - 3), (right_x + 7, flourish_y), (right_x + 4, flourish_y + 3), (right_x + 1, flourish_y)], fill=BRIGHT_GOLD)
        draw.line([(right_x + 8, flourish_y), (right_x + 32, flourish_y)], fill=GOLD_COLOR, width=1)

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

    # 4. QR Code container
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

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    im.save(output_path, quality=98)
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    polish_certificate()
