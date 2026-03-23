

## Plano: Trazer a Visão Completa do Dashboard para Dentro do Portal

### O que muda

Quando o SM clica em um squad (ex: Scania), ao invés de ver apenas a tabela resumida, ele verá a **mesma visão do dashboard Vercel**: KPI cards (Escopo, Entregas, WIP, Lead Time), gráfico de Burndown & Projeção do Cone, Throughput Mensurado e Balanço do Fluxo — tudo filtrado para aquele time específico.

### Abordagem

Replicar a lógica do `useDashboardData.ts` do Vercel dentro do portal, usando os mesmos dados brutos que já buscamos via Edge Function. Os gráficos usarão **Recharts** (mesma lib do dashboard Vercel). Não precisa de API nova — os dados já estão disponíveis.

### Implementação

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| Novo | `src/hooks/useSquadDashboard.ts` | Hook que recebe `JiraItem[]` filtrados por team e calcula: escopo total, entregas, WIP, lead time médio, chartData (burndown + projeção do cone com melhor/pior cenário), weeklyPerformance (throughput + balanço do fluxo) — replicando a lógica exata do Vercel |
| Novo | `src/components/wow-v2/SquadDashboard.tsx` | Componente com 4 KPI cards + 3 gráficos Recharts (Burndown AreaChart, Throughput ComposedChart, Balanço BarChart) — visual adaptado ao design system do portal (cores, fontes, bordas) |
| Editar | `src/components/wow-v2/SmReportTab.tsx` | Ao clicar em uma linha da tabela de squads, expande o `SquadDashboard` abaixo com os dados daquele time |
| Editar | `src/hooks/useConeData.ts` | Expor também os `JiraItem[]` brutos (além dos dados calculados) para que o SquadDashboard possa recalcular por squad |
| Editar | `src/services/metricsCalculator.ts` | Extrair funções utilitárias (excelToJSDate, getMon, formatDate) para reuso |

### Lógica de cálculo (do Vercel)

Para cada squad selecionado:
- **Escopo Total**: itens criados até hoje com aquele Team
- **Entregas**: itens com Resolved preenchido
- **WIP**: itens sem Resolved e status != DESCARTADO
- **Lead Time**: média de (Resolved - Created) em dias
- **Burndown**: curva real de "A Fazer" por semana + projeções (melhor: 3/sem, pior: 1/sem, tendência real)
- **Throughput**: barras semanais de vazão + linha de lead time médio
- **Balanço**: demandas criadas vs entregas feitas por semana

### Visual

Mantém o design system do portal (fundo `#fff`, bordas `#e0dcd7`, fontes DM Sans/IBM Plex Mono) mas com gráficos Recharts usando as mesmas cores do dashboard Vercel (azul/roxo para realizado, laranja para tendência, verde para melhor cenário).

### Dependência

Recharts já está instalado no projeto (usado em `CheckpointChart.tsx`).

