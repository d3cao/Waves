const NS='http://www.w3.org/2000/svg';
const paths={
  wave:'M2 16C6 16 7 5 11 5s5 16 10 16S26 2 31 2s6 14 11 14',
  spark:'m5 3 14 9-17 9 3-18Zm0 0 4 10 10-1',
  drag:'M7 5h.01M13 5h.01M7 11h.01M13 11h.01M7 17h.01M13 17h.01',
  close:'m6 6 12 12M18 6 6 18',
  minimize:'M5 12h14',
  restore:'M5 8h14v11H5ZM8 5h11',
  play:'m9 5 11 7-11 7Z',
  pause:'M8 5v14M16 5v14',
  replay:'M4 4v6h6M4 10a8 8 0 1 1 0 5',
  resize:'m9 19 10-10M14 19l5-5',
};
export function icon(name) {
  const svg=document.createElementNS(NS,'svg');
  for(const [k,v] of Object.entries({viewBox:name==='wave'?'0 0 44 24':'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false'})) svg.setAttribute(k,v);
  const p=document.createElementNS(NS,'path');p.setAttribute('d',paths[name]||paths.spark);svg.append(p);return svg;
}
export function el(tag,attrs={},...children) {
  const node=document.createElement(tag);
  for(const [key,value] of Object.entries(attrs)) {
    if(key==='class') node.className=value;
    else if(key==='text') node.textContent=value;
    else if(key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(),value);
    else if(value!==undefined&&value!==false) node.setAttribute(key,value===true?'':String(value));
  }
  node.append(...children.filter(x=>x!==null&&x!==undefined));return node;
}
export function button(label,{kind='secondary',symbol,onClick,iconOnly=false,...attrs}={}) {
  const node=el('button',{type:'button',class:`button ${kind}${iconOnly?' icon-button':''}`,'aria-label':iconOnly?label:undefined,title:iconOnly?label:undefined,onClick,...attrs});
  if(symbol) node.append(icon(symbol));
  if(!iconOnly) node.append(document.createTextNode(label));
  return node;
}
export function status(label,state='unknown') {return el('span',{class:`status ${state}`,text:label});}
export function focusable(root) {return [...root.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length);}
