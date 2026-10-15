from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ValidationError
import httpx

app = FastAPI(title="WAVES - Agente de IA (Simplificação Textual)")

OLLAMA_MODEL = "llama3.2:1b"


@app.get("/health")
async def verificar_saude():
    """Verifica disponibilidade sem executar inferência nem alterar /simplify."""
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resposta = await client.get("http://localhost:11434/api/tags")
            resposta.raise_for_status()
            dados = resposta.json()
            modelos = dados.get("models", [])
            modelo_disponivel = any(
                isinstance(modelo, dict)
                and OLLAMA_MODEL in (modelo.get("name"), modelo.get("model"))
                for modelo in modelos
            )
            return {
                "status": "available" if modelo_disponivel else "unavailable",
                "ollama": True,
                "model": modelo_disponivel,
            }
    except (httpx.HTTPError, ValueError, TypeError, AttributeError):
        return {"status": "unavailable", "ollama": False, "model": False}

class RequisicaoTexto(BaseModel):
    texto: str = Field(..., min_length=10, description="Texto original extraído da página web")

class RespostaSimplificacao(BaseModel):
    texto_simplificado: str = Field(..., description="Texto reescrito sem ambiguidades e de fácil compreensão")

@app.post("/simplify", response_model=RespostaSimplificacao)
async def simplificar_texto(entrada: RequisicaoTexto):
    prompt_sistema = f"""
Sua tarefa é reescrever o texto recebido focando na simplificação textual e adequação gramatical.
Instruções:
- Reduza frases complexas, ambiguidades, estruturas passivas e jargões.
- Transforme o texto para uma estrutura sintática muito direta, facilitando a interpretação por pessoas com déficit de leitura e otimizando o envio posterior para tradução em Libras.
- Mantenha o sentido original.

Devolva EXCLUSIVAMENTE um objeto JSON válido no seguinte formato obrigatório:
{{
  "texto_simplificado": "O seu texto reescrito e simplificado aqui."
}}

Texto a ser analisado:
---
{entrada.texto}
---
"""

    url_ollama = "http://localhost:11434/api/generate"
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt_sistema,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.2, 
            "num_ctx": 1024     
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resposta = await client.post(url_ollama, json=payload)
            resposta.raise_for_status()
            
            conteudo_gerado = resposta.json().get("response", "")
            return RespostaSimplificacao.model_validate_json(conteudo_gerado)

        except httpx.HTTPError as erro_rede:
            raise HTTPException(status_code=502, detail="Erro de rede com o motor de IA local.")
        except ValidationError:
            raise HTTPException(status_code=422, detail="Falha na estruturação JSON gerada pela IA.")