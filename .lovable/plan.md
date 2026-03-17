

## Melhorias no Dashboard: Detalhes textuais, imagens e dados do Rafael

### Problemas identificados

1. **Dados do Rafael podem não aparecer** — O dashboard filtra por `SM_SQUADS` hardcoded. Se os reports do Rafael no Firebase usarem nomes de SM ou squad ligeiramente diferentes (ex: "rafael" minúsculo, ou um squad que não está na lista), os dados são ignorados. Precisamos também considerar squads que vêm do Firebase mas não estão no `SM_SQUADS`.

2. **Textos qualitativos não aparecem** — Os campos `oQue`, `problemas`, `acoes` e os textos dos checkpoints (`coneText`, `pdtiText`, etc.) não são exibidos em lugar nenhum do dashboard.

3. **Imagens não são exibidas** — O campo `images[]` dos reports é completamente ignorado.

### Plano de implementação

#### 1. Tornar o dashboard resiliente a dados dinâmicos do Firebase
- No `useDashboardData.ts`, além de iterar `SM_SQUADS`, também incluir combinações SM/Squad que existem nos reports mas não estão no mapa hardcoded
- Isso garante que qualquer report do Rafael (ou outro SM) que use nomes diferentes apareça

#### 2. Novo componente: `ReportDetailsList.tsx`
- Seção abaixo da tabela de saúde dos squads
- Lista os reports filtrados em cards expansíveis, ordenados por data (mais recente primeiro)
- Cada card mostra:
  - **Header**: SM, Squad, Data (com cor do SM)
  - **Checkpoints**: Status (Sim/Não) + texto explicativo de cada checkpoint
  - **Contexto**: oQue, problemas, acoes
  - **Imagens**: Thumbnails clicáveis que abrem em modal/lightbox
- Paginação simples (10 por vez com "Carregar mais")

#### 3. Novo componente: `ImageModal.tsx`
- Modal simples para visualizar imagens em tamanho maior ao clicar nos thumbnails

#### 4. Atualizar `Dashboard.tsx`
- Passar `filtered` (reports filtrados) para o novo `ReportDetailsList`
- Importar e renderizar o novo componente

### Arquivos

| Ação | Arquivo |
|------|---------|
| Novo | `src/components/dashboard/ReportDetailsList.tsx` |
| Novo | `src/components/dashboard/ImageModal.tsx` |
| Editar | `src/hooks/useDashboardData.ts` — incluir SM/squads dinâmicos do Firebase |
| Editar | `src/pages/Dashboard.tsx` — adicionar seção de detalhes |

