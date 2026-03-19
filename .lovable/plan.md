

## Refinamento do Dashboard — Foco em Insumos Executivos

### O que será removido

1. **KPI Cards** (cone, pdti, etc.) — métricas de conformidade não refletem a realidade; Cone só se aplica a Locavia, PDTI está travado
2. **Gráfico de Evolução Semanal** (CheckpointChart) — conformidade semanal não é útil
3. **Tabela Saúde dos Squads** (SquadHealthTable) — preenchimento não agrega neste momento

### O que permanece e será aprimorado

- **Filtros** — continuam funcionando
- **Radar de Gargalos** — mantido, ajustado para não considerar Cone em squads legado nem PDTI (travado)
- **Resumo Executivo por SM** — mantido e aprimorado
- **Detalhes dos Reports** — mantido
- **Export PDF** — mantido

### O que será adicionado/melhorado

#### 1. Painel de Contexto Rápido (substituindo KPI Cards)
Cards simples no topo mostrando:
- **Total de reports** no período (por SM)
- **Gargalos ativos** (contagem de alertas críticos/atenção)
- **Último report** de cada SM (data, indicando frequência)

#### 2. Resumo Executivo aprimorado
- Remover "% conformidade" (não é confiável)
- Adicionar seção **"O que aconteceu"** — agrega os textos `oQue` mais recentes por squad dentro de cada SM
- Melhorar hierarquia visual: problemas + ações + contexto numa narrativa mais clara para reportar à liderança
- Adicionar contagem de gargalos ativos por SM

#### 3. Radar de Gargalos contextualizado
- Filtrar: Cone só aparece como gargalo para squads Locavia
- Remover PDTI do radar (travado)
- Manter parado, wipEpic, wipUs para todos

### Arquivos modificados

| Ação | Arquivo | Mudança |
|------|---------|---------|
| Editar | `src/pages/Dashboard.tsx` | Remover imports/renders de KPICards, CheckpointChart, SquadHealthTable |
| Editar | `src/components/dashboard/ExecutiveSummary.tsx` | Remover conformidade, adicionar "oQue" agregado, contagem de gargalos |
| Editar | `src/hooks/useDashboardData.ts` | Ajustar bottleneck: Cone só Locavia, remover PDTI; adicionar `oQue` ao SmSummary |
| Novo | `src/components/dashboard/ContextCards.tsx` | Cards de contexto rápido (total reports, gargalos ativos, último report por SM) |

### Fluxo visual atualizado

```text
┌─────────────────────────────────────────┐
│  Filtros + [Exportar PDF]               │
├─────────────────────────────────────────┤
│  CONTEXTO RÁPIDO                        │
│  [X reports] [Y gargalos] [Último: ...]│
├─────────────────────────────────────────┤
│  🚨 RADAR DE GARGALOS                  │
│  (sem Cone p/ legado, sem PDTI)         │
├─────────────────────────────────────────┤
│  RESUMO EXECUTIVO POR SM                │
│  Problemas · Ações · O que aconteceu    │
│  Squads agrupados por tipo de projeto   │
├─────────────────────────────────────────┤
│  DETALHES DOS REPORTS (expansível)      │
└─────────────────────────────────────────┘
```

