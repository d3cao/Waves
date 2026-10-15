# Validação da implementação

## Resultado

22 casos distintos aprovados na implementação final:

| Grupo | Casos | Resultado |
| --- | ---: | --- |
| Node: preferências, geometria, API, falhas e ponte Unity | 7 | Aprovados |
| FastAPI: saúde, modelo ausente, indisponibilidade e contrato /simplify | 5 | Aprovados |
| Navegador: popup, seleção, modal, estados, sincronização e VLibras | 10 | Aprovados |

Ambiente de navegador: Chrome for Testing/Chromium 149.0.7827.55, Playwright
1.61.1, macOS ARM64. Perfil temporário isolado. A suíte final foi executada em
grupos direcionados após correções; os comandos de teste completos permanecem
disponíveis no README. Não há testes de navegador silenciosamente ignorados
na contagem acima: o caso online foi executado explicitamente com `WAVES_LIVE=1`.

Também conferidos: build esbuild, integridade dos quatro recursos Unity contra
blobs Git do commit upstream, assinaturas das fontes WOFF e `git diff --check`.

## Cobertura observada

- Popup: fonte local, persistência, posição, dislexia e velocidades.
- Controles do popup medidos com no mínimo 48 px de altura.
- CSS da página deliberadamente agressivo não altera os controles Waves.
- Modal com resultado real do contrato HTTP, captura/restauração de foco,
  Tab/Shift+Tab, Escape, isolamento temporário do corpo da página com inert.
- Seleção curta, erro 422 e texto semelhante a HTML exibido sem execução.
- Desativação durante processamento sem reabertura por resposta tardia.
- Preferências propagadas para duas abas; fonte do site preservada.
- Viewports 1366×768, 1920×1080 e 375×667; zoom de página real de 200% via
  chrome.tabs.setZoom, texto 24 px e OpenDyslexic carregada.
- Preferências corrompidas e seleção em conteúdo editável.
- Widget: progresso sem input, arraste por mouse, movimento e resize por teclado,
  minimizar/restaurar e fechamento.
- VLibras online: engine local pronta, progresso por glosas maior que zero,
  avatar renderizado, pausa confirmada por evento, mudança para 1.5x e repetição
  com retorno ao estado de reprodução. Nenhum erro de CSP nesse caso.

Os testes determinísticos usam uma API de simplificação local de teste. Não foi
executada uma inferência real do Ollama: a rota de saúde e o contrato da API foram
validados com respostas controladas. A qualidade linguística da simplificação e
da tradução exige avaliação com usuários e especialistas, fora desta verificação.

## Evidências para revisão

As imagens foram inspecionadas visualmente. São candidatas para revisão humana,
não baselines oficialmente aprovadas. A aparência da página de teste, incluindo
controles magenta, é proposital para verificar isolamento e não pertence ao Waves.

- [Popup](evidence/popup.png)
- [Gatilho](evidence/toolbar.png)
- [Modal](evidence/modal.png)
- [Modal estreito](evidence/modal-narrow.png)
- [Texto grande com dislexia](evidence/modal-large-dyslexia.png)
- [Zoom 200%, conteúdo rolado até o CTA](evidence/modal-200-percent.png)
- [Widget e controles](evidence/widget.png)
- [Avatar real em execução](evidence/widget-live.png)

## Limites e pendências explícitos

- **Edge não estava instalado**: compatibilidade pretendida com Chromium/MV3,
  mas ainda falta a execução manual da matriz no Edge.
- Avaliação visual humana e criação das baselines de regressão ainda pendentes.
- Uma página CSP restritiva foi validada para gatilho/modal. O carregamento do
  avatar em sites que bloqueiam frames pode falhar; o widget apresenta timeout/erro.
- O limite de contexto de 1024 tokens do backend existente não foi alterado;
  textos longos não são truncados pela extensão. A qualidade de inferência para
  esses textos precisa de validação própria com o modelo instalado.
- Não houve publicação em loja, revisão de loja ou certificação de acessibilidade.
