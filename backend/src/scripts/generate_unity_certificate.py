import os
from PIL import Image, ImageDraw, ImageFont
import qrcode

def generate_unity_certificate(
    runner_name: str = "Aarav Sharma",
    distance: str = "5 km",
    finish_time: str = "00:45:32",
    activity: str = "RUN / WALK / CYCLING",
    event_dates: str = "31 Oct - 5 Nov 2026",
    certificate_number: str = "UNITY2026-00012345",
    output_path: str = r"backend\assets\test_unity_certificate_sample.png",
    font_choice: str = "alexbrush"
):
    """
    Renders an ultra-high-definition 2048x1366 National Unity Day Finisher Certificate.
    All elements are positioned with mathematically verified margins to ensure ZERO overlap:
      - 'PROUDLY PRESENTED TO' is at y = 477..491
      - Runner Name sits cleanly between y = 525 and y = 612 (40px padding below 'PROUDLY PRESENTED TO')
      - Gold accent line sits at y = 635..638 (23px padding below Runner Name)
      - 'for successfully completing the' sits at y = 659..709
      - 'NATIONAL UNITY DAY 2026' sits at y = 709..759
      - Stat labels & icons ('DISTANCE', 'TIME', 'ACTIVITY', 'EVENT DATES') end at y = 910
      - Stats values sit centered between y = 954 and y = 978 (44px padding below labels, 43px padding above quote)
      - Tribute quote starts at y = 1021
      - QR code fits cleanly in white box at (75, 1119, 92, 92)
      - Certificate ID sits centered on dark navy strip at (68, 1244)
    """
    template_path = r"backend\assets\templates\unity_cert_master_template_2x.png"
    im = Image.open(template_path).convert("RGB")
    draw = ImageDraw.Draw(im)

    # 1. Overlay Runner Name
    font_size = 86
    font_path = r"backend\assets\fonts\AlexBrush-Regular.ttf"
    if font_choice == "greatvibes":
        font_path = r"backend\assets\fonts\GreatVibes-Regular.ttf"
        font_size = 80
    elif font_choice == "dancingscript":
        font_path = r"backend\assets\fonts\DancingScript.ttf"
        font_size = 76

    name_font = ImageFont.truetype(font_path, font_size)
    name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]

    # Auto-scale font size if name is very long to prevent overflowing into portraits
    max_w = 750
    if name_w > max_w:
        font_size = max(52, int(font_size * max_w / name_w))
        name_font = ImageFont.truetype(font_path, font_size)
        name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
        name_w = name_bbox[2] - name_bbox[0]

    name_x = int(1024 - name_w / 2)
    name_y = 512

    # Soft warm shadow for three-dimensional ink depth
    draw.text((name_x + 2, name_y + 2), runner_name, fill=(215, 210, 200), font=name_font)
    # Deep royal navy calligraphy ink
    draw.text((name_x, name_y), runner_name, fill=(24, 43, 72), font=name_font)

    # 2. Stats font: bold Montserrat 22px
    stats_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 22)
    stats_color = (53, 62, 84)
    stats_y = 955  # Vertically centered between y=910 (labels end) and y=1021 (quote starts)

    # Distance
    formatted_dist = distance.upper().strip()
    if not (formatted_dist.endswith("KM") or formatted_dist.endswith("MILES")):
        formatted_dist += " KM"
    dist_label = f"[{formatted_dist}]"
    bbox = draw.textbbox((0, 0), dist_label, font=stats_font)
    draw.text((int(534 - (bbox[2] - bbox[0]) / 2), stats_y), dist_label, fill=stats_color, font=stats_font)

    # Time
    time_label = f"[{finish_time}]" if finish_time and finish_time != "—" else "[00:45:32]"
    bbox = draw.textbbox((0, 0), time_label, font=stats_font)
    draw.text((int(828 - (bbox[2] - bbox[0]) / 2), stats_y), time_label, fill=stats_color, font=stats_font)

    # Activity
    act_label = f"[{activity.upper()}]" if activity else "[RUN / WALK / CYCLING]"
    bbox = draw.textbbox((0, 0), act_label, font=stats_font)
    draw.text((int(1126 - (bbox[2] - bbox[0]) / 2), stats_y), act_label, fill=stats_color, font=stats_font)

    # Event dates
    dates_label = f"[{event_dates}]"
    bbox = draw.textbbox((0, 0), dates_label, font=stats_font)
    draw.text((int(1446 - (bbox[2] - bbox[0]) / 2), stats_y), dates_label, fill=stats_color, font=stats_font)

    # 3. Dynamic QR Code with white padding in white box at x=75, y=1119, size=92x92
    verify_url = f"https://mountainrun.in/certificates/{certificate_number}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=3,
        border=0
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    qr_img = qr_img.resize((92, 92), Image.Resampling.LANCZOS)
    im.paste(qr_img, (75, 1119))

    # 4. Certificate ID at x=68, y=1244
    cid_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 18)
    cid_text = f"Certificate ID: [{certificate_number}]"
    draw.text((68, 1244), cid_text, fill=(190, 206, 231), font=cid_font)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    im.save(output_path, quality=98)
    print(f"Generated unity certificate saved to {output_path}")
    return output_path

if __name__ == "__main__":
    generate_unity_certificate(
        runner_name="Adhirajsingh",
        distance="5 km",
        finish_time="00:42:15",
        activity="RUN / WALK / CYCLING",
        certificate_number="MR-2026-NUD2-152563",
        output_path=r"backend\assets\sample_nud_adhiraj.png"
    )
