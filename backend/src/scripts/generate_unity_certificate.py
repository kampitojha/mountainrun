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
    template_path = r"backend\assets\templates\unity_cert_master_template.png"
    im = Image.open(template_path).convert("RGB")
    draw = ImageDraw.Draw(im)

    # 1. Overlay Runner Name
    if font_choice == "alexbrush":
        font_path = r"backend\assets\fonts\AlexBrush-Regular.ttf"
        font_size = 62
        y_pos = 260
    elif font_choice == "greatvibes":
        font_path = r"backend\assets\fonts\GreatVibes-Regular.ttf"
        font_size = 56
        y_pos = 262
    else:
        font_path = r"backend\assets\fonts\DancingScript.ttf"
        font_size = 54
        y_pos = 262

    name_font = ImageFont.truetype(font_path, font_size)
    name_bbox = draw.textbbox((0, 0), runner_name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]
    name_x = int(515 - name_w / 2)

    # Soft warm shadow for three-dimensional ink depth
    draw.text((name_x + 1, y_pos + 1), runner_name, fill=(215, 210, 200), font=name_font)
    # Deep royal navy calligraphy ink
    draw.text((name_x, y_pos), runner_name, fill=(24, 43, 72), font=name_font)

    # 2. Stats font
    stats_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 13)
    stats_color = (53, 62, 84)

    # Distance
    formatted_dist = distance.upper().strip()
    if not (formatted_dist.endswith("KM") or formatted_dist.endswith("MILES")):
        formatted_dist += " KM"
    dist_label = f"[{formatted_dist}]"
    bbox = draw.textbbox((0, 0), dist_label, font=stats_font)
    draw.text((int(267 - (bbox[2] - bbox[0]) / 2), 470), dist_label, fill=stats_color, font=stats_font)

    # Time
    time_label = f"[{finish_time}]" if finish_time and finish_time != "—" else "[00:45:32]"
    bbox = draw.textbbox((0, 0), time_label, font=stats_font)
    draw.text((int(412 - (bbox[2] - bbox[0]) / 2), 470), time_label, fill=stats_color, font=stats_font)

    # Activity
    act_label = f"[{activity.upper()}]" if activity else "[RUN / WALK / CYCLING]"
    bbox = draw.textbbox((0, 0), act_label, font=stats_font)
    draw.text((int(558 - (bbox[2] - bbox[0]) / 2), 470), act_label, fill=stats_color, font=stats_font)

    # Event dates
    dates_label = f"[{event_dates}]"
    bbox = draw.textbbox((0, 0), dates_label, font=stats_font)
    draw.text((int(725 - (bbox[2] - bbox[0]) / 2), 470), dates_label, fill=stats_color, font=stats_font)

    # 3. Dynamic QR Code with white padding
    verify_url = f"https://mountainrun.in/certificates/{certificate_number}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=2,
        border=0
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    qr_img = qr_img.resize((48, 48), Image.Resampling.LANCZOS)
    im.paste(qr_img, (36, 558))

    # 4. Certificate ID
    cid_font = ImageFont.truetype(r"backend\assets\fonts\Montserrat-StaticBold.ttf", 10)
    cid_text = f"Certificate ID: [{certificate_number}]"
    draw.text((34, 621), cid_text, fill=(190, 206, 231), font=cid_font)

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
        output_path=r"backend\assets\test_unity_adhiraj.png"
    )

