export async function fetchChecked(url,options={},timeout=25000,fetcher=fetch) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try {
    const response=await fetcher(url,{...options,signal:controller.signal});
    if(!response.ok) throw new Error(response.status===422?'A API não conseguiu processar este texto.':`O serviço respondeu com erro (${response.status}).`);
    // Keep the deadline active until the complete body arrives, not just headers.
    const body=await response.arrayBuffer();
    return new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers});
  } catch(error) {
    if(error.name==='AbortError') throw new Error('O serviço demorou para responder. Tente novamente.');
    throw error;
  } finally {clearTimeout(timer);}
}
export async function simplify(text,fetcher=fetch) {
  if(typeof text!=='string'||[...text].length<10) throw new Error('Selecione pelo menos 10 caracteres para simplificar.');
  const response=await fetchChecked('http://localhost:8000/simplify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texto:text})},25000,fetcher);
  const data=await response.json();
  if(typeof data.texto_simplificado!=='string'||!data.texto_simplificado.trim()) throw new Error('A API retornou uma resposta inválida.');
  return data.texto_simplificado;
}
export async function translate(text,fetcher=fetch) {
  if(typeof text!=='string'||!text.trim()) throw new Error('Selecione um texto para traduzir.');
  const response=await fetchChecked('https://traducao2.vlibras.gov.br/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})},25000,fetcher);
  const raw=await response.text();
  let gloss=raw;
  try {const parsed=JSON.parse(raw);gloss=typeof parsed==='string'?parsed:parsed.traducao;} catch {if(raw.trim().startsWith('<')) throw new Error('O tradutor retornou uma resposta inválida.');}
  if(typeof gloss!=='string'||!gloss.trim()) throw new Error('O tradutor não retornou uma tradução válida.');
  return gloss;
}
