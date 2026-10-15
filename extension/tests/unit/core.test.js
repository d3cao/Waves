import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePreferences,DEFAULTS} from '../../src/shared/preferences.js';
import {toolbarPosition,widgetBounds} from '../../src/shared/geometry.js';
import {simplify,translate,fetchChecked} from '../../src/shared/api.js';
test('preferências corrompidas voltam a valores seguros',()=>{
  assert.deepEqual(normalizePreferences({enabled:'false',widgetPosition:'elsewhere',avatarSpeed:3,dyslexiaMode:1,simplifiedFontSize:25}),DEFAULTS);
  assert.equal(normalizePreferences({enabled:false,simplifiedFontSize:24}).enabled,false);
  assert.deepEqual(normalizePreferences(null),DEFAULTS);
});
test('gatilho muda para baixo e permanece dentro da viewport',()=>{
  assert.deepEqual(toolbarPosition({left:4,top:10,bottom:30,width:30},300,64,{width:375,height:667}),{left:16,top:38});
  const b=toolbarPosition({left:370,top:660,bottom:665,width:10},300,64,{width:375,height:667});assert.equal(b.left,59);assert.ok(b.top+64<=651);
});
test('janela grande é recuperável em viewport estreita',()=>{
  const b=widgetBounds({left:1000,top:800,width:360,height:440},{width:375,height:400});assert.deepEqual(b,{left:16,top:16,width:343,height:368});
});
test('simplificação mantém contrato, unicode e resposta literal',async()=>{
  let called=false;
  const result=await simplify('Um texto com mais de dez caracteres.',async(url,options)=>{
    called=true;assert.equal(url,'http://localhost:8000/simplify');assert.deepEqual(JSON.parse(options.body),{texto:'Um texto com mais de dez caracteres.'});return new Response(JSON.stringify({texto_simplificado:'<script>literal</script>'}));
  });assert.ok(called);assert.equal(result,'<script>literal</script>');
  await assert.rejects(()=>simplify('123456789'),/10 caracteres/);
  await assert.rejects(()=>simplify('Texto com dez caracteres.',async()=>new Response('{}')),/inválida/);
});
test('erros de validação, rede e timeout não viram sucesso',async()=>{
  await assert.rejects(()=>simplify('Texto com dez caracteres.',async()=>new Response('{}',{status:422})),/processar/);
  await assert.rejects(()=>simplify('Texto com dez caracteres.',async()=>new Response('{}',{status:502})),/502/);
  await assert.rejects(()=>fetchChecked('http://localhost',{},1,(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError'))))),/demorou/);
});
test('tradução aceita os formatos oficiais e rejeita falhas',async()=>{
  for(const payload of ['OBRIGADO','{"traducao":"OBRIGADO"}','"OBRIGADO"'])assert.equal(await translate('Obrigado',async()=>new Response(payload)),'OBRIGADO');
  for(const payload of ['{}','<html>erro</html>',''])await assert.rejects(()=>translate('Obrigado',async()=>new Response(payload)),/inválida|válida/);
});
