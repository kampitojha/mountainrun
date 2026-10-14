import numpy as np
from PIL import Image

im = Image.open(r"C:\Users\91991\.gemini\antigravity-ide\brain\96d65ca8-b820-4429-af13-16b98b858ded\cert_cropped.png").convert("RGBA")
arr = np.array(im)

# 1. Clean 'Runner Name':
# Bounding box is x in [300, 710], y in [268, 348]
# Preserving the gold line at y=352..354!
for y in range(266, 349):
    left_col = arr[y, 290, :3].astype(float)
    right_col = arr[y, 715, :3].astype(float)
    for x in range(295, 712):
        t = (x - 295) / (712 - 295)
        arr[y, x, :3] = ((1 - t) * left_col + t * right_col).astype(np.uint8)

# 2. Clean stats values only (leaving icons and labels 100% intact):
# '10.00 KM' is at x in [324, 405], y in [475, 502]
for y in range(475, 503):
    sample = arr[y, 320, :3]
    arr[y, 324:405, :3] = sample

# '00:58:24' is at x in [502, 575], y in [475, 502]
for y in range(475, 503):
    sample = arr[y, 498, :3]
    arr[y, 502:575, :3] = sample

# '2 Oct – 5 Oct 2026' is at x in [653, 768], y in [475, 502]
for y in range(475, 503):
    sample = arr[y, 650, :3]
    arr[y, 653:768, :3] = sample

# 3. Clean QR code and Certificate ID:
# Real QR code will be pasted at x=44..108, y=614..678 on a clean white rounded background
# Clear the white box:
arr[614:678, 44:108, :3] = 255

# Clean 'Certificate ID: MR2026XXXX':
# Background is dark forest green. Sample from y+5 or x=260
for y in range(662, 680):
    sample_dark = arr[y, 256, :3]
    for x in range(112, 255):
        arr[y, x, :3] = sample_dark

cleaned = Image.fromarray(arr)
cleaned.save(r"C:\Users\91991\.gemini\antigravity-ide\brain\96d65ca8-b820-4429-af13-16b98b858ded\gandhi_template_perfect.png")
print("Saved gandhi_template_perfect.png successfully!")
