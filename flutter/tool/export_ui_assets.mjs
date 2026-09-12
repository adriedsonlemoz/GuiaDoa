// Run from flutter/ after installing sharp. Generated art is only resampled for platform sizes.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', {paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || process.cwd()]}));
const crest = 'assets/ui/crest.png';
async function exportIcon(file, size, {transparent = false, round = false, fraction = .8} = {}) {
  await fs.mkdir(path.dirname(file), {recursive:true});
  const mark = await sharp(crest).resize(Math.round(size*fraction), Math.round(size*fraction), {fit:'contain', background:'#00000000'}).png().toBuffer();
  const layers = [{input:mark, gravity:'centre'}];
  if(round) layers.push({input:Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`), blend:'dest-in'});
  await sharp({create:{width:size,height:size,channels:4,background:transparent?'#00000000':'#052A24'}}).composite(layers).png().toFile(file);
}
for(const [density,size] of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})) {
  for(const [name,round] of [['ic_launcher',false],['ic_launcher_round',true]])
    await exportIcon(`tool/android_adaptive_icon/legacy/mipmap-${density}/${name}.png`,size,{round,fraction:.84});
}
await exportIcon('tool/android_adaptive_icon/ic_launcher_foreground.png',432,{transparent:true,fraction:.60});
for(const item of JSON.parse(await fs.readFile('tool/ios_appicon/AppIcon.appiconset/Contents.json','utf8')).images)
  await exportIcon(`tool/ios_appicon/AppIcon.appiconset/${item.filename}`,Math.round(parseFloat(item.size)*parseFloat(item.scale)));
for(const size of [192,512]) {
  await exportIcon(`tool/web_icons/Icon-${size}.png`,size);
  await exportIcon(`tool/web_icons/Icon-maskable-${size}.png`,size,{fraction:.60});
}
await exportIcon('assets/img/app-icon.png',512);
await exportIcon('assets/public/img/app-icon.png',512);
for(const size of [192,512]) await exportIcon(`assets/public/img/icons/icon-${size}.png`,size);
await exportIcon('assets/public/img/icons/icon-maskable-512.png',512,{fraction:.60});
await exportIcon('assets/public/img/favicon.png',64);
await fs.mkdir('tool/ui_masters',{recursive:true});
for(const name of ['torneios','tropas','dragoes','edificios','itens','pesquisas','ilhas','dicas']) {
  const source=`assets/ui/${name}.png`, master=`tool/ui_masters/${name}.png`;
  try {await fs.access(master);} catch {await fs.copyFile(source,master);}
  await sharp(master).resize(512,512,{fit:'contain',background:'#00000000'}).png().toFile(source);
}
console.log('Android, iOS, Web e miniaturas exportados.');
