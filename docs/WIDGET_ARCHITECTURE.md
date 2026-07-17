# Widget Calead — arquitetura

## Separação host / guest

| Camada | Responsabilidade |
|--------|------------------|
| `public/embed.js` | Host: cria iframe, posição, **altura fixa**, reveal anti-flicker |
| `src/lib/widget-protocol.ts` | Contrato tipado das mensagens `postMessage` |
| `src/components/WidgetFrame.tsx` | Guest bridge: transparência + `calead:ready` |
| `src/components/ChatWidget.tsx` | Orquestração de chat / modo bar↔panel |
| `packages/calead-ui` | UI pura (barra, painel, bolhas) — sem API |

## Regras anti-flicker

1. Iframe já nasce na altura final da barra (`112px`) — sem jump 64→conteúdo
2. Host fica `opacity:0` até `calead:ready` (ou failsafe no `iframe.load`)
3. Chips de sugestão usam **slot reservado** — hover só muda opacity, sem reflow
4. Sem `ResizeObserver` / sem `calead:height` no modo bar
5. Transição de `height` só no expand do painel

## Mensagens

- `calead:ready` — iframe pintou; host revela
- `calead:chrome` `{ mode: "bar" | "panel" }` — geometria atômica
- Legacy `calead:mode` ainda aceito no embed

## Escala futura

Próximos passos naturais (quando precisar):

1. Extrair embed para `packages/calead-embed` (TS → IIFE build)
2. Route group `(widget)` com layout de fontes mais leve
3. Tokens de tema via CSS variables (`primaryColor` em `WidgetConfig`)
4. Features (`voice/`, `analytics/`) ao lado de `ChatWidget`
