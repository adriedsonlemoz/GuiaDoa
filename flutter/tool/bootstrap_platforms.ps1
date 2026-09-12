$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
  throw "Flutter não encontrado no PATH."
}

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

if ((Test-Path "ios/Runner/Assets.xcassets") -and (Test-Path "tool/ios_appicon/AppIcon.appiconset")) {
  Remove-Item -Recurse -Force "ios/Runner/Assets.xcassets/AppIcon.appiconset" -ErrorAction SilentlyContinue
  Copy-Item -Recurse "tool/ios_appicon/AppIcon.appiconset" "ios/Runner/Assets.xcassets/AppIcon.appiconset"
}
if (Test-Path "web/icons") {
  Copy-Item "tool/web_icons/*.png" "web/icons/" -Force
  Copy-Item "assets/img/app-icon.png" "web/favicon.png" -Force
}


# Nome público consistente durante a alpha para não confundir com o app legado.
if (Test-Path "android/app/src/main/AndroidManifest.xml") {
  $manifest = Get-Content "android/app/src/main/AndroidManifest.xml" -Raw
  $manifest = $manifest.Replace('android:label="app"', 'android:label="Guia DOA Flutter"').Replace('android:label="Guia DOA"', 'android:label="Guia DOA Flutter"')
  Set-Content "android/app/src/main/AndroidManifest.xml" $manifest -NoNewline
}
if (Test-Path "ios/Runner/Info.plist") {
  $plist = Get-Content "ios/Runner/Info.plist" -Raw
  $plist = $plist.Replace("<key>CFBundleDisplayName</key>`n`t<string>App</string>", "<key>CFBundleDisplayName</key>`n`t<string>Guia DOA Flutter</string>")
  $plist = $plist.Replace("<key>CFBundleName</key>`n`t<string>app</string>", "<key>CFBundleName</key>`n`t<string>Guia DOA Flutter</string>")
  Set-Content "ios/Runner/Info.plist" $plist -NoNewline
}
if (Test-Path "web/index.html") {
  $index = Get-Content "web/index.html" -Raw
  $index = $index.Replace('<title>app</title>', '<title>Guia DOA Flutter</title>').Replace('<title>Guia DOA</title>', '<title>Guia DOA Flutter</title>')
  Set-Content "web/index.html" $index -NoNewline
}
if (Test-Path "web/manifest.json") {
  $webManifest = Get-Content "web/manifest.json" -Raw
  $webManifest = $webManifest.Replace('"name": "app"', '"name": "Guia DOA Flutter"').Replace('"short_name": "app"', '"short_name": "Guia DOA Flutter"')
  $webManifest = $webManifest.Replace('"name": "Guia DOA"', '"name": "Guia DOA Flutter"').Replace('"short_name": "Guia DOA"', '"short_name": "Guia DOA Flutter"')
  Set-Content "web/manifest.json" $webManifest -NoNewline
}

flutter pub get
Write-Host "Plataformas Android, iOS e Web prontas."
