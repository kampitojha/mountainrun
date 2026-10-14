import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import qrcode

def generate_gandhi_cert_final(
    runner_name: str,
    distance_str: str,
    time_str: str,
    cert_number: str,
    output_path: str,
    script_font_path: str,
    script_size: int = 58,
    script_y: int = 278,
):
    template_path = r"backend\assets\templates\gandhi_cert_master_template.png"
    im = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(im)

    # 1. Overlay Runner Name
    name_font = ImageFont.truetype(script_font_path, script_size)
    name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]
    name_x = int(502 - name_w / 2)
    name_color = (13, 33, 48)  # Deep midnight navy/forest

    draw.text((name_x, script_y), runner_name, fill=name_color, font=name_font)

    # 2. Stats font (Montserrat-Bold)
    stats_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-Bold.ttf", 15)
    stats_color = (35, 42, 54)  # Deep charcoal navy

    # Distance
    formatted_dist = distance_str.upper()
    if not formatted_dist.endswith("KM"):
        formatted_dist += " KM"
    draw.text((329, 476), formatted_dist, fill=stats_color, font=stats_font)

    # Time
    draw.text((502, 476), time_str, fill=stats_color, font=stats_font)

    # 3. Clean white box & paste QR code
    # Clean rounded rectangle for QR box: x from 45 to 103, y from 611 to 670, radius 6
    draw.rounded_rectangle([45, 611, 103, 670], radius=6, fill=(255, 255, 255))

    verify_url = f"https://mountainrun.in/certificates/{cert_number}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=2,
        border=0,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    qr_img = qr_img.resize((50, 50), Image.Resampling.LANCZOS)
    im.paste(qr_img, (49, 615))

    # 4. Certificate ID:
    # Clear the dark zone cleanly
    draw.rectangle([112, 658, 280, 673], fill=(1, 23, 20))
    id_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-Bold.ttf", 11)
    id_text = f"Certificate ID: {cert_number}"
    draw.text((115, 659), id_text, fill=(240, 245, 245), font=id_font)

    im.convert("RGB").save(output_path, quality=98)
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    generate_gandhi_cert_final(
        runner_name="Kampit Ojha",
        distance_str="10.00 KM",
        time_str="00:58:24",
        cert_number="MR-2026-GJVR-109452",
        output_path=r"backend\assets\cert_test_alexbrush_v2.png",
        script_font_path=r"backend\assets\fonts\AlexBrush-Regular.ttf",
        script_size=60,
        script_y=276
    )
    generate_gandhi_cert_final(
        runner_name="Kampit Ojha",
        distance_str="10.00 KM",
        time_str="00:58:24",
        cert_number="MR-2026-GJVR-109452",
        output_path=r"backend\assets\cert_test_greatvibes_v2.png",
        script_font_path=r"backend\assets\fonts\GreatVibes-Regular.ttf",
        script_size=58,
        script_y=274
    )
    generate_gandhi_cert_final(
        runner_name="Kampit Ojha",
        distance_str="10.00 KM",
        time_str="00:58:24",
        cert_number="MR-2026-GJVR-109452",
        output_path=r"backend\assets\cert_test_dancing_v2.png",
        script_font_path=r"backend\assets\fonts\DancingScript.ttf",
        script_size=48,
        script_y=280
    )
