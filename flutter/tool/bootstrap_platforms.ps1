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


$manifestPath = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $manifestPath) {
  $manifest = Get-Content $manifestPath -Raw
  if ($manifest -notmatch 'android.permission.INTERNET') {
    $manifest = $manifest.Replace('<application', '    <uses-permission android:name="android.permission.INTERNET" />' + [Environment]::NewLine + '<application')
  }
  $manifest = $manifest.Replace('android:label="app"', 'android:label="Guia DOA Flutter"')
  Set-Content -Path $manifestPath -Value $manifest -NoNewline
  if ((Get-Content $manifestPath -Raw) -notmatch 'android.permission.INTERNET') {
    throw "Permissão INTERNET não foi aplicada ao AndroidManifest.xml"
  }
}

if ((Test-Path "ios/Runner/Assets.xcassets") -and (Test-Path "tool/ios_appicon/AppIcon.appiconset")) {
  Remove-Item -Recurse -Force "ios/Runner/Assets.xcassets/AppIcon.appiconset" -ErrorAction SilentlyContinue
  Copy-Item -Recurse "tool/ios_appicon/AppIcon.appiconset" "ios/Runner/Assets.xcassets/AppIcon.appiconset"
}
if (Test-Path "web/icons") {
  Copy-Item "tool/web_icons/*.png" "web/icons/" -Force
  Copy-Item "assets/img/app-icon.png" "web/favicon.png" -Force
}

flutter pub get
Write-Host "Plataformas Android, iOS e Web prontas."
