import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import qrcode

def generate_gandhi_certificate(
    runner_name: str,
    distance: str,
    finish_time: str,
    certificate_number: str,
    output_path: str,
    font_choice: str = "greatvibes"
):
    template_path = r"backend\assets\templates\gandhi_cert_master_template.png"
    im = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(im)

    # 1. Overlay Runner Name
    # Available fonts:
    if font_choice == "alexbrush":
        font_path = r"backend\assets\fonts\AlexBrush-Regular.ttf"
        font_size = 54
        y_pos = 280
    else:
        font_path = r"backend\assets\fonts\GreatVibes-Regular.ttf"
        font_size = 58
        y_pos = 275

    name_font = ImageFont.truetype(font_path, font_size)

    # Center text in the name zone: x between 260 and 740, center is 500
    name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]
    name_x = int(502 - name_w / 2)
    name_color = (13, 33, 48)  # Deep midnight navy/forest

    draw.text((name_x, y_pos), runner_name, fill=name_color, font=name_font)

    # 2. Distance Text
    montserrat_bold = r"backend\assets\fonts\Montserrat-Bold.ttf"
    stats_font = ImageFont.truetype(montserrat_bold, 13)
    stats_color = (12, 30, 48)  # Deep navy

    # Distance text: format e.g. "10.00 KM" or "10 KM"
    formatted_dist = distance.upper()
    if not formatted_dist.endswith("KM"):
        formatted_dist += " KM"
    draw.text((329, 477), formatted_dist, fill=stats_color, font=stats_font)

    # 3. Time Text
    draw.text((503, 477), finish_time, fill=stats_color, font=stats_font)

    # 4. QR Code
    verify_url = f"https://mountainrun.in/certificates/{certificate_number}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=2,
        border=0,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    # Resize QR image to fit inside the white box: 50x50 at x=49, y=615
    qr_img = qr_img.resize((50, 50), Image.Resampling.LANCZOS)
    im.paste(qr_img, (49, 615))

    # 5. Certificate ID text
    id_font = ImageFont.truetype(montserrat_bold, 10)
    id_text = f"Certificate ID: {certificate_number}"
    draw.text((115, 660), id_text, fill=(230, 240, 240), font=id_font)

    # Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    im.convert("RGB").save(output_path, quality=95)
    print(f"Generated certificate saved to {output_path}")

if __name__ == "__main__":
    generate_gandhi_certificate(
        runner_name="Kampit Ojha",
        distance="10.00 KM",
        finish_time="00:58:24",
        certificate_number="MR-2026-GJVR-109452",
        output_path=r"backend\assets\test_kampit_certificate_greatvibes.png",
        font_choice="greatvibes"
    )
    generate_gandhi_certificate(
        runner_name="Kampit Ojha",
        distance="10.00 KM",
        finish_time="00:58:24",
        certificate_number="MR-2026-GJVR-109452",
        output_path=r"backend\assets\test_kampit_certificate_alexbrush.png",
        font_choice="alexbrush"
    )
