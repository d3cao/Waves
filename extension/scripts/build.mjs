import {build} from 'esbuild';
import {mkdir, cp, readFile, writeFile, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const outdir = path.join(root, 'dist');
await rm(outdir,{recursive:true,force:true});
await mkdir(outdir, {recursive:true});
for (const name of ['manifest.json', 'popup.html', 'assets', 'avatar', 'THIRD_PARTY.md']) {
  await cp(path.join(root,name),path.join(outdir,name),{recursive:true});
}
await cp(path.join(root,'../LICENSE'),path.join(outdir,'LICENSE'));
await build({entryPoints:[path.join(root,'src/content/index.js')],bundle:true,format:'iife',loader:{'.css':'text'},target:'chrome120',outfile:path.join(outdir,'content.js')});
await build({entryPoints:{popup:path.join(root,'src/popup/index.js'),background:path.join(root,'src/background/index.js')},bundle:true,format:'esm',target:'chrome120',outdir});
const css = await readFile(path.join(root,'src/shared/styles.css'),'utf8');
await writeFile(path.join(outdir,'popup.css'),css.replaceAll('__ASSET_BASE__','assets/'));
console.log(`Extensão gerada em ${outdir}`);
