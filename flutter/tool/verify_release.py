#!/usr/bin/env python3
"""Offline packaging gate: release metadata, translation coverage, and asset references."""
from pathlib import Path
import json
import re
import struct
from collections import Counter

root = Path(__file__).resolve().parents[2]
flutter = root / 'flutter'
release = json.loads((flutter / 'release.json').read_text())
version, code = re.search(r'^version:\s*([^+]+)\+(\d+)', (flutter / 'pubspec.yaml').read_text(), re.M).groups()
assert release['version'] == version
assert release['versionCode'] == int(code)
assert json.loads((root / 'mobile/android-version.json').read_text())['versionCode'] == int(code)
manager = json.loads((root / 'github-manager.json').read_text())
assert manager['projectName'] == manager['displayName'] == 'Guia Doa'
assert manager['versionName'] == version
assert manager['versionCode'] == int(code)
assert manager['applicationId'] == manager['namespace'] == 'com.guiadoa.app'
assert manager['language'] == 'Dart' and manager['type'] == 'Flutter'
for file in ['package.json', 'package-lock.json', 'api/package.json', 'api/package-lock.json']:
    assert json.loads((root / file).read_text())['version'] == version, file
config = (flutter / 'lib/core/config/app_config.dart').read_text()
assert f"Flutter {release['channel']}" in config
assert f"{version} · Flutter {release['channel']}" in config
assert release['apkName'] == f"GuiaDOA-FLUTTER-{version.removeprefix('1.0.0-')}-{release['channel']}.apk"
strings = (flutter / 'lib/core/i18n/app_strings.dart').read_text()
pt, en = strings.split('static const Map<String, String> _en', 1)
references = set()
for p in (flutter / 'lib').rglob('*.dart'):
    if p.name == 'app_strings.dart': continue
    for key in re.findall(r"\.t\('([^']+)'", p.read_text()):
        if '$' not in key: references.add(key)
for lang, source in [('pt', pt), ('en', en)]:
    keys = re.findall(r"^    '([^']+)':", source, re.M)
    duplicates = [k for k,v in Counter(keys).items() if v > 1]
    assert not duplicates, (lang, 'duplicates', duplicates)
    missing = references - set(keys)
    assert not missing, (lang, 'missing', missing)
    for key in ['torneios', 'tropas', 'dragoes', 'edificios', 'itens', 'pesquisas', 'ilhas', 'dicas', 'campanha', 'niveis', 'eventos', 'extras']:
        assert f'tool.{key}' in keys and f'tool.{key}.sub' in keys, key
for p in (flutter / 'lib').rglob('*.dart'):
    for asset in re.findall(r"(?:Image\.asset|AssetImage)\('([^'$]+)'", p.read_text()):
        assert (flutter / asset).is_file(), (p, asset)
for name in ['torneios','tropas','dragoes','edificios','itens','pesquisas','ilhas','dicas','crest','hero']:
    p = flutter / f'assets/ui/{name}.png'
    data = p.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', p
    width, height = struct.unpack('>II', data[16:24])
    if name == 'hero':
        assert width >= 1200 and height >= 400, p
    elif name == 'crest':
        assert min(width, height) >= 512, p
    else:
        assert min(width, height) >= 320, p
    if name != 'hero': assert data[25] == 6, f'{name}: expected RGBA PNG'
for density, size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    for name in ['ic_launcher','ic_launcher_round']:
        data = (flutter / f'tool/android_adaptive_icon/legacy/mipmap-{density}/{name}.png').read_bytes()
        assert struct.unpack('>II',data[16:24]) == (size,size)
print(f'OK: {version} / {release["channel"]} / {code}; metadata, translations, assets and launcher sizes verified.')
