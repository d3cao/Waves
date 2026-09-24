```markdown
# WAVES: AI Agent - API de Simplificação Textual

Este submódulo contém o protótipo do agente de Inteligência Artificial do projeto WAVES. A API assíncrona é responsável por pré-processar e reescrever trechos de texto em linguagem simples, facilitando a interpretação por utilizadores e otimizando o envio posterior para a engine de tradução do VLibras.

## 🚀 Tecnologias e Arquitetura

* **FastAPI + Uvicorn:** Criação e exposição da API REST.
* **Pydantic:** Validação estrita de *payloads* e estruturação das respostas em JSON.
* **httpx:** Comunicação assíncrona não-bloqueante com o motor da IA.
* **Ollama:** Motor de inferência local (sem necessidade de GPU ou Docker).
* **Modelo Otimizado:** `llama3.2:1b` (~800 MB de RAM, ideal para máquinas com 8 GB).

## ⚙️ Pré-requisitos e Configuração

1. **Motor de IA:** Instale o [Ollama](https://ollama.com/download) na sua máquina.
2. **Transferência do Modelo:** Abra o terminal e efetue o *download* do modelo:
   ```bash
   ollama pull llama3.2:1b

```

3. **Dependências Python:**
No diretório `ai-agent`, crie um ambiente virtual e instale as bibliotecas:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

```


*Nota: O parâmetro `num_ctx: 1024` está ativo no código para evitar picos de consumo de memória RAM durante a prototipagem.*

## 🏃‍♂️ Execução

Certifique-se de que o serviço do Ollama está ativo em segundo plano (`http://localhost:11434`). Em seguida, inicie o servidor da API:

```bash
uvicorn main:app --reload

```

A API ficará disponível em `http://localhost:8000`. Aceda a `http://localhost:8000/docs` para interagir com o Swagger UI.

## 🔄 Integração com a Extensão (Frontend)

O *Content Script* da extensão do navegador deve enviar o texto selecionado pelo utilizador para a IA antes de o enviar para o VLibras.

### Exemplo (JavaScript/Fetch)

```javascript
async function simplificarTexto(textoOriginal) {
  try {
    const resposta = await fetch("http://localhost:8000/simplify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: textoOriginal })
    });
    
    if (!resposta.ok) throw new Error("Erro na API de IA");
    
    const dados = await resposta.json();
    return dados.texto_simplificado; 
  } catch (erro) {
    console.error("Falha ao simplificar:", erro);
    return textoOriginal; // Fallback: devolve o original em caso de falha
  }
}

```

## 📡 Endpoints da API

### `POST /simplify`

Reduz frases complexas, ambiguidades e jargões, transformando o texto para uma estrutura sintática mais direta.

**Corpo da Requisição (JSON):**

```json
{
  "texto": "A implementação de diretrizes de acessibilidade digital mitiga barreiras cognitivas, propiciando um ecossistema mais equitativo."
}

```

**Resposta de Sucesso (200 OK):**

```json
{
  "texto_simplificado": "O uso de regras de acessibilidade na internet diminui dificuldades de leitura, criando um ambiente mais justo para todos."
}

```

```

```