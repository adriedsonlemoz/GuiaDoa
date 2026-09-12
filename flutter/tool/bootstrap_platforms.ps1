$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) { throw "Flutter não encontrado no PATH." }

$missing = -not ((Test-Path "android") -and (Test-Path "ios") -and (Test-Path "web"))
if ($missing) {
  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("guiadoa-flutter-" + [guid]::NewGuid().ToString())
  flutter create --platforms=android,ios,web --org com.guiadoa --project-name app (Join-Path $tmp "app")
  foreach ($dir in @("android", "ios", "web")) {
    if (-not (Test-Path $dir)) { Copy-Item -Recurse (Join-Path $tmp "app/$dir") $dir }
  }
  if (-not (Test-Path ".metadata")) { Copy-Item (Join-Path $tmp "app/.metadata") ".metadata" }
  Remove-Item -Recurse -Force $tmp
}

foreach ($density in @("mdpi","hdpi","xhdpi","xxhdpi","xxxhdpi")) {
  $dst = "android/app/src/main/res/mipmap-$density"
  New-Item -ItemType Directory -Force -Path $dst | Out-Null
  Copy-Item "tool/android_adaptive_icon/legacy/mipmap-$density/ic_launcher.png" "$dst/ic_launcher.png" -Force
  Copy-Item "tool/android_adaptive_icon/legacy/mipmap-$density/ic_launcher_round.png" "$dst/ic_launcher_round.png" -Force
}
New-Item -ItemType Directory -Force -Path "android/app/src/main/res/drawable" | Out-Null
New-Item -ItemType Directory -Force -Path "android/app/src/main/res/values" | Out-Null
New-Item -ItemType Directory -Force -Path "android/app/src/main/res/mipmap-anydpi-v26" | Out-Null
Copy-Item "tool/android_adaptive_icon/ic_launcher_foreground.png" "android/app/src/main/res/drawable/ic_launcher_foreground.png" -Force
Set-Content "android/app/src/main/res/values/colors.xml" '<?xml version="1.0" encoding="utf-8"?><resources><color name="ic_launcher_background">#052A24</color></resources>'
Set-Content "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml" '<?xml version="1.0" encoding="utf-8"?><adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@drawable/ic_launcher_foreground"/></adaptive-icon>'
Copy-Item "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml" "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml" -Force

$manifestPath = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $manifestPath) {
  $m = Get-Content $manifestPath -Raw
  if ($m -notmatch 'android.permission.INTERNET') { $m = $m.Replace('<application','    <uses-permission android:name="android.permission.INTERNET" />' + [Environment]::NewLine + '<application') }
  $m = $m.Replace('android:label="app"','android:label="Guia Doa"').Replace('android:label="Guia DOA Flutter"','android:label="Guia Doa"').Replace('android:label="Guia DOA"','android:label="Guia Doa"')
  if ($m -notmatch 'android:roundIcon=') { $m = $m.Replace('android:icon="@mipmap/ic_launcher"','android:icon="@mipmap/ic_launcher"' + [Environment]::NewLine + '        android:roundIcon="@mipmap/ic_launcher_round"') }
  Set-Content $manifestPath $m -NoNewline
}

if ((Test-Path "ios/Runner/Assets.xcassets") -and (Test-Path "tool/ios_appicon/AppIcon.appiconset")) {
  Remove-Item -Recurse -Force "ios/Runner/Assets.xcassets/AppIcon.appiconset" -ErrorAction SilentlyContinue
  Copy-Item -Recurse "tool/ios_appicon/AppIcon.appiconset" "ios/Runner/Assets.xcassets/AppIcon.appiconset"
}
if (Test-Path "ios/Runner/Info.plist") {
  $plist = Get-Content "ios/Runner/Info.plist" -Raw
  $plist = [regex]::Replace($plist, '(<key>CFBundleDisplayName</key>\s*<string>).*?(</string>)', '$1Guia Doa$2')
  $plist = [regex]::Replace($plist, '(<key>CFBundleName</key>\s*<string>).*?(</string>)', '$1Guia Doa$2')
  Set-Content "ios/Runner/Info.plist" $plist -NoNewline
}
if (Test-Path "web/icons") {
  Copy-Item "tool/web_icons/*.png" "web/icons/" -Force
  Copy-Item "tool/web_icons/Icon-192.png" "web/favicon.png" -Force
}
if (Test-Path "web/index.html") {
  $html = Get-Content "web/index.html" -Raw
  $html = [regex]::Replace($html, '<title>.*?</title>', '<title>Guia Doa</title>')
  Set-Content "web/index.html" $html -NoNewline
}

flutter pub get
Write-Host "Plataformas Android, iOS e Web prontas com launcher adaptativo e nome Guia Doa."
