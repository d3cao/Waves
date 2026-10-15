export const DEFAULTS = Object.freeze({enabled:true,widgetPosition:'bottom-right',avatarSpeed:1,dyslexiaMode:false,simplifiedFontSize:18});
export const POSITIONS = ['bottom-right','bottom-left','top-right','top-left'];
export const SPEEDS = [0.5,1,1.5];
export function normalizePreferences(value = {}) {
  if(!value || typeof value !== 'object' || Array.isArray(value)) value = {};
  return {
    enabled: typeof value.enabled === 'boolean' ? value.enabled : DEFAULTS.enabled,
    widgetPosition: POSITIONS.includes(value.widgetPosition) ? value.widgetPosition : DEFAULTS.widgetPosition,
    avatarSpeed: SPEEDS.includes(value.avatarSpeed) ? value.avatarSpeed : DEFAULTS.avatarSpeed,
    dyslexiaMode: typeof value.dyslexiaMode === 'boolean' ? value.dyslexiaMode : DEFAULTS.dyslexiaMode,
    simplifiedFontSize: Number.isInteger(value.simplifiedFontSize) && value.simplifiedFontSize >=16 && value.simplifiedFontSize <=24 ? value.simplifiedFontSize : DEFAULTS.simplifiedFontSize,
  };
}
export async function getPreferences() {return normalizePreferences((await chrome.storage.local.get('preferences')).preferences);}
// Write individual fields, avoiding read/modify/write races between popup and tabs.
export async function updatePreferences(patch) {return chrome.runtime.sendMessage({type:'preferences:update',patch});}
export function applyPreferences(root,prefs) {
  root.classList.toggle('dyslexia',prefs.dyslexiaMode);
  root.style.setProperty('--simplified-size',`${prefs.simplifiedFontSize}px`);
}
