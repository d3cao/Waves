# Waves — guia de instalação e primeiro uso

Este guia parte de um repositório recém-clonado ou atualizado com `git pull`.
Ao terminar, você terá a extensão carregada no navegador e a simplificação de
texto funcionando com a IA local.

## 1. Entenda o que precisa estar funcionando

| Recurso | O que precisa |
| --- | --- |
| Popup, preferências e gatilho de seleção | Extensão compilada e carregada no navegador |
| Tradução para Libras | Extensão, internet e suporte a WebGL no navegador |
| Simplificação de texto | Extensão, API Python e Ollama com o modelo `llama3.2:1b` |

Node.js é usado para gerar a extensão. Depois do build, não é necessário manter
um servidor Node em execução. Para simplificar textos, a API Python e o Ollama
precisam continuar em execução enquanto você usa a extensão.

## 2. Instale os pré-requisitos

| Programa | Versão/orientação | Onde obter |
| --- | --- | --- |
| Chrome ou Microsoft Edge | Versão atual; a extensão exige Chromium 120 ou superior | Site oficial do seu navegador |
| Node.js e npm | Node.js 22 ou superior; prefira uma versão LTS. Instale também o npm oferecido pelo instalador | [Download oficial do Node.js](https://nodejs.org/en/download) |
| Python | Recomendado Python 3.12, versão usada na validação, ou superior | [Download oficial do Python](https://www.python.org/downloads/) |
| Ollama | Instalação local para o seu sistema operacional | [Download oficial do Ollama](https://ollama.com/download) |

Depois de instalar, feche e reabra o terminal. Confirme:

**macOS ou Linux:**

```sh
node --version
npm --version
python3 --version
ollama --version
```

**Windows — PowerShell:**

```powershell
node --version
npm --version
py -3 --version
ollama --version
```

Se algum comando não for encontrado, revise a instalação e sua inclusão no PATH.
No Windows, se `py` não estiver disponível, use `python` nos comandos de criação
do ambiente virtual, após confirmar `python --version`.

Não é necessário instalar Docker, uma extensão VLibras separada ou configurar
chaves de API. O projeto usa um modelo local; não exige arquivo `.env` para esse fluxo.

## 3. Gere a extensão

Abra um terminal **na raiz do repositório Waves**. Essa é a pasta que contém
`README.md`, `extension/` e `ai-agent/`. Os comandos a seguir funcionam em macOS,
Linux e PowerShell:

```sh
cd extension
npm install
npm run build
cd ..
```

O `npm install` instala as ferramentas de desenvolvimento declaradas no projeto.
O build verifica os recursos locais e gera a pasta `extension/dist/`.

**Como saber se deu certo:** a mensagem final informa que a extensão foi gerada.
Dentro de `extension/dist/`, deve existir o arquivo `manifest.json`.

Essa pasta é gerada localmente e não vem no `git pull`. Os arquivos do avatar e
das fontes já fazem parte do repositório; não precisam de download manual adicional.

Se você já usa pnpm, pode substituir os dois comandos npm por
`pnpm install --frozen-lockfile` e `pnpm run build`, usando o lockfile do repositório.
Escolha um gerenciador para essa instalação.

## 4. Carregue a extensão no navegador

### Chrome

1. Digite `chrome://extensions` na barra de endereço.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta **`extension/dist`**, dentro do seu clone do Waves.

### Microsoft Edge

1. Digite `edge://extensions` na barra de endereço.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** — o nome pode variar com o idioma.
4. Selecione a pasta **`extension/dist`**, dentro do seu clone do Waves.

Selecione a pasta que contém o manifesto gerado. Não selecione a raiz do
repositório, a pasta `extension` nem um arquivo ZIP.

No menu de extensões do navegador, fixe o **Waves** para acessar as preferências.
Abra uma página web comum e recarregue as abas que já estavam abertas antes da instalação.

**Primeira conferência:** selecione um parágrafo e clique em **Traduzir para Libras**.
O widget deverá carregar o avatar. Você já pode testar essa função antes de configurar
a IA local. O primeiro carregamento pode demorar alguns segundos.

O Edge é um alvo da implementação, mas a validação automatizada registrada foi
feita em Chromium; consulte o [relatório de validação](extension/docs/validation.md).

## 5. Prepare o Ollama e o modelo

No macOS ou Windows, abra o aplicativo Ollama e mantenha-o em execução.
Em uma instalação por linha de comando, ou se o serviço não estiver iniciado,
execute em um terminal separado:

```sh
ollama serve
```

Deixe esse terminal aberto. Se aparecer que a porta `11434` já está em uso,
o Ollama pode já estar rodando; confira a lista de modelos antes de iniciar
outra instância.

Em **outro terminal**, baixe o modelo exigido pelo projeto:

```sh
ollama pull llama3.2:1b
ollama list
```

Aguarde o download terminar. A lista deve incluir **`llama3.2:1b`**; ter apenas
outro modelo instalado não atende à configuração atual do backend.

O download do modelo precisa de internet. Depois de instalado, a inferência usa
o Ollama local. A tradução VLibras continua dependendo de seus serviços online.

Referências oficiais: [iniciar o Ollama](https://docs.ollama.com/quickstart) e
[listar modelos pela API](https://docs.ollama.com/api/tags).

## 6. Instale as dependências Python

Abra um terminal **na raiz do repositório**. Crie um ambiente virtual para as
dependências do Waves. Execute apenas o bloco correspondente ao seu sistema.

### macOS ou Linux

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r ai-agent/requirements.txt
```

### Windows — PowerShell

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r ai-agent\requirements.txt
```

Os comandos usam diretamente o Python do ambiente virtual. Não é necessário
ativá-lo nem alterar a política de execução do PowerShell.

**Como saber se deu certo:** a instalação termina sem erro, com FastAPI, Uvicorn,
httpx e Pydantic instalados. Não copie a pasta `.venv` de outra máquina.

## 7. Inicie a API de simplificação

Com o Ollama em execução, use o terminal **na raiz do repositório**:

### macOS ou Linux

```sh
.venv/bin/python -m uvicorn main:app --app-dir ai-agent --host 127.0.0.1 --port 8000
```

### Windows — PowerShell

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir ai-agent --host 127.0.0.1 --port 8000
```

Deixe esse terminal aberto. A mensagem de inicialização deve indicar a API na
porta **8000**. Para encerrá-la depois, pressione `Ctrl+C`.

Abra [a verificação de saúde](http://localhost:8000/health) no navegador. O resultado
esperado é:

```json
{"status":"available","ollama":true,"model":true}
```

Esse resultado confirma que a API alcança o Ollama e encontra o modelo. A geração
de uma resposta será verificada no próximo passo.

Opcionalmente, abra [a documentação interativa da API](http://localhost:8000/docs).
Em `POST /simplify`, clique em **Try it out**, envie o exemplo abaixo e depois
clique em **Execute**:

```json
{"texto":"A implementação de políticas públicas exige articulação entre diferentes instituições."}
```

Uma resposta bem-sucedida contém a propriedade `texto_simplificado`.

As portas estão fixadas na implementação: **8000 para a API Waves** e
**11434 para o Ollama**. Mudar apenas a porta do comando de inicialização faz
a extensão perder a conexão com o serviço.

## 8. Faça o primeiro uso completo

1. Mantenha o Ollama e a API Python em execução.
2. Abra um site de notícias, blog ou outra página HTTP/HTTPS com texto selecionável.
3. Selecione um parágrafo curto, com pelo menos **10 caracteres**.
4. No gatilho flutuante, clique em **Simplificar texto**.
5. Aguarde o modal exibir o texto simplificado.
6. Clique em **Traduzir este texto para Libras** para abrir o avatar com esse resultado.
7. Teste pausa, repetição, velocidade, arraste, redimensionamento e minimizar/restaurar.
8. Clique no ícone Waves e altere fonte, tamanho do texto e posição do widget.
9. Desligue o switch principal: as interfaces abertas devem desaparecer.

**O que esperar dos indicadores:** “IA conectada” exige a verificação de saúde.
“VLibras: não verificado” é normal antes de carregar o player na aba atual;
o indicador não fica verde apenas porque a extensão foi instalada.

Não use páginas internas do navegador, lojas de extensões ou PDFs para o primeiro
teste. Texto dentro de iframes, canvas e campos editáveis também fica fora do
fluxo inicial de seleção. Alguns sites podem impedir o carregamento do avatar.

## 9. Como usar novamente em outro dia

Você não precisa reinstalar as dependências nem recarregar a extensão sem motivo.

1. Abra o Ollama, ou inicie `ollama serve` se necessário.
2. Na raiz do repositório, execute novamente o comando da API da etapa 7.
3. Abra o navegador e use o Waves.

Para usar somente Libras, basta a extensão carregada e uma conexão com a internet.

## 10. Como atualizar depois de um novo pull

Na raiz do repositório:

```sh
git pull
cd extension
npm install
npm run build
cd ..
```

Atualize também as dependências Python, com a API parada:

**macOS ou Linux:**

```sh
.venv/bin/python -m pip install -r ai-agent/requirements.txt
```

**Windows — PowerShell:**

```powershell
.\.venv\Scripts\python.exe -m pip install -r ai-agent\requirements.txt
```

Depois, reinicie a API. Na página de extensões do navegador, clique no botão
**Recarregar** do Waves e recarregue os sites onde pretende usá-lo. Mantenha a
pasta `extension/dist` no mesmo local em que foi carregada.

## 11. Solução de problemas

| Sintoma | O que conferir |
| --- | --- |
| `npm` ou `node` não encontrado | Instale Node.js com npm e reabra o terminal |
| `python3`, `py` ou `python` não encontrado | Revise a instalação do Python e o PATH; confira o comando correspondente ao seu sistema |
| Erro ao criar `.venv` no Linux | Instale o suporte a `venv` do Python pelo gerenciador da sua distribuição |
| Build informa `Cannot find package 'esbuild'` | Execute `npm install` dentro de `extension/` |
| Build informa recurso VLibras alterado/ausente | Confira se o pull trouxe `extension/avatar/` completo e sem alterações locais; não ignore a verificação de integridade |
| Navegador informa manifesto ausente | Execute o build e selecione `extension/dist`, onde está o manifesto gerado |
| Nenhum gatilho aparece | Recarregue o site, confira se Waves está ligado e selecione texto fora de campos editáveis em uma página comum |
| Botão Simplificar indisponível | Selecione pelo menos 10 caracteres |
| `/health` não abre | Inicie a API na porta 8000 e confira o terminal por erros |
| `/health` mostra `ollama: false` | Abra/inicie o Ollama e confira se ele responde em `localhost:11434` |
| `/health` mostra `ollama: true` e `model: false` | Execute `ollama pull llama3.2:1b` e confira `ollama list` |
| Porta 8000 ocupada | Confira se a API já está aberta em outro terminal; encerre sua instância anterior antes de iniciar outra |
| Simplificação demora ou falha | Comece com um parágrafo curto; confira logs da API e disponibilidade do Ollama. A extensão aguarda até 25 segundos |
| Avatar não aparece | Confira a internet, tente outra página e verifique suporte a WebGL/aceleração gráfica; o site pode bloquear o iframe |
| Mudanças do código não aparecem | Refaça o build, recarregue a extensão e depois o site |

Para relatar um problema, informe sistema operacional, versão do navegador, etapa
que falhou e mensagem exibida. Inclua os erros do terminal da API quando o problema
envolver simplificação; não é necessário compartilhar textos pessoais selecionados.

## Pronto para uso

- [ ] O build terminou e `extension/dist/manifest.json` existe.
- [ ] A extensão aparece habilitada no navegador.
- [ ] O avatar traduz um trecho selecionado.
- [ ] O modelo `llama3.2:1b` aparece em `ollama list`.
- [ ] `/health` retorna `status: available`.
- [ ] O modal apresenta uma simplificação gerada pela API.
- [ ] As preferências continuam salvas depois de fechar e reabrir o popup.

Os testes automatizados são opcionais para quem só quer usar a extensão. As
instruções estão no [README técnico](extension/README.md#testes); esses testes
usam uma API de teste na porta 8000, portanto sua API real deve estar parada
antes de executar a suíte E2E.
