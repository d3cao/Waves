/* Waves bridge; Unity binaries and loader are unmodified VLibras assets. */
(() => {
  const channel=location.hash.slice(1);
  let game,loaded=false;
  const post=(event,data)=>parent.postMessage({type:'waves:avatar:event',channel,event,data},'*');
  const send=(method,value)=>game.SendMessage('PlayerManager',method,value);
  window.onLoadPlayer=()=>{
    // Unity can signal readiness before instantiate has returned its instance.
    setTimeout(()=>{
      loaded=true;
      send('setBaseUrl','https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/BR/');
      send('setSubtitlesState',1);
      post('ready');
    },0);
  };
  window.onPlayingStateChange=(...data)=>post('state',data);
  window.CounterGloss=(...data)=>post('gloss',data);
  window.FinishWelcome=()=>{};
  window.GetAvatar=()=>{};
  window.SetFullscreen=()=>{};
  window.addEventListener('message',event=>{
    if(event.source!==parent||event.data?.type!=='waves:avatar:command'||event.data.channel!==channel||!loaded)return;
    const {command,value}=event.data;
    if(command==='play'&&typeof value==='string'&&value.trim())send('playNow',value);
    if(command==='pause')send('setPauseState',1);
    if(command==='resume')send('setPauseState',0);
    if(command==='stop')send('stopAll');
    if(command==='speed'&&[.5,1,1.5].includes(value))send('setSlider',value);
  });
  try {
    game=UnityLoader.instantiate('gameContainer','playerweb.json',{
      onProgress:()=>{},
      compatibilityCheck:(_,accept,deny)=>{if(UnityLoader.SystemInfo.hasWebGL)accept();else{post('error');deny();}},
      onError:()=>post('error'),
    });
    window.addEventListener('error',()=>post('error'));
    window.addEventListener('unhandledrejection',()=>post('error'));
  } catch {post('error');}
})();
