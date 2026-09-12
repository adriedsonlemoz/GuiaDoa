#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter não encontrado no PATH." >&2
  exit 1
fi

missing=0
for dir in android ios web; do
  [[ -d "$dir" ]] || missing=1
done

if [[ "$missing" -eq 1 ]]; then
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  flutter create --platforms=android,ios,web --org com.guiadoa --project-name app "$tmp/app"
  for dir in android ios web; do
    [[ -d "$dir" ]] || cp -R "$tmp/app/$dir" "$dir"
  done
  [[ -f .metadata ]] || cp "$tmp/app/.metadata" .metadata
fi

# Launcher Android: ícone adaptativo em Android 8+ e fallback circular nas versões antigas.
if [[ -d android/app/src/main/res ]]; then
  for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
    src="tool/android_adaptive_icon/legacy/mipmap-$density"
    dst="android/app/src/main/res/mipmap-$density"
    mkdir -p "$dst"
    cp "$src/ic_launcher.png" "$dst/ic_launcher.png"
    cp "$src/ic_launcher_round.png" "$dst/ic_launcher_round.png"
  done
  mkdir -p android/app/src/main/res/drawable android/app/src/main/res/values android/app/src/main/res/mipmap-anydpi-v26
  cp tool/android_adaptive_icon/ic_launcher_foreground.png android/app/src/main/res/drawable/ic_launcher_foreground.png
  cat > android/app/src/main/res/values/colors.xml <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#052A24</color>
</resources>
XML
  cat > android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
XML
  cp android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml
fi

if [[ -d ios/Runner/Assets.xcassets ]]; then
  rm -rf ios/Runner/Assets.xcassets/AppIcon.appiconset
  cp -R tool/ios_appicon/AppIcon.appiconset ios/Runner/Assets.xcassets/AppIcon.appiconset
fi

if [[ -d web/icons ]]; then
  cp tool/web_icons/*.png web/icons/
  cp tool/web_icons/Icon-192.png web/favicon.png
fi

if [[ -f android/app/src/main/AndroidManifest.xml ]]; then
  python3 - <<'PYANDROID'
from pathlib import Path
p=Path('android/app/src/main/AndroidManifest.xml')
s=p.read_text()
if 'android.permission.INTERNET' not in s:
    marker='<application'
    permission='    <uses-permission android:name="android.permission.INTERNET" />\n'
    if marker not in s:
        raise SystemExit('AndroidManifest.xml sem <application>')
    s=s.replace(marker, permission + marker, 1)
for old in ('android:label="app"','android:label="Guia DOA Flutter"','android:label="Guia DOA"'):
    s=s.replace(old, 'android:label="Guia Doa"')
if 'android:icon=' not in s:
    s=s.replace('<application', '<application\n        android:icon="@mipmap/ic_launcher"\n        android:roundIcon="@mipmap/ic_launcher_round"', 1)
elif 'android:roundIcon=' not in s:
    s=s.replace('android:icon="@mipmap/ic_launcher"', 'android:icon="@mipmap/ic_launcher"\n        android:roundIcon="@mipmap/ic_launcher_round"')
p.write_text(s)
PYANDROID
  grep -q 'android.permission.INTERNET' android/app/src/main/AndroidManifest.xml
  grep -q 'android:label="Guia Doa"' android/app/src/main/AndroidManifest.xml
fi

if [[ -f ios/Runner/Info.plist ]]; then
  python3 - <<'PYIOS'
from pathlib import Path
p=Path('ios/Runner/Info.plist')
s=p.read_text()
import re
s=re.sub(r'(<key>CFBundleDisplayName</key>\s*<string>).*?(</string>)', r'\1Guia Doa\2', s)
s=re.sub(r'(<key>CFBundleName</key>\s*<string>).*?(</string>)', r'\1Guia Doa\2', s)
p.write_text(s)
PYIOS
fi

if [[ -f web/index.html ]]; then
  python3 - <<'PYWEB'
from pathlib import Path
import json, re
p=Path('web/index.html')
s=p.read_text()
s=re.sub(r'<title>.*?</title>', '<title>Guia Doa</title>', s, count=1, flags=re.S)
p.write_text(s)
manifest=Path('web/manifest.json')
if manifest.exists():
    data=json.loads(manifest.read_text())
    data['name']='Guia Doa'; data['short_name']='Guia Doa'
    manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
PYWEB
fi

flutter pub get

echo "Plataformas Android, iOS e Web prontas com launcher adaptativo e nome Guia Doa."
