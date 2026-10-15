import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../avatar/',import.meta.url);
const upstream=JSON.parse(await readFile(new URL('UPSTREAM.json',base),'utf8'));
for(const {file,sha256} of upstream.files){
  const data=await readFile(new URL(file,base));
  if(createHash('sha256').update(data).digest('hex')!==sha256)throw new Error(`Recurso VLibras alterado: ${file}`);
}
for(const [file,signature] of [['OpenDyslexic-Regular.woff','wOFF'],['OpenDyslexic-Bold.woff','wOFF']]){
  const data=await readFile(new URL(`../assets/fonts/${file}`,import.meta.url));
  if(data.subarray(0,4).toString()!==signature)throw new Error(`Fonte inválida: ${file}`);
}
console.log(`Recursos locais conferidos; VLibras ${upstream.commit}.`);
