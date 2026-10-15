import http from 'node:http';
import {readFile} from 'node:fs/promises';
const original='A implementação intersetorial da política demanda articulação institucional e mecanismos de governança capazes de promover a interoperabilidade entre diferentes serviços.';
const servers=[];
const page=await readFile(new URL('./page.html',import.meta.url),'utf8');
const styles='body{margin:0;background:#f8fafc;color:#0f172a;font:16px/1.8 system-ui,sans-serif}main{max-width:900px;margin:80px auto;padding:40px;background:white;border-radius:16px}h1{font-size:28px}button,input,select{font:40px serif!important;color:magenta!important;border-radius:0!important}p{margin:24px 0}';
servers.push(http.createServer((req,res)=>{
  if(req.url==='/style.css'){res.setHeader('Content-Type','text/css');res.end(styles);return;}
  if(req.url==='/strict')res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; frame-src 'none'");
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(page.replaceAll('__ORIGINAL__',original));
}).listen(8765,'127.0.0.1'));
servers.push(http.createServer(async(req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url==='/health'){res.end(JSON.stringify({status:'available',ollama:true,model:true}));return;}
  if(req.url!=='/simplify'){res.statusCode=404;res.end('{}');return;}
  let raw='';for await(const chunk of req)raw+=chunk;
  try{const {texto}=JSON.parse(raw);if(texto.includes('[422]')){res.statusCode=422;res.end('{}');return;}
    if(texto.includes('lenta'))await new Promise(resolve=>setTimeout(resolve,1800));
    res.end(JSON.stringify({texto_simplificado:texto.includes('literal')?'<script>window.executed = true</script>':'Os serviços públicos precisam trabalhar juntos.\n\nPara isso, as equipes devem compartilhar informações e combinar como cada serviço vai ajudar as pessoas.'}));
  }catch{res.statusCode=400;res.end('{}');}
}).listen(8000,'localhost'));
const shutdown=()=>{for(const server of servers)server.close();};process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
