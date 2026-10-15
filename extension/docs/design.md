# Referência visual Waves

Implementação baseada no briefing `briefing_para_ia_frontend_e_ui_ux.md` e na prancha
`WhatsApp Image 2026-09-24 at 16.14.28.jpeg`, fornecidos pelo responsável pelo projeto.
A prancha é referência de composição; suas quatro molduras de apresentação, barras
fictícias do navegador, títulos numerados e amostras de controles não são produto.

## Decisões confirmadas

- Chrome/Edge, Manifest V3, JavaScript e CSS, sem framework de interface.
- Preservar a composição visual, incluindo CTA do modal alinhado à esquerda.
- Alvos interativos de pelo menos 48 px; controles apenas com ícone: 48 × 48 px.
- Inter e OpenDyslexic locais. Modo dislexia afeta apenas a interface Waves.
- “Voltar ao original” fecha o modal e devolve foco ao trecho selecionado.
- Desativar remove interfaces e encerra o player imediatamente. Resultados pendentes
  são descartados; o processamento já iniciado no servidor pode continuar.
- **Alteração aprovada durante a implementação:** progresso somente de leitura,
  alimentado pelos eventos de glosas do VLibras; não há scrubber interativo.

## Tokens

Fonte única da implementação: `src/shared/styles.css`.

| Token | Valor |
| --- | --- |
| Primária / hover / pressionado | #1D4ED8 / #1E40AF / #0F172A |
| Texto / secundário | #0F172A / #475569 |
| Superfície / auxiliar | #FFFFFF / #F8FAFC |
| Divisórias / limites de controles | #E2E8F0 / #64748B |
| Header do modal / avatar | #F0F9FF / #EFF6FF |
| Foco | #2563EB, 3 px, offset 2 px |
| Sucesso / falha | #15803D / #B91C1C, acompanhados de texto |
| Overlay | rgba(15,23,42,.32) |
| Sombra | 0 12px 28px rgba(15,23,42,.16), 0 2px 6px rgba(15,23,42,.08) |
| Raio de cards / controles | 12 px / 8 px |
| Espaçamento | 4, 8, 12, 16, 24 e 32 px |
| Interface / auxiliar / títulos / marca | 14/21, 12/18, 16/24, 18/24 px |
| Pesos | 400 e 600 |
| Simplificado | 18/30 px; ajuste 16–24 px; entrelinha 1.667 |

As famílias internas `WavesInter` e `WavesDyslexic` evitam colisão com fontes do site.
A marca foi reconstruída como SVG, sem gerar uma nova identidade. O desenho do
personagem da prancha não substitui o avatar real.

## Componentes e estados

| Componente | Composição | Estados |
| --- | --- | --- |
| Gatilho | Azul Libras + secundário contornado; padding/gap 8 px; max 480 px; margem 16 px | Default, hover, pressionado, foco; simplificar indisponível com menos de 10 caracteres |
| Modal | Grupo 720 px, original acima, card 560 px, header claro, CTA à esquerda | Espera, resultado, erro com nova tentativa; Escape e retorno ao original |
| Widget | Inicial 360×440 px; mínimo 320×400 px se houver espaço; margem 16 px | Carregando, pronto, reproduzindo, pausado, erro, minimizado |
| Popup | 360 px, limite de altura 600 px, rolagem vertical | Preferências salvas, falha de gravação, saúde disponível/indisponível |
| Switch | Trilho visual 48×28 px dentro de alvo 48×48 px | Desligado, ligado e foco |
| Velocidade | Radio group nativo 0.5x/1x/1.5x; badge cíclico no widget | Selecionado, foco, indisponível durante carregamento |
| Progresso | Barra com nome acessível e percentual por glosas | Atualizações reais; nunca simuladas nem tratadas como segundos |

O gatilho empilha ações em viewports estreitas. O modal tem rolagem interna e
quebra de palavras longas. O widget encolhe ao espaço disponível; o resize tem
área própria para não sobrepor os controles. Arraste/resize também aceitam setas
em passos de 10 px. Minimizar pausa, mantém header e não retoma automaticamente.

## Validação visual

Capturas em `test-results/` são **candidatas para revisão**, não baselines aprovadas.
Comparar os quatro componentes lado a lado com os recortes da prancha, considerando
as adaptações documentadas: alvos 48 px, avatar real, resize e progresso de leitura.

Após aprovação humana, executar `WAVES_VISUAL=1 npx playwright test --update-snapshots`
para registrar baselines. Futuras execuções: `npm run test:visual`. Tolerância de
regressão: 0,5% de pixels, com navegador, fontes, escala e textos fixos. O modo
visual compara popup e modal; o widget animado exige mascarar somente o canvas
antes de adicionar uma baseline, preservando header, controles e moldura.

Matriz: 1366×768, 1920×1080 e 375×667; popup 360 px; zoom de 200%; dislexia;
serviços conectados/desconectados; navegação por teclado e contraste. Dados reais
de tradução não devem ser comparados como se fossem conteúdo determinístico.
