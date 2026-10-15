import css from '../shared/styles.css';
import {el,button} from '../shared/dom.js';
import {getPreferences,applyPreferences} from '../shared/preferences.js';
import {toolbarPosition} from '../shared/geometry.js';
import {SimplificationDialog} from './modal.js';
import {AvatarWidget} from './widget.js';

async function start(){
  if(document.querySelector('#waves-extension-root'))return;
  let prefs=await getPreferences();let generation=0;let toolbar=null;let selected=null;let timer;
  const host=el('div',{id:'waves-extension-root'});
  for(const [key,value] of Object.entries({all:'initial',position:'fixed',top:'0',left:'0',width:'0',height:'0','z-index':'2147483647','pointer-events':'none'}))host.style.setProperty(key,value,'important');
  const shadow=host.attachShadow({mode:'open'});
  const sheet=el('style',{text:css.replaceAll('__ASSET_BASE__',chrome.runtime.getURL('assets/'))});const root=el('div',{class:'waves'});shadow.append(sheet,root);document.documentElement.append(host);applyPreferences(root,prefs);
  // Chrome does not consistently discover @font-face rules inside shadow trees.
  for(const [family,file,weight] of [['WavesInter','Inter.ttf','100 900'],['WavesDyslexic','OpenDyslexic-Regular.woff','400'],['WavesDyslexic','OpenDyslexic-Bold.woff','600 900']]){
    const face=new FontFace(family,`url("${chrome.runtime.getURL(`assets/fonts/${file}`)}")`,{weight});face.load().then(font=>document.fonts.add(font)).catch(()=>{});
  }
  const request=message=>chrome.runtime.sendMessage(message).catch(()=>({ok:false,error:'Não foi possível conectar ao serviço. Verifique se ele está em execução.'}));
  function restoreFocus(){if(!selected)return;const node=selected.range?.startContainer;const target=selected.focus?.isConnected&&selected.focus!==document.body?selected.focus:node?.nodeType===1?node:node?.parentElement;if(target?.isConnected){if(!target.matches('button,input,a,select,textarea,[tabindex]')){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});}target.focus({preventScroll:true});}}
  function hideToolbar(){toolbar?.remove();toolbar=null;}
  function closeModal(restore=true){generation++;dialog.remove();if(restore)restoreFocus();}
  const widget=new AvatarWidget(root,{getPrefs:()=>prefs,request,onClose:()=>{widget.close();restoreFocus();}});
  const dialog=new SimplificationDialog(root,{onClose:()=>closeModal(),onTranslate:text=>{closeModal(false);hideToolbar();widget.open(text);}});
  async function simplifySelection(text){
    if(!prefs.enabled)return;const id=++generation;hideToolbar();dialog.open(text,()=>simplifySelection(text));
    const reply=await request({type:'simplify',text});
    if(id!==generation||!prefs.enabled||!dialog.overlay)return;
    if(reply?.ok)dialog.success(reply.data.text);else dialog.error(reply?.error||'Não foi possível simplificar o texto.');
  }
  function positionToolbar(){if(!toolbar||!selected?.range)return;const rect=selected.range.getBoundingClientRect();if(!rect.width&&!rect.height){hideToolbar();return;}const bounds=toolbar.getBoundingClientRect();const position=toolbarPosition(rect,bounds.width,bounds.height,{width:innerWidth,height:innerHeight});toolbar.style.left=`${position.left}px`;toolbar.style.top=`${position.top}px`;}
  function capture(){
    if(!prefs.enabled||dialog.overlay||shadow.activeElement)return;
    const selection=window.getSelection();if(!selection||selection.isCollapsed||!selection.rangeCount){hideToolbar();return;}
    const range=selection.getRangeAt(0);const start=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;const end=range.endContainer.nodeType===1?range.endContainer:range.endContainer.parentElement;
    if([start,end,document.activeElement].some(node=>node?.closest?.('input,textarea,[contenteditable]:not([contenteditable="false"]),#waves-extension-root'))){hideToolbar();return;}
    const text=selection.toString().trim();if(!text){hideToolbar();return;}
    if(text!==selected?.text)generation++;
    selected={text,range:range.cloneRange(),focus:document.activeElement};hideToolbar();
    const translate=button('Traduzir para Libras',{kind:'primary',symbol:'wave',onClick:()=>{closeModal(false);hideToolbar();widget.open(text);}});
    const simplify=button('Simplificar texto',{symbol:'spark',onClick:()=>simplifySelection(text)});
    toolbar=el('div',{class:'toolbar',role:'toolbar','aria-label':'Ações para o texto selecionado'},translate,simplify);
    if([...text].length<10){simplify.disabled=true;simplify.setAttribute('aria-describedby','waves-short-text');toolbar.append(el('p',{id:'waves-short-text',class:'toolbar-help',text:'Selecione pelo menos 10 caracteres para simplificar.'}));}
    toolbar.addEventListener('pointerdown',event=>{if(event.button===0)event.preventDefault();});
    toolbar.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();hideToolbar();restoreFocus();}});
    root.append(toolbar);positionToolbar();
  }
  document.addEventListener('selectionchange',()=>{clearTimeout(timer);timer=setTimeout(capture,120);});
  document.addEventListener('pointerup',event=>{if(event.composedPath().includes(host))return;clearTimeout(timer);timer=setTimeout(capture,0);});
  // Tab from a selection reaches the toolbar before continuing through the page.
  document.addEventListener('keydown',event=>{if(event.key==='Tab'&&toolbar&&!event.shiftKey&&!event.composedPath().includes(host)){event.preventDefault();toolbar.querySelector('button')?.focus();}},true);
  document.addEventListener('pointerdown',event=>{if(!event.composedPath().includes(host))hideToolbar();});
  window.addEventListener('scroll',positionToolbar,true);window.addEventListener('resize',positionToolbar);
  chrome.storage.onChanged.addListener(async(changes,area)=>{
    if(area!=='local'||!changes.preferences)return;
    const old=prefs;prefs=await getPreferences();applyPreferences(root,prefs);
    if(!prefs.enabled){clearTimeout(timer);generation++;hideToolbar();dialog.remove();widget.close();}
    if(old.widgetPosition!==prefs.widgetPosition)widget.anchor();
    if(old.avatarSpeed!==prefs.avatarSpeed)widget.applySpeed(prefs.avatarSpeed);
  });
  chrome.runtime.onMessage.addListener((message,sender,reply)=>{if(sender.id===chrome.runtime.id&&message?.type==='avatar:status')reply({...widget.adapter.state});});
  // Close the initialization window between the first storage read and listeners.
  prefs=await getPreferences();applyPreferences(root,prefs);
}
start().catch(error=>console.error('Waves: não foi possível iniciar a interface.',error));
