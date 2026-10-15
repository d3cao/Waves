// Commands and events verified against upstream d292d369419196b6e8ba826d674f5d3b4bcefa9a.
export class VLibrasAdapter {
  constructor(onState) {this.onState=onState;this.state={state:'unknown',available:false,playing:false,progress:0};}
  emit(patch){Object.assign(this.state,patch);this.onState({...this.state});}
  initialize(container) {
    this.destroy();
    this.channel=crypto.randomUUID();this.emit({state:'loading',available:false,playing:false,progress:0});
    this.frame=document.createElement('iframe');this.frame.title='Avatar VLibras';this.frame.allow='autoplay';
    this.frame.src=chrome.runtime.getURL(`avatar/index.html#${this.channel}`);
    this.ready=new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});
    // Avoid an unhandled rejection if loading fails while the translation is still pending.
    this.ready.catch(()=>{});
    this.listener=event=>{
      if(event.source!==this.frame?.contentWindow||event.data?.channel!==this.channel||event.data?.type!=='waves:avatar:event')return;
      const {event:name,data}=event.data;
      if(name==='ready'){clearTimeout(this.timer);this.emit({state:'ready',available:true});this.resolve();}
      if(name==='error'){this.fail('Não foi possível carregar o avatar. Verifique sua conexão e o suporte a WebGL.');}
      if(name==='state'&&Array.isArray(data)){
        const [playing,paused,loading]=data.map(x=>x===true||x==='True'||x===1);
        this.emit({playing:playing&&!paused,state:paused?'paused':playing?'playing':loading?'loading':'ready'});
      }
      if(name==='gloss'&&Array.isArray(data)){const [count,max]=data.map(Number);if(Number.isFinite(count)&&Number.isFinite(max)&&max>0)this.emit({progress:Math.max(0,Math.min(100,(count+1)/Math.max(max,count+1)*100))});}
    };
    window.addEventListener('message',this.listener);
    this.timer=setTimeout(()=>this.fail('O avatar demorou para carregar. Tente novamente.'),45000);
    container.append(this.frame);return this.ready;
  }
  fail(message){clearTimeout(this.timer);this.reject?.(new Error(message));this.emit({state:'error',available:false,playing:false,error:message});}
  send(command,value){if(!this.frame)return;this.frame.contentWindow?.postMessage({type:'waves:avatar:command',channel:this.channel,command,value},'*');}
  async play(gloss,speed){await this.ready;this.gloss=gloss;this.emit({progress:0});this.send('speed',speed);this.send('play',gloss);}
  pause(){this.send('pause');}
  resume(){if(this.state.state==='ready'&&this.gloss)this.repeat();else this.send('resume');}
  repeat(){if(this.gloss){this.emit({progress:0});this.send('play',this.gloss);}}
  setSpeed(speed){this.send('speed',speed);}
  destroy(){clearTimeout(this.timer);if(this.listener)window.removeEventListener('message',this.listener);this.send('stop');this.frame?.remove();this.frame=null;this.reject?.(new Error('Tradução encerrada.'));this.resolve=null;this.reject=null;this.gloss=null;this.state={state:'unknown',available:false,playing:false,progress:0};}
}
