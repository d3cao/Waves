export const clamp = (n,min,max) => Math.min(Math.max(n,min),Math.max(min,max));
export function toolbarPosition(rect,width,height,viewport) {
  return {left:clamp(rect.left+(rect.width-width)/2,16,viewport.width-width-16),top:clamp(rect.top-height-8>=16?rect.top-height-8:rect.bottom+8,16,viewport.height-height-16)};
}
export function widgetBounds(bounds,viewport) {
  const width=Math.min(bounds.width,Math.max(1,viewport.width-32));
  const height=Math.min(bounds.height,Math.max(1,viewport.height-32));
  return {width,height,left:clamp(bounds.left,16,viewport.width-width-16),top:clamp(bounds.top,16,viewport.height-height-16)};
}
export function anchoredPosition(position,width,height,viewport) {
  return widgetBounds({width,height,left:position.endsWith('right')?viewport.width-width-16:16,top:position.startsWith('bottom')?viewport.height-height-16:16},viewport);
}
