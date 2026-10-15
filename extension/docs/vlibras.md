# Integração VLibras: evidências e limites

Upstream: https://github.com/spbgovbr-vlibras/vlibras-web-browsers

Commit inspecionado e origem dos binários:
`d292d369419196b6e8ba826d674f5d3b4bcefa9a` (manifesto upstream: 7.12.2).

## Capacidades verificadas no código

| Operação | Evidência upstream |
| --- | --- |
| Tradução | `src/core/actions/index.ts`: POST `{text}` para `/translate`, resposta textual ou `{traducao}` |
| Reproduzir/pausar/repetir | `src/player/actions/index.ts` e `src/player/constants/unity.ts`: playNow, setPauseState, stopAll |
| Velocidade | setSlider, pelo mesmo canal Unity |
| Prontidão | on_load_player |
| Reprodução | on_playing_state_change |
| Progresso da tradução | counter_gloss: contagem de glosas, não tempo decorrido |
| Progresso do carregamento | update_progress: não usar como progresso da tradução |
| Busca na animação | Sem comando exposto no enum/ações inspecionados; barra upstream tem role progressbar sem input |

Busca na animação foi substituída por progresso somente de leitura **com aprovação
explícita do usuário**. A ausência de uma operação pública não prova que um fork
da engine nunca poderia implementá-la; tal fork está fora desta entrega.

Links reproduzíveis:

- [Comandos](https://github.com/spbgovbr-vlibras/vlibras-web-browsers/blob/d292d369419196b6e8ba826d674f5d3b4bcefa9a/src/player/constants/unity.ts)
- [Barra oficial](https://github.com/spbgovbr-vlibras/vlibras-web-browsers/blob/d292d369419196b6e8ba826d674f5d3b4bcefa9a/src/widget/components/controls/progress-bar.tsx)
- [Eventos](https://github.com/spbgovbr-vlibras/vlibras-web-browsers/blob/d292d369419196b6e8ba826d674f5d3b4bcefa9a/src/player/providers/events.tsx)
- [Manifesto oficial com sandbox Unity](https://github.com/spbgovbr-vlibras/vlibras-web-browsers/blob/d292d369419196b6e8ba826d674f5d3b4bcefa9a/extensions/chrome/manifest.json)

## Empacotamento Waves

`unity-loader.js` e os três binários `.unityweb` são distribuídos localmente,
sem modificações. `playerweb.json` deriva do upstream, com identificação visual
do fundo Waves. `index.html` e `bridge.js` são novos: a ponte aceita apenas os
comandos necessários, verifica janela de origem e canal por instância.

O player fica em página sandbox, sem acesso às APIs privilegiadas da extensão.
O restante da extensão usa scripts locais sem eval. A engine Unity antiga precisa
de eval/WASM no sandbox, como no manifesto oficial. Não se carrega o módulo de
interface VLibras remoto nem seu sistema de analytics.

Os bundles de sinais são dados remotos; a tradução envia o texto escolhido ao
serviço público VLibras. A simplificação envia somente a API local. Nenhuma
seleção é transmitida automaticamente, persistida ou registrada em logs.

Limites: CSP do site pode impedir o iframe; Shadow DOM não contorna frame-src.
O widget informa falha/timeout e permite nova tentativa. Sem WebGL, não haverá
avatar. Uma conexão de rede é necessária para tradução e sinais.

A licença LGPL-3.0 do upstream e GPL-3.0 estão em `avatar/`. Os fontes completos e
o histórico das partes redistribuídas permanecem acessíveis pelo commit acima;
os arquivos são substituíveis antes do build. Este pacote é para testes locais;
publicação em loja exige validação própria, incluindo dependências Unity e licenças.
