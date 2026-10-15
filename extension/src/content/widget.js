import {el,button} from '../shared/dom.js';
import {anchoredPosition,widgetBounds} from '../shared/geometry.js';
import {VLibrasAdapter} from './vlibras.js';
export class AvatarWidget {
  constructor(root,{getPrefs,request,onClose}){this.root=root;this.getPrefs=getPrefs;this.request=request;this.onClose=onClose;this.adapter=new VLibrasAdapter(state=>this.renderState(state));this.generation=0;}
  viewport(){return {width:innerWidth,height:innerHeight};}
  setBounds(bounds){this.bounds=widgetBounds(bounds,this.viewport());Object.assign(this.element.style,Object.fromEntries(Object.entries(this.bounds).map(([key,value])=>[key,`${value}px`])));}
  anchor(){if(this.element)this.setBounds(anchoredPosition(this.getPrefs().widgetPosition,this.bounds?.width||360,this.bounds?.height||440,this.viewport()));}
  async open(text){
    this.close();const generation=++this.generation;this.text=text;this.minimized=false;
    const header=el('header',{class:'widget-header'});
    this.element=el('section',{class:'avatar-widget','aria-labelledby':'waves-avatar-title'});
    this.drag=button('Mover janela: use as setas',{kind:'plain drag-handle',symbol:'drag',iconOnly:true});
    this.minimize=button('Minimizar tradução',{kind:'plain',symbol:'minimize',iconOnly:true,onClick:()=>this.toggleMinimize()});
    header.append(this.drag,el('h2',{id:'waves-avatar-title',text:'Tradução em Libras'}),this.minimize,button('Fechar tradução',{kind:'plain',symbol:'close',iconOnly:true,onClick:()=>this.onClose()}));
    this.canvasArea=el('div',{class:'avatar-body'});this.message=el('p',{class:'live-message',text:'Carregando o avatar…',role:'status'});
    this.retry=button('Tentar novamente',{onClick:()=>this.open(this.text)});this.retry.hidden=true;this.messageOverlay=el('div',{class:'avatar-message'},this.message,this.retry);
    this.playButton=button('Reproduzir tradução',{kind:'primary circular',symbol:'play',iconOnly:true,onClick:()=>{if(this.adapter.state.playing)this.adapter.pause();else this.adapter.resume();}});
    this.progress=el('div',{class:'widget-progress',role:'progressbar','aria-label':'Progresso da tradução','aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':0});this.fill=el('span',{class:'progress-fill'});this.progress.append(el('div',{class:'progress-track'},this.fill));
    this.speed=button(`${this.getPrefs().avatarSpeed}x`,{kind:'plain speed-button','aria-label':`Velocidade ${this.getPrefs().avatarSpeed}x. Alterar velocidade`,onClick:()=>this.cycleSpeed()});
    this.replay=button('Repetir tradução',{kind:'plain',symbol:'replay',iconOnly:true,onClick:()=>this.adapter.repeat()});
    this.resize=button('Redimensionar janela: use as setas',{kind:'plain resize-handle',symbol:'resize',iconOnly:true});
    this.element.append(header,this.canvasArea,el('footer',{class:'widget-footer'},this.playButton,this.progress,this.speed,this.replay),this.resize);this.root.append(this.element);this.bounds=null;this.anchor();
    this.bindMovement(this.drag,false);this.bindMovement(this.resize,true);
    this.resizeListener=()=>this.setBounds(this.bounds);window.addEventListener('resize',this.resizeListener);
    this.visibilityListener=()=>{if(document.hidden)this.adapter.pause();};document.addEventListener('visibilitychange',this.visibilityListener);
    this.playButton.disabled=this.replay.disabled=this.speed.disabled=true;
    this.drag.focus({preventScroll:true});
    const ready=this.adapter.initialize(this.canvasArea);this.canvasArea.append(this.messageOverlay);
    try{
      const reply=await this.request({type:'translate',text});
      if(generation!==this.generation)return;
      if(!reply?.ok)throw new Error(reply?.error||'Não foi possível traduzir o texto.');
      this.message.textContent='Preparando a tradução…';
      await ready;if(generation!==this.generation)return;
      await this.adapter.play(reply.data.gloss,this.getPrefs().avatarSpeed);
      if(generation!==this.generation)return;
      if(this.minimized||document.hidden)this.adapter.pause();
      this.playButton.disabled=this.replay.disabled=this.speed.disabled=false;this.messageOverlay.hidden=true;
    }catch(error){if(generation!==this.generation)return;this.adapter.fail(error.message);}
  }
  renderState(state){
    if(!this.element)return;
    if(state.state==='error'){this.message.textContent=state.error;this.messageOverlay.hidden=false;this.retry.hidden=false;this.playButton.disabled=this.replay.disabled=this.speed.disabled=true;}
    this.playButton.setAttribute('aria-label',state.playing?'Pausar tradução':'Reproduzir tradução');
    // Replace only the icon, preserving keyboard focus on the button.
    const path=this.playButton.querySelector('path');path.setAttribute('d',state.playing?'M8 5v14M16 5v14':'m9 5 11 7-11 7Z');
    this.progress.setAttribute('aria-valuenow',Math.round(state.progress));this.progress.setAttribute('aria-valuetext',`${Math.round(state.progress)}% das glosas`);this.fill.style.width=`${state.progress}%`;
  }
  cycleSpeed(){const values=[.5,1,1.5];this.currentSpeed=values[(values.indexOf(this.currentSpeed??this.getPrefs().avatarSpeed)+1)%values.length];this.applySpeed(this.currentSpeed);}
  applySpeed(speed){this.currentSpeed=speed;if(this.speed){this.speed.textContent=`${speed}x`;this.speed.setAttribute('aria-label',`Velocidade ${speed}x. Alterar velocidade`);this.adapter.setSpeed(speed);}}
  toggleMinimize(){this.minimized=!this.minimized;this.element.classList.toggle('minimized',this.minimized);if(this.minimized)this.adapter.pause();this.minimize.setAttribute('aria-label',this.minimized?'Restaurar tradução':'Minimizar tradução');}
  bindMovement(handle,resizing){
    handle.addEventListener('keydown',event=>{const shifts={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};if(!shifts[event.key])return;event.preventDefault();const [x,y]=shifts[event.key];this.move(x,y,resizing);});
    handle.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();handle.setPointerCapture(event.pointerId);let x=event.clientX,y=event.clientY;const move=e=>{this.move(e.clientX-x,e.clientY-y,resizing);x=e.clientX;y=e.clientY;};const end=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);};handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);});
  }
  move(x,y,resizing){const b={...this.bounds};if(resizing){b.width=Math.max(Math.min(320,innerWidth-32),b.width+x);b.height=Math.max(Math.min(400,innerHeight-32),b.height+y);}else{b.left+=x;b.top+=y;}this.setBounds(b);}
  close(){this.generation++;this.adapter.destroy();this.element?.remove();this.element=null;if(this.resizeListener)window.removeEventListener('resize',this.resizeListener);if(this.visibilityListener)document.removeEventListener('visibilitychange',this.visibilityListener);this.currentSpeed=null;}
}
