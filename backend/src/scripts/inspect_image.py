import numpy as np
from PIL import Image

img_path = r"C:\Users\91991\.gemini\antigravity-ide\brain\96d65ca8-b820-4429-af13-16b98b858ded\.user_uploaded\media_1790854148655.jpg"
im = Image.open(img_path)
arr = np.array(im)

print("Image shape:", arr.shape)
# Find non-black bounding box (pixels with R,G,B not all < 25)
mask = np.any(arr > 30, axis=2)
coords = np.argwhere(mask)
y0, x0 = coords.min(axis=0)
y1, x1 = coords.max(axis=0)
print(f"Crop box: left={x0}, top={y0}, right={x1}, bottom={y1}, width={x1-x0}, height={y1-y0}")
