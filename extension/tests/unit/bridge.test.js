import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../avatar/bridge.js',import.meta.url),'utf8');
test('ponte Unity limita comandos à janela pai e ao canal da instância',()=>{
  const calls=[],events=[],listeners={};
  const parent={postMessage:message=>events.push(message)};
  const context={location:{hash:'#instance-id'},parent,setTimeout:callback=>callback(),UnityLoader:{instantiate:()=>({SendMessage:(...args)=>calls.push(args)})},addEventListener:(name,handler)=>{listeners[name]=handler;}};
  context.window=context;
  vm.runInNewContext(source,context);
  const command=(source,channel,command,value)=>listeners.message({source,data:{type:'waves:avatar:command',channel,command,value}});
  command(parent,'instance-id','play','OLÁ');assert.equal(calls.length,0,'ignora comandos antes da prontidão');
  context.onLoadPlayer();assert.equal(events.at(-1).event,'ready');calls.length=0;
  command({},'instance-id','play','OLÁ');command(parent,'old-instance','play','OLÁ');command(parent,'instance-id','arbitrary','OLÁ');command(parent,'instance-id','speed',10);assert.equal(calls.length,0);
  command(parent,'instance-id','play','OLÁ');command(parent,'instance-id','pause');command(parent,'instance-id','speed',1.5);
  assert.deepEqual(calls,[['PlayerManager','playNow','OLÁ'],['PlayerManager','setPauseState',1],['PlayerManager','setSlider',1.5]]);
  context.CounterGloss(2,10);assert.equal(events.at(-1).event,'gloss');assert.equal(events.at(-1).channel,'instance-id');
});
