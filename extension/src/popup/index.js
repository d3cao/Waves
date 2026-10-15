import {el,icon,status} from '../shared/dom.js';
import {getPreferences,updatePreferences,applyPreferences} from '../shared/preferences.js';
const root=document.querySelector('#app');root.className='waves popup';
let prefs=await getPreferences();
const master=el('input',{type:'checkbox',class:'switch',role:'switch','aria-label':'Ativar Waves'});
const subtitle=el('small',{text:'Acessibilidade ativa'});
const header=el('header',{class:'popup-header'},el('div',{class:'brand'},icon('wave'),el('div',{},el('h1',{text:'Waves'}),subtitle)),master);
const position=el('select',{id:'position','aria-label':'Posição do widget'});
for(const [value,text] of [['bottom-right','Canto inferior direito'],['bottom-left','Canto inferior esquerdo'],['top-right','Canto superior direito'],['top-left','Canto superior esquerdo']])position.append(el('option',{value,text}));
const speeds=el('fieldset',{},el('legend',{text:'Velocidade padrão do avatar'}));const group=el('div',{class:'segments'});
const speedInputs=[.5,1,1.5].map(value=>{const input=el('input',{type:'radio',name:'speed',value,'aria-label':`${value}x`});group.append(el('label',{},input,el('span',{text:`${value}x`})));input.addEventListener('change',()=>save({avatarSpeed:value}));return input;});speeds.append(group);
const translation=el('section',{class:'preferences-section','aria-labelledby':'translation-title'},el('h2',{id:'translation-title',class:'section-heading',text:'Preferências de tradução'}),el('div',{class:'field'},el('label',{for:'position',text:'Posição do widget'}),position),speeds);
const dyslexia=el('input',{type:'checkbox',class:'switch',role:'switch','aria-label':'Modo Dislexia'});
const size=el('input',{type:'range',id:'text-size',min:16,max:24,step:1});const sizeLabel=el('label',{for:'text-size'});
const reading=el('section',{class:'preferences-section','aria-labelledby':'reading-title'},el('h2',{id:'reading-title',class:'section-heading',text:'Preferências de leitura'}),el('label',{class:'switch-label'},el('span',{class:'copy'},document.createTextNode('Modo Dislexia'),el('small',{text:'Usar uma fonte com formas mais distintas'})),dyslexia),el('div',{class:'field'},sizeLabel,size,el('div',{class:'range-limits'},el('span',{text:'16px'}),el('span',{text:'24px'}))));
const ai=status('IA: verificando','checking');const avatar=status('VLibras: não verificado');const summary=el('p',{class:'helper',text:'Verificando os serviços para este site.'});
const footer=el('footer',{class:'popup-footer','aria-live':'polite'},el('div',{class:'statuses'},ai,avatar),summary);
const saveError=el('p',{class:'save-error error',role:'alert'});root.append(header,translation,reading,footer,saveError);
function render(){applyPreferences(root,prefs);master.checked=prefs.enabled;subtitle.textContent=prefs.enabled?'Acessibilidade ativa':'Acessibilidade desativada';position.value=prefs.widgetPosition;dyslexia.checked=prefs.dyslexiaMode;size.value=prefs.simplifiedFontSize;sizeLabel.textContent=`Tamanho do texto simplificado: ${prefs.simplifiedFontSize}px`;size.setAttribute('aria-valuetext',`${prefs.simplifiedFontSize} pixels`);for(const input of speedInputs)input.checked=Number(input.value)===prefs.avatarSpeed;}
async function save(patch){try{const reply=await updatePreferences(patch);if(!reply?.ok)throw new Error(reply?.error);prefs=reply.data;saveError.textContent='';render();}catch{saveError.textContent='Não foi possível salvar. Tente novamente.';render();}}
master.addEventListener('change',()=>save({enabled:master.checked}));position.addEventListener('change',()=>save({widgetPosition:position.value}));dyslexia.addEventListener('change',()=>save({dyslexiaMode:dyslexia.checked}));size.addEventListener('input',()=>{sizeLabel.textContent=`Tamanho do texto simplificado: ${size.value}px`;});size.addEventListener('change',()=>save({simplifiedFontSize:Number(size.value)}));
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.preferences)getPreferences().then(value=>{prefs=value;render();});});
render();
function setStatus(node,text,state){node.textContent=text;node.className=`status ${state}`;}
async function refreshStatus(){
  const health=await chrome.runtime.sendMessage({type:'health'}).catch(()=>null);
  setStatus(ai,health?.data?.available?'IA conectada':'IA indisponível',health?.data?.available?'available':'unavailable');
  try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});const state=await chrome.tabs.sendMessage(tab.id,{type:'avatar:status'});setStatus(avatar,state.available?'VLibras conectado':state.state==='error'?'VLibras indisponível':state.state==='loading'?'VLibras: verificando':'VLibras: não verificado',state.available?'available':state.state==='error'?'unavailable':'unknown');summary.textContent=health?.data?.available&&state.available?'Tudo pronto para usar neste site.':'Selecione um texto na página para começar.';}
  catch{summary.textContent='Abra uma página web para usar o Waves.';}
}
await refreshStatus();setInterval(refreshStatus,10000);
