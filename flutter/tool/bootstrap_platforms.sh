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
  # project-name=app + org=com.guiadoa preserva o identificador atual com.guiadoa.app.
  flutter create --platforms=android,ios,web --org com.guiadoa --project-name app "$tmp/app"
  for dir in android ios web; do
    [[ -d "$dir" ]] || cp -R "$tmp/app/$dir" "$dir"
  done
  [[ -f .metadata ]] || cp "$tmp/app/.metadata" .metadata
fi

# Reaplica a identidade visual existente nas plataformas geradas.
if [[ -d ../mobile/android-icons && -d android/app/src/main/res ]]; then
  for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
    src="../mobile/android-icons/mipmap-$density"
    dst="android/app/src/main/res/mipmap-$density"
    if [[ -d "$src" && -d "$dst" ]]; then
      cp "$src"/ic_launcher*.png "$dst"/ 2>/dev/null || true
    fi
  done
fi

if [[ -d ios/Runner/Assets.xcassets ]]; then
  rm -rf ios/Runner/Assets.xcassets/AppIcon.appiconset
  cp -R tool/ios_appicon/AppIcon.appiconset ios/Runner/Assets.xcassets/AppIcon.appiconset
fi

if [[ -d web/icons ]]; then
  cp tool/web_icons/*.png web/icons/
  cp assets/img/app-icon.png web/favicon.png
fi

# Nome público consistente.
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
s=s.replace('android:label="app"', 'android:label="Guia DOA Flutter"')
p.write_text(s)
PYANDROID
  grep -q 'android.permission.INTERNET' android/app/src/main/AndroidManifest.xml
fi

if [[ -f ios/Runner/Info.plist ]]; then
  python3 - <<'PY'
from pathlib import Path
p=Path('ios/Runner/Info.plist')
s=p.read_text()
s=s.replace('<key>CFBundleDisplayName</key>\n\t<string>App</string>', '<key>CFBundleDisplayName</key>\n\t<string>Guia DOA</string>')
s=s.replace('<key>CFBundleName</key>\n\t<string>app</string>', '<key>CFBundleName</key>\n\t<string>Guia DOA</string>')
p.write_text(s)
PY
fi

if [[ -f web/index.html ]]; then
  python3 - <<'PY'
from pathlib import Path
p=Path('web/index.html')
s=p.read_text().replace('<title>app</title>', '<title>Guia DOA</title>')
p.write_text(s)
manifest=Path('web/manifest.json')
if manifest.exists():
    t=manifest.read_text().replace('"name": "app"', '"name": "Guia DOA"').replace('"short_name": "app"', '"short_name": "Guia DOA"')
    manifest.write_text(t)
PY
fi

flutter pub get

echo "Plataformas Android, iOS e Web prontas."
