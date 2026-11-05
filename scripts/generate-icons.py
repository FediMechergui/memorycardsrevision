"""Render the code-native Mémora monogram at launcher/PWA sizes."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
def icon(size, path, rounded=True):
    scale = 4
    image = Image.new('RGBA', (size * scale, size * scale), '#194e3e')
    draw = ImageDraw.Draw(image)
    unit = size * scale / 64
    points = [(19, 42), (19, 23), (26, 33), (32, 23), (38, 33), (45, 23), (45, 42)]
    coords = [(int(x * unit), int(y * unit)) for x, y in points]
    width = max(1, int(5 * unit))
    draw.line(coords, fill='#daf39a', width=width, joint='curve')
    for x, y in coords:
        radius = width / 2
        draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill='#daf39a')
    path.parent.mkdir(parents=True, exist_ok=True)
    image.resize((size, size), Image.Resampling.LANCZOS).save(path)

for size in [192, 512]:
    icon(size, ROOT / 'public' / f'icon-{size}.png')
android = ROOT / 'android/app/src/main/res'
if android.exists():
    for density, size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
        for name in ['ic_launcher', 'ic_launcher_round']:
            icon(size, android / f'mipmap-{density}' / f'{name}.png')
    (android / 'drawable').mkdir(exist_ok=True)
    (android / 'drawable/ic_launcher_foreground.xml').write_text('''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <path android:pathData="M0,0h108v108h-108z" android:fillColor="#194e3e" />
  <path android:pathData="M32,70L32,39L44,55L54,39L64,55L76,39L76,70" android:fillColor="@android:color/transparent" android:strokeColor="#daf39a" android:strokeWidth="8" android:strokeLineCap="round" android:strokeLineJoin="round" />
</vector>''', encoding='utf-8')
print('PWA and available Android icons generated.')
if android.exists():
    override = android / 'drawable-v24/ic_launcher_foreground.xml'
    override.parent.mkdir(exist_ok=True)
    override.write_text((android / 'drawable/ic_launcher_foreground.xml').read_text(encoding='utf-8'), encoding='utf-8')
