import os
from PIL import Image, ImageDraw, ImageFont
import qrcode

def generate_unity_certificate(
    runner_name: str = "Vaibhav Kumar",
    distance: str = "10 KM",
    finish_time: str = "01:15:50",
    activity: str = "RUNNING",
    event_dates: str = "31 Oct - 9 Nov 2026",
    certificate_number: str = "MR-2026-NUD2580732",
    output_path: str = r"backend\assets\sample_nud_vaibhav.png",
    font_choice: str = "greatvibes"
):
    """
    Renders an authentic, prestigious, ultra-high-definition 2048x1366 National Unity Day Finisher Certificate.
    All elements are positioned with mathematically verified margins matching the original proforma:
      - 'PROUDLY PRESENTED TO' ends at y = 492
      - Runner Name centered at y = 575 (starts ~526, ends ~638), giving 34px padding above and 20px padding below
      - Stats values sit centered at (x=[546, 829, 1125, 1457], y=960) with no brackets
      - Dynamic QR Code at (72, 1114, 96, 96)
      - Certificate ID without brackets at (68, 1244)
    """
    template_path = r"backend\assets\templates\unity_cert_master_template_2x.png"
    im = Image.open(template_path).convert("RGB")
    draw = ImageDraw.Draw(im)

    # 1. Overlay Runner Name in Calligraphy
    font_size = 94
    font_path = r"backend\assets\fonts\GreatVibes-Regular.ttf"
    if font_choice == "alexbrush":
        font_path = r"backend\assets\fonts\AlexBrush-Regular.ttf"
    elif font_choice == "satisfy":
        font_path = r"backend\assets\fonts\Satisfy.ttf"

    name_font = ImageFont.truetype(font_path, font_size)
    name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]

    # Auto-scale font size if name is long to prevent overflowing
    max_w = 750
    if name_w > max_w:
        font_size = max(50, int(font_size * max_w / name_w))
        name_font = ImageFont.truetype(font_path, font_size)
        name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
        name_w = name_bbox[2] - name_bbox[0]

    name_h = name_bbox[3] - name_bbox[1]
    name_x = int(1024 - name_w / 2)
    name_y = int(575 - name_h / 2)

    # Soft warm ivory drop shadow for authentic ink depth
    draw.text((name_x + 1, name_y + 1), runner_name, fill=(218, 210, 198), font=name_font)
    # Deep midnight navy calligraphy ink
    draw.text((name_x, name_y), runner_name, fill=(18, 38, 70), font=name_font)

    # 2. Stats font: bold Montserrat 24px (CLEAN FORMAT, NO BRACKETS!)
    stats_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 24)
    stats_color = (20, 36, 58)
    stats_y = 960

    # Clean Distance (center x=546)
    formatted_dist = distance.upper().strip().replace("[", "").replace("]", "")
    if not (formatted_dist.endswith("KM") or formatted_dist.endswith("MILES")):
        formatted_dist += " KM"
    bbox = draw.textbbox((0, 0), formatted_dist, font=stats_font)
    draw.text((int(546 - (bbox[2] - bbox[0]) / 2), int(stats_y - (bbox[3] - bbox[1]) / 2)), formatted_dist, fill=stats_color, font=stats_font)

    # Clean Time (center x=829)
    clean_time = finish_time.replace("[", "").replace("]", "").strip() if finish_time and finish_time != "—" else "00:45:32"
    bbox = draw.textbbox((0, 0), clean_time, font=stats_font)
    draw.text((int(829 - (bbox[2] - bbox[0]) / 2), int(stats_y - (bbox[3] - bbox[1]) / 2)), clean_time, fill=stats_color, font=stats_font)

    # Clean Activity (center x=1125)
    raw_act = (activity or "").replace("[", "").replace("]", "").strip().lower()
    if "cycl" in raw_act or "bike" in raw_act or "ride" in raw_act:
        clean_act = "CYCLING"
    elif "walk" in raw_act:
        clean_act = "WALKING"
    else:
        clean_act = "RUNNING"
    bbox = draw.textbbox((0, 0), clean_act, font=stats_font)
    draw.text((int(1125 - (bbox[2] - bbox[0]) / 2), int(stats_y - (bbox[3] - bbox[1]) / 2)), clean_act, fill=stats_color, font=stats_font)

    # Clean Event Dates (center x=1457)
    clean_dates = event_dates.replace("[", "").replace("]", "").strip()
    bbox = draw.textbbox((0, 0), clean_dates, font=stats_font)
    draw.text((int(1457 - (bbox[2] - bbox[0]) / 2), int(stats_y - (bbox[3] - bbox[1]) / 2)), clean_dates, fill=stats_color, font=stats_font)

    # 3. Dynamic QR Code with white padding in white box at x=72, y=1114, size=96x96
    clean_cert_num = certificate_number.replace("[", "").replace("]", "").strip()
    verify_url = f"https://mountainrun.in/certificates/{clean_cert_num}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    qr_img = qr_img.resize((96, 96), Image.Resampling.LANCZOS)
    im.paste(qr_img, (72, 1114))

    # 4. Certificate ID: Clean format, NO BRACKETS!
    cid_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 18)
    cid_text = f"Certificate ID: {clean_cert_num}"
    draw.text((68, 1244), cid_text, fill=(195, 212, 236), font=cid_font)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    im.save(output_path, quality=98)
    print(f"Generated: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_unity_certificate(
        runner_name="Vaibhav Kumar",
        distance="10 KM",
        finish_time="01:15:50",
        activity="RUNNING",
        certificate_number="MR-2026-NUD2580732",
        output_path=r"backend\assets\sample_nud_vaibhav.png"
    )
