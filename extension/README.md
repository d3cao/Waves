# Waves — extensão de acessibilidade

Extensão Manifest V3 com popup de preferências, gatilho de seleção, modal de texto
simplificado e avatar VLibras. Interface em português, fontes locais, Shadow DOM,
controles por teclado e alvos de 48 px.

## Instalar para desenvolvimento

Requer Node.js 22 ou superior e npm (ou pnpm).

```sh
cd extension
npm install
npm run build
```

No Chrome, abrir `chrome://extensions`; no Edge, `edge://extensions`. Ativar o
modo de desenvolvedor e carregar **a pasta `extension/dist`** como extensão sem
compactação. Após atualizar o build, recarregar a extensão e as páginas já abertas.

Para simplificação, executar a API existente com Ollama e `llama3.2:1b` instalados:

```sh
cd ai-agent
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Selecionar texto em uma página HTTP/HTTPS e escolher uma ação. A API local não
precisa de CORS aberto: as chamadas partem do service worker com permissão fixa
para localhost. Sites internos do navegador, lojas de extensão, PDFs, conteúdo
em canvas e iframes não fazem parte do suporte inicial.

## Preferências e status

Preferências em `chrome.storage.local`: ligado, canto inferior direito, velocidade
1x, dislexia desligada e texto 18 px. Alterações chegam às abas abertas. O switch
master encerra a interface e descarta respostas pendentes. Reativar não reproduz
automaticamente texto anterior.

`GET /health` verifica Ollama e a presença do modelo sem inferência. “IA conectada”
indica essa disponibilidade. VLibras aparece conectado somente após prontidão da
instância da aba ativa. Não há status verde presumido.

O widget tem progresso somente de leitura, aprovado após auditoria da API Unity.
Não há busca temporal. Arraste e resize funcionam por ponteiro ou setas nos botões
próprios. Velocidade do badge alterna 0.5x, 1x e 1.5x para a instância atual.

## Testes

```sh
cd extension
npm test
npx playwright install chromium
npm run test:e2e
# Inclui serviços públicos reais; depende de rede e WebGL:
WAVES_LIVE=1 npm run test:e2e
```

Os testes E2E iniciam uma página local em 127.0.0.1:8765 e uma **API de teste** em
localhost:8000. Pare sua API de desenvolvimento antes de executá-los. São usados
perfis Chromium temporários; seu perfil pessoal não é acessado.

O teste online é separado dos testes determinísticos: não equivale a uma revisão
humana da qualidade linguística da tradução. Não há mock de avatar no produto.

```sh
# Na raiz do repositório, com requirements.txt instalado:
python -m unittest discover -s ai-agent -p 'test_*.py'
```

Capturas para revisão ficam em `extension/test-results/`. Consulte
[especificação visual](docs/design.md) e [evidências VLibras](docs/vlibras.md).
O [relatório de validação](docs/validation.md) registra os testes realizados,
capturas preservadas e as pendências de Edge, Ollama real e aprovação visual.
Baselines visuais só devem ser registradas após aprovação das capturas.

`npm run package` gera `test-results/waves-extension.zip` usando o utilitário zip.
O build tem aproximadamente 20 MB por incluir localmente a engine Unity/WASM.
Nenhuma publicação ou instalação em loja é executada.

## Recursos e licenças

- Marca Waves: SVG reconstruído da referência do projeto.
- Inter: Google Fonts, licença SIL-OFL em `assets/fonts/Inter-LICENSE.txt`.
- OpenDyslexic: Abbie Gonzalez, versão de
  [48218028cc8bd9f4f244cd4ce4049e6c879d4d1a](https://forge.hackers.town/antijingoist/opendyslexic/commit/48218028cc8bd9f4f244cd4ce4049e6c879d4d1a),
  licença SIL-OFL em `assets/fonts/OpenDyslexic-LICENSE.txt`.
- VLibras: LGPL-3.0, versão e atribuição em `docs/vlibras.md`; licenças em `avatar/`.

Não se alega eficácia clínica do modo dislexia. Os nomes internos das famílias
CSS são aliases; os arquivos das fontes não foram modificados.
