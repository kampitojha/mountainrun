import numpy as np
from PIL import Image, ImageDraw, ImageFont
import qrcode
import os

def create_master_template():
    src_path = r"C:\Users\91991\.gemini\antigravity-ide\brain\96d65ca8-b820-4429-af13-16b98b858ded\exact_crop.png"
    im = Image.open(src_path).convert("RGB")
    arr = np.array(im)

    # 1. Clean 'Runner Name':
    # Zone: y from 262 to 348, x from 300 to 710
    # Gold line is at y >= 349.
    # Linear interpolation horizontally between x=295 and x=715
    for y in range(260, 349):
        left_val = arr[y, 290, :].astype(float)
        right_val = arr[y, 715, :].astype(float)
        for x in range(295, 712):
            t = (x - 295) / (712 - 295)
            arr[y, x, :] = ((1.0 - t) * left_val + t * right_val).astype(np.uint8)

    # 2. Clean Distance '10.00 KM':
    # x in [328, 395], y in [475, 490]
    # Sample background from row above (473) and below (492)
    top_dist = arr[472:475, 326:396, :].mean(axis=0)
    bot_dist = arr[491:494, 326:396, :].mean(axis=0)
    h_dist = 491 - 475
    for i in range(h_dist):
        w = i / float(h_dist)
        arr[475 + i, 326:396, :] = ((1.0 - w) * top_dist + w * bot_dist).astype(np.uint8)

    # 3. Clean Time '00:58:24':
    # The stopwatch icon ends before x=495.
    # Text is strictly between x=499 and x=558, y between 475 and 490.
    top_time = arr[472:475, 498:560, :].mean(axis=0)
    bot_time = arr[491:494, 498:560, :].mean(axis=0)
    h_time = 491 - 475
    for i in range(h_time):
        w = i / float(h_time)
        arr[475 + i, 498:560, :] = ((1.0 - w) * top_time + w * bot_time).astype(np.uint8)

    # 4. Clean QR code interior into crisp pure white:
    # QR box is x in [46, 102], y in [612, 669]
    arr[612:670, 46:103, :] = [255, 255, 255]

    # 5. Clean Certificate ID text:
    # Background is dark forest green [0, 21, 18]
    arr[657:672, 114:270, :] = [0, 21, 18]

    template = Image.fromarray(arr)
    out_dir = r"backend\assets\templates"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "gandhi_cert_master_template.png")
    template.save(out_path)
    print(f"Saved master blank template to {out_path}")
    return template

if __name__ == "__main__":
    create_master_template()
