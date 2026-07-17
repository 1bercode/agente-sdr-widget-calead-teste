# Calead Design System (`@calead/ui`)

Pacote de componentes React + tokens de design usado pelo widget, dashboard e integração com **Claude Design**.

## Estrutura

```
packages/calead-ui/
├── src/
│   ├── tokens/          # cores, tipografia, raios
│   ├── components/      # Button, Input, Card, Chat*, Layout*
│   └── styles.css       # Tailwind base do Storybook
├── stories/             # Storybook (obrigatório pro /design-sync)
├── .storybook/
└── tailwind.preset.ts   # preset consumido pelo app Next.js
```

## Componentes disponíveis

| Componente | Uso |
|---|---|
| `Button` | Ações primárias/secundárias |
| `Input` / `Textarea` | Formulários |
| `Card` | Seções do dashboard |
| `Badge` / `Alert` | Status e avisos |
| `ChatPanel`, `ChatHeader`, `ChatBar`, `ChatBubble`, `ChatComposer` | Widget embutível |
| `AppShell`, `PageHeader`, `EmptyState`, `CodeBlock` | Layout dashboard |

## Rodar Storybook localmente

```bash
npm install
npm run storybook
```

Abre em http://localhost:6006 — use para validar componentes antes de sincronizar.

## Conectar ao Claude Design (`/design-sync`)

O Claude Design lê **Storybook** ou **pacote npm** de design system. Este repo já está estruturado pros dois.

### Passo a passo

1. Instale o [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (CLI).
2. Abra o terminal **dentro do pacote de design system**:

   ```bash
   cd packages/calead-ui
   claude
   ```

3. Rode o comando de sync:

   ```
   /design-sync
   ```

4. Aprove o plano (`planId`) quando o Claude listar os arquivos a enviar.
5. No [Claude Design](https://claude.ai/design), selecione sua organização — o design system **Calead** aparecerá com os componentes reais.

### Dicas pro Claude Design

- Mencione componentes pelo nome: *"Use o Calead ChatPanel expandido"* ou *"Primary Button"*.
- Tokens de cor: `calead-accent` (#4F46E5), `calead-bg` (#0F172A), `calead-accentSoft`.
- Prototipe o widget com a story **Calead/Chat → ExpandedPanel**.
- Prototipe o dashboard com **Calead/Card** e **Calead/Button**.

### Fluxo de trabalho recomendado

1. Prototipe UI no Claude Design usando componentes Calead.
2. Exporte / sincronize mudanças via `/design-sync` de volta ao repo.
3. O app Next.js importa de `@calead/ui` — uma mudança no pacote reflete no widget e dashboard.

## Usar no app Next.js

```tsx
import { Button, ChatPanel, ChatBubble } from "@calead/ui";
```

O `tailwind.config.ts` da raiz já estende o preset `@calead/ui`.
