import os
import sys
import subprocess

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = os.path.join(os.getcwd(), "tshirt_print_pack")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── 1. STACKED VERTICAL ATHLETIC LOGO (LIGHT T-SHIRTS) ───
# Ideal for Front Chest T-Shirt Placement
svg_stacked_light = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1100" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="grad-mountain-light" x1="100" y1="500" x2="600" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>

    <linearGradient id="grad-fill-light" x1="100" y1="500" x2="600" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d9488" stop-opacity="0.18"/>
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.06"/>
    </linearGradient>

    <linearGradient id="grad-sun-light" x1="560" y1="120" x2="700" y2="260" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <linearGradient id="grad-text-light" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>

  <!-- Big Mountain Logo Emblem Center Top -->
  <g transform="translate(150, 40)">
    <!-- Glowing Sun -->
    <circle cx="500" cy="230" r="85" fill="url(#grad-sun-light)" />
    
    <!-- Mountain Fill -->
    <path d="M120 540 L260 260 L380 440 L500 200 L620 540 Z" fill="url(#grad-fill-light)" />
    
    <!-- Mountain Strokes -->
    <path d="M120 540 L260 260 L380 440 L500 200 L620 540" 
          stroke="url(#grad-mountain-light)" stroke-width="46" stroke-linecap="round" stroke-linejoin="round" />
    
    <!-- Dynamic Running Trail -->
    <path d="M80 460 C 220 460, 280 360, 390 360 C 500 360, 530 480, 650 480" 
          stroke="url(#grad-mountain-light)" stroke-width="34" stroke-linecap="round" />
  </g>

  <!-- Typography -->
  <!-- "MOUNTAIN" -->
  <text x="500" y="730" text-anchor="middle" fill="#0f172a" font-family="'Outfit', 'Montserrat', sans-serif" font-size="108" font-weight="900" letter-spacing="16">MOUNTAIN</text>
  
  <!-- "RUN" with Gradient -->
  <text x="500" y="845" text-anchor="middle" fill="url(#grad-text-light)" font-family="'Outfit', 'Montserrat', sans-serif" font-size="108" font-weight="900" letter-spacing="24">RUN</text>

  <!-- Divider with decorative wings -->
  <g transform="translate(200, 890)">
    <line x1="0" y1="0" x2="220" y2="0" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" />
    <polygon points="300,-8 310,0 300,8 290,0" fill="#0d9488" />
    <line x1="380" y1="0" x2="600" y2="0" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- "RUN WITH PRIDE" Tagline -->
  <rect x="250" y="940" width="500" height="64" rx="32" fill="#0f172a" />
  <text x="500" y="982" text-anchor="middle" fill="#38bdf8" font-family="'Outfit', 'Montserrat', sans-serif" font-size="30" font-weight="800" letter-spacing="12">RUN WITH PRIDE</text>
</svg>"""

# ─── 2. STACKED VERTICAL ATHLETIC LOGO (DARK T-SHIRTS) ───
svg_stacked_dark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1100" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="grad-mountain-dark" x1="100" y1="500" x2="600" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>

    <linearGradient id="grad-fill-dark" x1="100" y1="500" x2="600" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.10"/>
    </linearGradient>

    <linearGradient id="grad-sun-dark" x1="560" y1="120" x2="700" y2="260" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="60%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <linearGradient id="grad-text-dark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#a5b4fc"/>
    </linearGradient>
  </defs>

  <g transform="translate(150, 40)">
    <circle cx="500" cy="230" r="85" fill="url(#grad-sun-dark)" />
    <path d="M120 540 L260 260 L380 440 L500 200 L620 540 Z" fill="url(#grad-fill-dark)" />
    <path d="M120 540 L260 260 L380 440 L500 200 L620 540" 
          stroke="url(#grad-mountain-dark)" stroke-width="46" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M80 460 C 220 460, 280 360, 390 360 C 500 360, 530 480, 650 480" 
          stroke="url(#grad-mountain-dark)" stroke-width="34" stroke-linecap="round" />
  </g>

  <!-- Typography -->
  <text x="500" y="730" text-anchor="middle" fill="#ffffff" font-family="'Outfit', 'Montserrat', sans-serif" font-size="108" font-weight="900" letter-spacing="16">MOUNTAIN</text>
  <text x="500" y="845" text-anchor="middle" fill="url(#grad-text-dark)" font-family="'Outfit', 'Montserrat', sans-serif" font-size="108" font-weight="900" letter-spacing="24">RUN</text>

  <g transform="translate(200, 890)">
    <line x1="0" y1="0" x2="220" y2="0" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-linecap="round" />
    <polygon points="300,-8 310,0 300,8 290,0" fill="#2dd4bf" />
    <line x1="380" y1="0" x2="600" y2="0" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- "RUN WITH PRIDE" Pill Badge -->
  <rect x="250" y="940" width="500" height="64" rx="32" fill="rgba(255,255,255,0.12)" stroke="#2dd4bf" stroke-width="2" />
  <text x="500" y="982" text-anchor="middle" fill="#fde047" font-family="'Outfit', 'Montserrat', sans-serif" font-size="30" font-weight="800" letter-spacing="12">RUN WITH PRIDE</text>
</svg>"""

# ─── 3. HORIZONTAL LOGO WITH "RUN WITH PRIDE" (LIGHT T-SHIRTS) ───
svg_horiz_pride_light = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1350 360" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="h-grad-primary" x1="40" y1="280" x2="280" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>

    <linearGradient id="h-grad-fill" x1="40" y1="280" x2="280" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d9488" stop-opacity="0.16"/>
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.05"/>
    </linearGradient>

    <linearGradient id="h-grad-sun" x1="200" y1="70" x2="280" y2="150" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <linearGradient id="h-grad-text" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>

  <g transform="translate(40, 30)">
    <circle cx="230" cy="105" r="42" fill="url(#h-grad-sun)" />
    <path d="M45 255 L115 125 L170 210 L230 95 L285 255 Z" fill="url(#h-grad-fill)" />
    <path d="M45 255 L115 125 L170 210 L230 95 L285 255" 
          stroke="url(#h-grad-primary)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M30 215 C 100 215, 125 165, 180 165 C 235 165, 245 230, 300 230" 
          stroke="url(#h-grad-primary)" stroke-width="18" stroke-linecap="round" />
  </g>

  <!-- Typography -->
  <text x="390" y="195" fill="#0f172a" font-family="'Outfit', 'Montserrat', sans-serif" font-size="132" font-weight="700" letter-spacing="-2">Mountain <tspan fill="url(#h-grad-text)" font-weight="900">Run</tspan></text>
  
  <g transform="translate(395, 230)">
    <rect x="0" y="15" width="420" height="48" rx="24" fill="#0d9488" />
    <text x="210" y="47" text-anchor="middle" fill="#ffffff" font-family="'Outfit', 'Montserrat', sans-serif" font-size="22" font-weight="900" letter-spacing="8">RUN WITH PRIDE</text>
  </g>
</svg>"""

# ─── 4. HORIZONTAL LOGO WITH "RUN WITH PRIDE" (DARK T-SHIRTS) ───
svg_horiz_pride_dark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1350 360" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="hd-grad-primary" x1="40" y1="280" x2="280" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>

    <linearGradient id="hd-grad-fill" x1="40" y1="280" x2="280" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.10"/>
    </linearGradient>

    <linearGradient id="hd-grad-sun" x1="200" y1="70" x2="280" y2="150" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="60%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <linearGradient id="hd-grad-text" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#a5b4fc"/>
    </linearGradient>
  </defs>

  <g transform="translate(40, 30)">
    <circle cx="230" cy="105" r="42" fill="url(#hd-grad-sun)" />
    <path d="M45 255 L115 125 L170 210 L230 95 L285 255 Z" fill="url(#hd-grad-fill)" />
    <path d="M45 255 L115 125 L170 210 L230 95 L285 255" 
          stroke="url(#hd-grad-primary)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M30 215 C 100 215, 125 165, 180 165 C 235 165, 245 230, 300 230" 
          stroke="url(#hd-grad-primary)" stroke-width="18" stroke-linecap="round" />
  </g>

  <!-- Typography -->
  <text x="390" y="195" fill="#ffffff" font-family="'Outfit', 'Montserrat', sans-serif" font-size="132" font-weight="700" letter-spacing="-2">Mountain <tspan fill="url(#hd-grad-text)" font-weight="900">Run</tspan></text>
  
  <g transform="translate(395, 230)">
    <rect x="0" y="15" width="420" height="48" rx="24" fill="rgba(45, 212, 191, 0.15)" stroke="#2dd4bf" stroke-width="2" />
    <text x="210" y="47" text-anchor="middle" fill="#fde047" font-family="'Outfit', 'Montserrat', sans-serif" font-size="22" font-weight="900" letter-spacing="8">RUN WITH PRIDE</text>
  </g>
</svg>"""

new_files = [
    ("mountainrun_tshirt_stacked_chest_light.svg", svg_stacked_light, 3000, 3300),
    ("mountainrun_tshirt_stacked_chest_dark.svg", svg_stacked_dark, 3000, 3300),
    ("mountainrun_tshirt_horizontal_pride_light.svg", svg_horiz_pride_light, 4000, 1080),
    ("mountainrun_tshirt_horizontal_pride_dark.svg", svg_horiz_pride_dark, 4000, 1080),
]

for filename, content, width, height in new_files:
    svg_path = os.path.join(OUTPUT_DIR, filename)
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created Vector SVG: {filename}")

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    html, body {{
      width: {width}px;
      height: {height}px;
      background: transparent;
      overflow: hidden;
    }}
    svg {{
      width: 100%;
      height: 100%;
    }}
  </style>
</head>
<body>
  {content}
</body>
</html>"""
    
    html_path = os.path.join(OUTPUT_DIR, filename.replace(".svg", ".html"))
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    png_filename = filename.replace(".svg", "_4K_TRANSPARENT.png")
    png_path = os.path.join(OUTPUT_DIR, png_filename)

    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--default-background-color=00000000",
        f"--window-size={width},{height}",
        f"--screenshot={png_path}",
        html_path
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(png_path) and os.path.getsize(png_path) > 0:
        print(f"Rendered 4K Transparent PNG: {png_filename} ({width}x{height})")

print("\nALL 'RUN WITH PRIDE' T-SHIRT PRINT FILES GENERATED!")
