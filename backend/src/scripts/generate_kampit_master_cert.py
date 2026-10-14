import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import qrcode

def generate_gandhi_certificate(
    runner_name: str,
    distance_str: str,
    time_str: str,
    cert_number: str,
    output_path: str
):
    template_path = r"backend\assets\templates\gandhi_cert_master_template.png"
    im = Image.open(template_path).convert("RGB")
    draw = ImageDraw.Draw(im)

    # 1. Overlay Runner Name in AlexBrush (matching original cursive style)
    name_font = ImageFont.truetype(r"backend\assets\fonts\AlexBrush-Regular.ttf", 62)
    name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]
    name_x = int(502 - name_w / 2)
    name_y = 274
    # Deep midnight navy/forest
    draw.text((name_x, name_y), runner_name, fill=(13, 33, 48), font=name_font)

    # 2. Stats font (Static Montserrat-Bold)
    stats_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 15)
    stats_color = (15, 25, 40)  # Solid dark navy charcoal

    # Distance text
    formatted_dist = distance_str.upper()
    if not formatted_dist.endswith("KM"):
        formatted_dist += " KM"
    draw.text((328, 475), formatted_dist, fill=stats_color, font=stats_font)

    # Time text
    draw.text((502, 475), time_str, fill=stats_color, font=stats_font)

    # 3. Clean white box & paste QR code
    draw.rounded_rectangle([45, 611, 103, 670], radius=5, fill=(255, 255, 255))

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

    # 4. Certificate ID:
    # Clear the dark zone cleanly with dark forest green
    draw.rectangle([112, 658, 280, 673], fill=(1, 23, 20))
    id_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 11)
    id_text = f"Certificate ID: {cert_number}"
    draw.text((115, 659), id_text, fill=(255, 255, 255), font=id_font)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    im.save(output_path, quality=98)
    print(f"Generated perfect certificate: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_gandhi_certificate(
        runner_name="Kampit Ojha",
        distance_str="10.00 KM",
        time_str="00:58:24",
        cert_number="MR-2026-GJVR-109452",
        output_path=r"backend\assets\kampit_gandhi_certificate_master.png"
    )
    # Also save to frontend public images for web app access
    generate_gandhi_certificate(
        runner_name="Kampit Ojha",
        distance_str="10.00 KM",
        time_str="00:58:24",
        cert_number="MR-2026-GJVR-109452",
        output_path=r"frontend\public\images\certificates\gandhi-kampit-cert.png"
    )
    # Also save template to frontend public for client-side canvas rendering if needed
    import shutil
    shutil.copyfile(
        r"backend\assets\templates\gandhi_cert_master_template.png",
        r"frontend\public\images\certificates\gandhi-master-template.png"
    )
    print("Copied master template to frontend public directory")
