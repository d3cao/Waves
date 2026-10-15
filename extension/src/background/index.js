import {normalizePreferences,getPreferences} from '../shared/preferences.js';
import {simplify,translate,fetchChecked} from '../shared/api.js';
let preferenceQueue=Promise.resolve();
chrome.runtime.onInstalled.addListener(()=>{preferenceQueue=preferenceQueue.then(async()=>{await chrome.storage.local.set({preferences:await getPreferences()});});});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(sender.id!==chrome.runtime.id) return false;
  const isPopup=sender.url===chrome.runtime.getURL('popup.html');
  const isContent=sender.tab&&/^https?:\/\//.test(sender.url||'')&&sender.frameId===0;
  if(!isPopup&&!isContent) return false;
  const run=async()=>{
    if(message?.type==='preferences:update'&&isPopup) {
      const pending=preferenceQueue.then(async()=>{
        const preferences=normalizePreferences({...await getPreferences(),...message.patch});
        await chrome.storage.local.set({preferences});return preferences;
      });
      preferenceQueue=pending.catch(()=>{});return pending;
    }
    if(message?.type==='health'&&isPopup) {
      try {const response=await fetchChecked('http://localhost:8000/health',{},3500);const data=await response.json();return {available:data.status==='available'&&data.ollama===true&&data.model===true};}
      catch{return {available:false};}
    }
    if(!isContent) throw new Error('Ação indisponível neste contexto.');
    if(!(await getPreferences()).enabled) throw new Error('O Waves está desativado.');
    if(message?.type==='simplify') return {text:await simplify(message.text)};
    if(message?.type==='translate') return {gloss:await translate(message.text)};
    throw new Error('Mensagem desconhecida.');
  };
  run().then(data=>reply({ok:true,data})).catch(error=>reply({ok:false,error:error.message||'Não foi possível conectar ao serviço.'}));
  return true;
});
