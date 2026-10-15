import {el,icon,button,focusable} from '../shared/dom.js';
export class SimplificationDialog {
  constructor(root,{onClose,onTranslate}) {this.root=root;this.onClose=onClose;this.onTranslate=onTranslate;}
  open(original,onRetry) {
    this.remove();
    this.pageState={body:document.body,inert:document.body.inert,overflow:document.documentElement.style.getPropertyValue('overflow'),priority:document.documentElement.style.getPropertyPriority('overflow')};
    document.body.inert=true;
    document.documentElement.style.setProperty('overflow','hidden');
    this.overlay=el('div',{class:'modal-overlay'});
    this.dialog=el('section',{class:'modal-dialog',role:'dialog','aria-modal':'true','aria-labelledby':'waves-dialog-title'});
    const title=el('h2',{id:'waves-dialog-title',tabindex:'-1',text:'Texto Simplificado'});
    const originalCard=el('section',{class:'original'},el('h3',{text:'Texto original selecionado'}),el('p',{text:original}));
    this.message=el('p',{class:'live-message',role:'status','aria-live':'polite',text:'Simplificando o texto…'});
    this.body=el('div',{class:'card-body'},el('p',{class:'eyebrow',text:'VERSÃO MAIS FÁCIL DE LER'}),this.message);
    this.retry=button('Tentar novamente',{kind:'secondary retry',onClick:onRetry});this.retry.hidden=true;this.body.append(this.retry);
    this.translate=button('Traduzir este texto para Libras',{kind:'primary',symbol:'wave',onClick:()=>this.onTranslate(this.text)});this.translate.disabled=true;
    const card=el('article',{class:'simplified-card'},el('header',{class:'card-header'},el('div',{class:'card-title'},icon('spark'),title),button('Voltar ao original',{kind:'link',onClick:()=>this.onClose()})),this.body,el('footer',{class:'card-footer'},el('div',{class:'card-footer-inner'},this.translate)));
    this.dialog.append(originalCard,card);this.overlay.append(this.dialog);this.root.append(this.overlay);
    this.overlay.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();this.onClose();}
      if(event.key==='Tab') {
        const items=focusable(this.dialog);const active=this.root.getRootNode().activeElement;const index=items.indexOf(active);
        if(event.shiftKey&&(index<=0)){event.preventDefault();items.at(-1)?.focus();}
        else if(!event.shiftKey&&(index===-1||index===items.length-1)){event.preventDefault();items[0]?.focus();}
      }
    });
    this.focusGuard=()=>{if(this.overlay&&!this.dialog.contains(this.root.getRootNode().activeElement))title.focus({preventScroll:true});};
    document.addEventListener('focusin',this.focusGuard,true);
    requestAnimationFrame(()=>{if(title.isConnected)title.focus({preventScroll:true});});
  }
  success(text){this.text=text;this.message.className='simplified-text';this.message.textContent=text;this.retry.hidden=true;this.translate.disabled=false;}
  error(text){this.message.className='live-message error';this.message.textContent=text;this.retry.hidden=false;this.translate.disabled=true;}
  remove(){if(this.focusGuard)document.removeEventListener('focusin',this.focusGuard,true);this.overlay?.remove();this.overlay=null;this.text=null;if(this.pageState){this.pageState.body.inert=this.pageState.inert;if(this.pageState.overflow)document.documentElement.style.setProperty('overflow',this.pageState.overflow,this.pageState.priority);else document.documentElement.style.removeProperty('overflow');this.pageState=null;}}
}
