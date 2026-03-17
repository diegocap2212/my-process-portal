

## Dashboard de Gestão — Dados dos Reports Diários

### O que temos no Firebase

Cada report tem dados ricos que podemos transformar em métricas:

- **5 checkpoints booleanos**: cone, pdti, parado, wipEpic, wipUs (Sim/Não por squad/SM/dia)
- **Textos**: oQue, problemas, acoes (contexto qualitativo)
- **Metadados**: SM, squad, data

### Sugestões de Dashboard

**1. Visão Geral (cards KPI)**
- Total de reports no período
- % de "Sim" por checkpoint (ex: "78% dos squads com cone atualizado")
- Squads com mais problemas reportados (contagem de `parado = true`)

**2. Evolução temporal (gráficos de linha)**
- Taxa de conformidade por checkpoint ao longo das semanas
- Frequência de reports por SM (quem está preenchendo consistentemente)

**3. Heatmap por Squad × Checkpoint**
- Tabela colorida mostrando a "saúde" de cada squad nos 5 checkpoints
- Verde = últimos reports todos "Sim", Vermelho = predominância de "Não"

**4. Ranking de problemas**
- Squads com mais dias de item parado (`parado = true`)
- WIP fora de controle (wipEpic/wipUs = false frequente)

**5. Filtros**
- Por SM, por squad, por período (semana/mês)

### Implementação técnica

**Nova rota**: `/dashboard`

**Novos arquivos**:
- `src/pages/Dashboard.tsx` — página principal do dashboard
- `src/components/dashboard/KPICards.tsx` — cards com métricas resumidas
- `src/components/dashboard/CheckpointChart.tsx` — gráfico de evolução (Recharts, já instalado)
- `src/components/dashboard/SquadHealthTable.tsx` — heatmap squad × checkpoint
- `src/components/dashboard/DashboardFilters.tsx` — filtros de SM/squad/período
- `src/hooks/useDashboardData.ts` — hook que processa os reports em métricas

**Arquivos modificados**:
- `src/App.tsx` — adicionar rota `/dashboard`
- `src/components/layout/Navbar.tsx` — adicionar link pro dashboard

**Dados**: Reutiliza o `useReports()` existente (já faz `onSnapshot` dos reports). O hook `useDashboardData` recebe os reports e computa as métricas com `useMemo`.

**Libs**: Recharts já está disponível (usado em `chart.tsx`). Nenhuma dependência nova.

### Proteção de acesso

Como removemos o auth, o dashboard ficará acessível a todos. Se quiser restringir depois, podemos adicionar uma senha simples ou auth.

