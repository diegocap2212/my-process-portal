

## Dashboard MVP — Resumo Executivo + Radar de Gargalos + Export

### Contexto
O dashboard atual mostra KPIs e heatmap, mas falta transformar os dados qualitativos (textos dos SMs) em outputs acionáveis para venda de trabalho, escalação de problemas e visibilidade de gargalos. Também precisamos atualizar o time (remover Elizabeth) e categorizar squads por tipo de projeto.

### Mudanças no modelo de dados

**Atualizar `src/data/squads.ts`**:
- Remover Elizabeth
- Adicionar categorias de projeto (Locavia, Sobrevivência, Sustentação)
- Estrutura: `SM_SQUADS` com tipo de projeto por squad

```text
Edmilson:
  Locavia → Scania
  Sobrevivência → Contratos, Plataforma

Gabriela:
  Sustentação → Canal Indireto
  Locavia → Crédito, Portal de Vendas

Rafael:
  Locavia → Nivus (Portal Autoatendimento), Optimus (Contratos)
```

### Novos componentes do Dashboard

#### 1. Resumo Executivo por SM (`ExecutiveSummary.tsx`)
- Card por SM com visão consolidada:
  - Quantidade de reports no período
  - Status geral dos checkpoints (% conformidade)
  - Últimos problemas reportados (agregados dos textos `problemas`)
  - Últimas ações tomadas (do campo `acoes`)
  - Squads com alertas (baseado nos checkpoints vermelhos)
- Agrupado por tipo de projeto (Locavia / Sobrevivência / Sustentação)

#### 2. Radar de Gargalos (`BottleneckRadar.tsx`)
- Identifica automaticamente squads com problemas recorrentes:
  - **Itens parados**: squads com `parado = true` em >50% dos reports
  - **WIP descontrolado**: `wipEpic` ou `wipUs = false` frequente
  - **Cone desatualizado**: `cone = false` recorrente
- Visual: cards de alerta ordenados por severidade (vermelho → amarelo)
- Mostra o texto do problema mais recente de cada squad afetado

#### 3. Export para PDF (`DashboardExport.tsx`)
- Botão "Exportar Relatório" no topo do dashboard
- Gera PDF com:
  - Header com período e filtros aplicados
  - KPIs resumidos
  - Tabela de saúde dos squads
  - Resumo executivo por SM
  - Lista de gargalos ativos
- Usa a lib `jspdf` + `html2canvas` (ou reportlab via script)

### Arquivos

| Ação | Arquivo |
|------|---------|
| Editar | `src/data/squads.ts` — remover Elizabeth, adicionar categorias |
| Novo | `src/components/dashboard/ExecutiveSummary.tsx` |
| Novo | `src/components/dashboard/BottleneckRadar.tsx` |
| Novo | `src/components/dashboard/DashboardExport.tsx` |
| Editar | `src/hooks/useDashboardData.ts` — adicionar métricas de gargalo e resumo |
| Editar | `src/pages/Dashboard.tsx` — integrar novos componentes |
| Editar | `src/components/dashboard/SquadHealthTable.tsx` — agrupar por tipo de projeto |

### Fluxo visual do Dashboard (de cima para baixo)

```text
┌─────────────────────────────────────────┐
│  Filtros + [Exportar Relatório PDF]     │
├─────────────────────────────────────────┤
│  KPI Cards (existente)                  │
├─────────────────────────────────────────┤
│  🚨 RADAR DE GARGALOS                  │
│  Cards de alerta por severidade         │
│  Squad X: parado 80% | último problema │
├─────────────────────────────────────────┤
│  Gráfico de Evolução (existente)        │
├─────────────────────────────────────────┤
│  RESUMO EXECUTIVO POR SM                │
│  ┌─ Edmilson ──────────────────────┐    │
│  │ Locavia: Scania                 │    │
│  │ Sobrev.: Contratos, Plataforma  │    │
│  │ Problemas: ...  Ações: ...      │    │
│  └─────────────────────────────────┘    │
│  ┌─ Gabriela ─────────────────────┐    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  Saúde dos Squads (existente, agrupado) │
├─────────────────────────────────────────┤
│  Detalhes dos Reports (existente)       │
└─────────────────────────────────────────┘
```

