import os
import sys
import subprocess
import time

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = os.path.join(os.getcwd(), "tshirt_print_pack")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── 1. HORIZONTAL LOGO FOR LIGHT T-SHIRTS (WHITE/GREY T-SHIRTS) ───
svg_horizontal_light = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1250 320" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="mr-grad-primary" x1="40" y1="260" x2="260" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>

    <linearGradient id="mr-grad-fill" x1="40" y1="260" x2="260" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f766e" stop-opacity="0.15"/>
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.05"/>
    </linearGradient>

    <linearGradient id="mr-grad-sun" x1="180" y1="60" x2="250" y2="130" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <linearGradient id="mr-grad-text" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>

  <g transform="translate(40, 20)">
    <circle cx="210" cy="95" r="38" fill="url(#mr-grad-sun)" />
    <path d="M40 230 L105 110 L155 190 L210 85 L260 230 Z" fill="url(#mr-grad-fill)" />
    <path d="M40 230 L105 110 L155 190 L210 85 L260 230" 
          stroke="url(#mr-grad-primary)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M25 195 C 90 195, 115 150, 165 150 C 215 150, 225 210, 275 210" 
          stroke="url(#mr-grad-primary)" stroke-width="16" stroke-linecap="round" />
  </g>

  <!-- Typography -->
  <text x="360" y="185" fill="#0f172a" font-family="'Outfit', 'Montserrat', 'Inter', sans-serif" font-size="124" font-weight="600" letter-spacing="-2">Mountain <tspan fill="url(#mr-grad-text)" font-weight="900">Run</tspan></text>
  <text x="365" y="240" fill="#64748b" font-family="'Outfit', 'Montserrat', 'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="12">VIRTUAL MARATHON &amp; RUNNING</text>
</svg>"""

# ─── 2. HORIZONTAL LOGO FOR DARK T-SHIRTS (BLACK/NAVY/DARK T-SHIRTS) ───
svg_horizontal_dark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1250 320" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="mr-grad-primary-dark" x1="40" y1="260" x2="260" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>

    <linearGradient id="mr-grad-fill-dark" x1="40" y1="260" x2="260" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.10"/>
    </linearGradient>

    <linearGradient id="mr-grad-sun-dark" x1="180" y1="60" x2="250" y2="130" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="60%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <linearGradient id="mr-grad-text-dark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#a5b4fc"/>
    </linearGradient>
  </defs>

  <g transform="translate(40, 20)">
    <circle cx="210" cy="95" r="38" fill="url(#mr-grad-sun-dark)" />
    <path d="M40 230 L105 110 L155 190 L210 85 L260 230 Z" fill="url(#mr-grad-fill-dark)" />
    <path d="M40 230 L105 110 L155 190 L210 85 L260 230" 
          stroke="url(#mr-grad-primary-dark)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M25 195 C 90 195, 115 150, 165 150 C 215 150, 225 210, 275 210" 
          stroke="url(#mr-grad-primary-dark)" stroke-width="16" stroke-linecap="round" />
  </g>

  <text x="360" y="185" fill="#ffffff" font-family="'Outfit', 'Montserrat', 'Inter', sans-serif" font-size="124" font-weight="600" letter-spacing="-2">Mountain <tspan fill="url(#mr-grad-text-dark)" font-weight="900">Run</tspan></text>
  <text x="365" y="240" fill="#94a3b8" font-family="'Outfit', 'Montserrat', 'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="12">VIRTUAL MARATHON &amp; RUNNING</text>
</svg>"""

# ─── 3. CENTER CHEST EMBLEM BADGE (FOR LIGHT T-SHIRTS) ───
svg_chest_badge_light = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="badge-ring" x1="0" y1="0" x2="1000" y2="1000" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="40%" stop-color="#10b981"/>
      <stop offset="80%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#c9a227"/>
    </linearGradient>

    <linearGradient id="badge-sun" x1="580" y1="280" x2="690" y2="390" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <linearGradient id="badge-mountain" x1="300" y1="620" x2="700" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>

    <linearGradient id="badge-mountain-fill" x1="300" y1="620" x2="700" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f766e" stop-opacity="0.18"/>
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.06"/>
    </linearGradient>
  </defs>

  <circle cx="500" cy="500" r="460" stroke="url(#badge-ring)" stroke-width="14" />
  <circle cx="500" cy="500" r="435" stroke="url(#badge-ring)" stroke-width="3" stroke-dasharray="12 12" />

  <g transform="translate(100, 20)">
    <circle cx="520" cy="350" r="60" fill="url(#badge-sun)" />
    <path d="M260 550 L360 370 L440 480 L520 330 L600 550 Z" fill="url(#badge-mountain-fill)" />
    <path d="M260 550 L360 370 L440 480 L520 330 L600 550" 
          stroke="url(#badge-mountain)" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M230 500 C 330 500, 380 430, 450 430 C 530 430, 550 520, 630 520" 
          stroke="url(#badge-mountain)" stroke-width="24" stroke-linecap="round" />
  </g>

  <text x="500" y="690" text-anchor="middle" fill="#0f172a" font-family="'Outfit', 'Montserrat', sans-serif" font-size="76" font-weight="900" letter-spacing="14">MOUNTAIN RUN</text>
  <line x1="280" y1="730" x2="720" y2="730" stroke="#0d9488" stroke-width="4" stroke-linecap="round" />
  <text x="500" y="780" text-anchor="middle" fill="#0d9488" font-family="'Outfit', 'Montserrat', sans-serif" font-size="28" font-weight="800" letter-spacing="10">RUN ANYWHERE · ANYTIME</text>
  <text x="500" y="825" text-anchor="middle" fill="#64748b" font-family="'Outfit', 'Montserrat', sans-serif" font-size="22" font-weight="700" letter-spacing="6">OFFICIAL ATHLETIC APPAREL</text>
</svg>"""

# ─── 4. CENTER CHEST EMBLEM BADGE (FOR DARK T-SHIRTS) ───
svg_chest_badge_dark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="badge-ring-dark" x1="0" y1="0" x2="1000" y2="1000" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="40%" stop-color="#34d399"/>
      <stop offset="80%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>

    <linearGradient id="badge-sun-dark" x1="580" y1="280" x2="690" y2="390" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <linearGradient id="badge-mountain-dark" x1="300" y1="620" x2="700" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>

    <linearGradient id="badge-mountain-fill-dark" x1="300" y1="620" x2="700" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.10"/>
    </linearGradient>
  </defs>

  <circle cx="500" cy="500" r="460" stroke="url(#badge-ring-dark)" stroke-width="14" />
  <circle cx="500" cy="500" r="435" stroke="url(#badge-ring-dark)" stroke-width="3" stroke-dasharray="12 12" />

  <g transform="translate(100, 20)">
    <circle cx="520" cy="350" r="60" fill="url(#badge-sun-dark)" />
    <path d="M260 550 L360 370 L440 480 L520 330 L600 550 Z" fill="url(#badge-mountain-fill-dark)" />
    <path d="M260 550 L360 370 L440 480 L520 330 L600 550" 
          stroke="url(#badge-mountain-dark)" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M230 500 C 330 500, 380 430, 450 430 C 530 430, 550 520, 630 520" 
          stroke="url(#badge-mountain-dark)" stroke-width="24" stroke-linecap="round" />
  </g>

  <text x="500" y="690" text-anchor="middle" fill="#ffffff" font-family="'Outfit', 'Montserrat', sans-serif" font-size="76" font-weight="900" letter-spacing="14">MOUNTAIN RUN</text>
  <line x1="280" y1="730" x2="720" y2="730" stroke="#2dd4bf" stroke-width="4" stroke-linecap="round" />
  <text x="500" y="780" text-anchor="middle" fill="#2dd4bf" font-family="'Outfit', 'Montserrat', sans-serif" font-size="28" font-weight="800" letter-spacing="10">RUN ANYWHERE · ANYTIME</text>
  <text x="500" y="825" text-anchor="middle" fill="#94a3b8" font-family="'Outfit', 'Montserrat', sans-serif" font-size="22" font-weight="700" letter-spacing="6">OFFICIAL ATHLETIC APPAREL</text>
</svg>"""

# ─── 5. PURE ICON LOGO MARK (CHEST POCKET / SLEEVE) ───
svg_icon_mark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="icon-grad-primary" x1="40" y1="460" x2="460" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="icon-grad-fill" x1="40" y1="460" x2="460" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d9488" stop-opacity="0.18"/>
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="icon-grad-sun" x1="290" y1="90" x2="420" y2="220" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>

  <g transform="translate(10, 10)">
    <circle cx="350" cy="170" r="65" fill="url(#icon-grad-sun)" />
    <path d="M60 400 L170 190 L260 330 L350 150 L440 400 Z" fill="url(#icon-grad-fill)" />
    <path d="M60 400 L170 190 L260 330 L350 150 L440 400" 
          stroke="url(#icon-grad-primary)" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M40 340 C 145 340, 190 260, 270 260 C 355 260, 375 360, 460 360" 
          stroke="url(#icon-grad-primary)" stroke-width="26" stroke-linecap="round" />
  </g>
</svg>"""

files_to_generate = [
    ("mountainrun_logo_light_tshirt.svg", svg_horizontal_light, 3800, 980),
    ("mountainrun_logo_dark_tshirt.svg", svg_horizontal_dark, 3800, 980),
    ("mountainrun_chest_badge_light.svg", svg_chest_badge_light, 3000, 3000),
    ("mountainrun_chest_badge_dark.svg", svg_chest_badge_dark, 3000, 3000),
    ("mountainrun_icon_mark.svg", svg_icon_mark, 3000, 3000),
]

for filename, content, width, height in files_to_generate:
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

print("\nALL HIGH-RES T-SHIRT PRINT FILES CREATED IN tshirt_print_pack/")
