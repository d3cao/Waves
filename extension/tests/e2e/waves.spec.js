import {test as base,expect,chromium} from '@playwright/test';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dist=fileURLToPath(new URL('../../dist/',import.meta.url));
const test=base.extend({
  context:async({},use)=>{
    const profile=await mkdtemp(path.join(tmpdir(),'waves-test-'));
    const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:{width:1366,height:768},args:[`--disable-extensions-except=${dist}`,`--load-extension=${dist}`,'--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    await use(context);await context.close();await rm(profile,{recursive:true,force:true});
  },
  extensionId:async({context},use)=>{let [worker]=context.serviceWorkers();if(!worker)worker=await context.waitForEvent('serviceworker');await expect.poll(()=>worker.evaluate(async()=>Boolean((await chrome.storage.local.get('preferences')).preferences))).toBe(true);await use(new URL(worker.url()).host);},
});
async function select(page,id='selection'){
  await page.locator('#'+id).evaluate(node=>{const range=document.createRange();range.selectNodeContents(node);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);});
  await expect(page.getByRole('toolbar')).toBeVisible();
}
async function preferences(context,patch){const [worker]=context.serviceWorkers();await worker.evaluate(async patch=>{const {preferences={}}=await chrome.storage.local.get('preferences');await chrome.storage.local.set({preferences:{...preferences,...patch}});},patch);}
test('popup, preferências persistentes e fonte local',{tag:'@ui'},async({context,extensionId})=>{
  const page=await context.newPage();await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.getByRole('heading',{name:'Waves',exact:true})).toBeVisible();
  await expect(page.getByText('IA conectada',{exact:true})).toBeVisible();
  await page.getByRole('switch',{name:'Modo Dislexia',exact:true}).check();
  await page.getByLabel('Posição do widget').selectOption('top-left');
  await page.getByRole('radio',{name:'1.5x',exact:true}).check();
  await page.reload();await expect(page.getByRole('switch',{name:'Modo Dislexia',exact:true})).toBeChecked();
  await expect(page.getByLabel('Posição do widget')).toHaveValue('top-left');
  await expect(page.getByRole('radio',{name:'1.5x',exact:true})).toBeChecked();
  await page.evaluate(()=>document.fonts.ready);expect(await page.locator('#app').evaluate(node=>getComputedStyle(node).fontFamily)).toContain('WavesDyslexic');
  const measures=await page.locator('input,select').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));expect(measures.every(n=>n>=48)).toBeTruthy();
  await preferences(context,{dyslexiaMode:false,widgetPosition:'bottom-right',avatarSpeed:1});await page.reload();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'test-results/popup.png',clip:{x:0,y:0,width:360,height:600}});
  if(process.env.WAVES_VISUAL)await expect(page.locator('body')).toHaveScreenshot('popup.png');
});
test('gatilho isolado, modal, foco e retorno ao original',async({page,extensionId})=>{
  await page.goto('http://127.0.0.1:8765');await select(page);
  await expect(page.getByRole('button',{name:'Traduzir para Libras',exact:true})).toHaveCSS('color','rgb(255, 255, 255)');
  await expect(page.locator('#host-button')).toHaveCSS('color','rgb(255, 0, 255)');
  await page.screenshot({path:'test-results/toolbar.png'});
  await page.getByRole('button',{name:'Simplificar texto',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('.simplified-text')).toContainText('Os serviços públicos precisam trabalhar juntos.');
  expect(await page.locator('body').evaluate(node=>node.inert)).toBeTruthy();
  await page.screenshot({path:'test-results/modal.png'});
  if(process.env.WAVES_VISUAL)await expect(page.getByRole('dialog')).toHaveScreenshot('modal.png');
  await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Voltar ao original'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Traduzir este texto para Libras'})).toBeFocused();
  await page.getByRole('button',{name:'Voltar ao original'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('#selection')).toBeFocused();
  expect(await page.locator('body').evaluate(node=>node.inert)).toBeFalsy();
});
test('seleção curta, erros e texto retornado sem HTML executável',async({page,extensionId})=>{
  await page.goto('http://127.0.0.1:8765');await select(page,'short');await expect(page.getByRole('button',{name:'Simplificar texto'})).toBeDisabled();await expect(page.getByRole('button',{name:'Traduzir para Libras'})).toBeEnabled();
  await select(page,'invalid');await page.getByRole('button',{name:'Simplificar texto'}).click();await expect(page.getByRole('button',{name:'Tentar novamente'})).toBeVisible();await page.keyboard.press('Escape');
  await select(page,'literal');await page.getByRole('button',{name:'Simplificar texto'}).click();await expect(page.locator('.simplified-text')).toHaveText('<script>window.executed = true</script>');expect(await page.evaluate(()=>window.executed)).toBeUndefined();
});
test('toggle master invalida resposta pendente nas abas abertas',async({context,page,extensionId})=>{
  await page.goto('http://127.0.0.1:8765');await select(page,'slow');await page.getByRole('button',{name:'Simplificar texto'}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await preferences(context,{enabled:false});await expect(page.getByRole('dialog')).toHaveCount(0);await page.waitForTimeout(2200);await expect(page.getByRole('dialog')).toHaveCount(0);
  await preferences(context,{enabled:true});await select(page);await expect(page.getByRole('toolbar')).toBeVisible();
});
test('fonte e tamanho propagam a duas abas, sem alterar o site',async({context,page,extensionId})=>{
  const second=await context.newPage();await Promise.all([page.goto('http://127.0.0.1:8765'),second.goto('http://127.0.0.1:8765')]);
  await preferences(context,{dyslexiaMode:true,simplifiedFontSize:24});
  for(const tab of [page,second]){await select(tab);await tab.getByRole('button',{name:'Simplificar texto'}).click();await expect(tab.locator('.simplified-text')).toHaveCSS('font-size','24px');await expect(tab.locator('.waves')).toHaveCSS('font-family',/WavesDyslexic/);await expect(tab.locator('main')).toHaveCSS('font-family',/system-ui/);}
});
test('viewport estreita e página CSP restritiva mantêm o modal acessível',async({page,extensionId})=>{
  await page.setViewportSize({width:375,height:667});await page.goto('http://127.0.0.1:8765/strict');await select(page);
  const box=await page.getByRole('toolbar').boundingBox();expect(box.x).toBeGreaterThanOrEqual(16);expect(box.x+box.width).toBeLessThanOrEqual(359);
  await page.getByRole('button',{name:'Simplificar texto'}).click();await expect(page.locator('.simplified-text')).toBeVisible();
  await page.screenshot({path:'test-results/modal-narrow.png'});await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('widget real: frame local, progresso somente de leitura e teclado',async({page,extensionId})=>{
  await page.goto('http://127.0.0.1:8765');await select(page);await page.getByRole('button',{name:'Traduzir para Libras',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Tradução em Libras'})).toBeVisible();await expect(page.getByRole('progressbar')).toBeVisible();await expect(page.getByRole('slider')).toHaveCount(0);
  const move=page.getByRole('button',{name:'Mover janela: use as setas'});const before=await page.locator('.avatar-widget').boundingBox();await move.focus();await page.keyboard.press('ArrowLeft');const after=await page.locator('.avatar-widget').boundingBox();expect(after.x).toBe(before.x-10);
  const handle=await move.boundingBox();await page.mouse.move(handle.x+24,handle.y+24);await page.mouse.down();await page.mouse.move(handle.x-6,handle.y+14);await page.mouse.up();
  const dragged=await page.locator('.avatar-widget').boundingBox();expect(dragged.x).toBe(after.x-30);expect(dragged.y).toBe(after.y-10);
  const resize=page.getByRole('button',{name:'Redimensionar janela: use as setas'});await resize.focus();await page.keyboard.press('ArrowRight');const resized=await page.locator('.avatar-widget').boundingBox();expect(resized.width).toBe(dragged.width+10);
  await page.getByRole('button',{name:'Minimizar tradução'}).click();await expect(page.locator('.avatar-widget')).toHaveClass(/minimized/);await page.getByRole('button',{name:'Restaurar tradução'}).click();await expect(page.locator('.avatar-body')).toBeVisible();
  await page.screenshot({path:'test-results/widget.png'});
  await page.getByRole('button',{name:'Fechar tradução'}).click();await expect(page.locator('.avatar-widget')).toHaveCount(0);
});
test('1920px e zoom de 200%: texto grande, dislexia e controles sem corte',async({page,context,extensionId})=>{
  await page.setViewportSize({width:1920,height:1080});await page.goto('http://127.0.0.1:8765');await expect(page.locator('.waves')).toHaveCount(1);
  await preferences(context,{dyslexiaMode:true,simplifiedFontSize:24});
  await select(page);await page.getByRole('button',{name:'Simplificar texto'}).click();await expect(page.locator('.simplified-text')).toHaveCSS('font-size','24px');
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>[...document.fonts].some(f=>f.family==='WavesDyslexic'&&f.status==='loaded'))).toBeTruthy();
  await page.screenshot({path:'test-results/modal-large-dyslexia.png'});
  await page.keyboard.press('Escape');
  const [worker]=context.serviceWorkers();
  await worker.evaluate(async()=>{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});await chrome.tabs.setZoom(tab.id,2);});
  await expect.poll(()=>page.evaluate(()=>innerWidth)).toBe(960);
  await select(page);await page.getByRole('button',{name:'Simplificar texto'}).click();await expect(page.locator('.simplified-text')).toBeVisible();
  const dialog=await page.getByRole('dialog').boundingBox();expect(dialog.width).toBeLessThanOrEqual(928);expect(dialog.height).toBeLessThanOrEqual(508);
  await page.getByRole('button',{name:'Traduzir este texto para Libras'}).scrollIntoViewIfNeeded();await expect(page.getByRole('button',{name:'Traduzir este texto para Libras'})).toBeInViewport();
  await page.screenshot({path:'test-results/modal-200-percent.png'});
});
test('preferências corrompidas e conteúdo editável não quebram a interface',async({page,context,extensionId})=>{
  const [worker]=context.serviceWorkers();await worker.evaluate(()=>chrome.storage.local.set({preferences:null}));
  await page.goto('http://127.0.0.1:8765');await expect(page.locator('.waves')).toHaveCount(1);
  await page.locator('[contenteditable]').evaluate(node=>{node.focus();const r=document.createRange();r.selectNodeContents(node);getSelection().removeAllRanges();getSelection().addRange(r);});
  await page.waitForTimeout(250);await expect(page.getByRole('toolbar')).toHaveCount(0);
  await page.locator('[contenteditable]').evaluate(node=>node.blur());await select(page);await expect(page.locator('#waves-extension-root')).toHaveCount(1);
});
test('VLibras online: player pronto e controles reais',{tag:'@live'},async({page,extensionId})=>{
  test.skip(!process.env.WAVES_LIVE,'Requer rede e serviços públicos VLibras; execute WAVES_LIVE=1.');
  const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:8765');await select(page);await page.getByRole('button',{name:'Traduzir para Libras',exact:true}).click();
  await expect(page.getByRole('button',{name:/Velocidade .*Alterar velocidade/})).toBeEnabled({timeout:50000});
  await expect.poll(()=>page.getByRole('progressbar').getAttribute('aria-valuenow'),{timeout:35000}).not.toBe('0');
  await page.screenshot({path:'test-results/widget-live.png'});
  await page.getByRole('button',{name:'Pausar tradução',exact:true}).click();await expect(page.getByRole('button',{name:'Reproduzir tradução',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:/Velocidade .*Alterar velocidade/}).click();await expect(page.locator('.speed-button')).toHaveText('1.5x');await page.getByRole('button',{name:'Repetir tradução'}).click();
  await expect(page.getByRole('button',{name:'Pausar tradução',exact:true})).toBeEnabled();
  expect(errors.filter(x=>/Content Security Policy/.test(x))).toEqual([]);
});
