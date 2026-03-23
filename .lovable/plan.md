

## Plano: Redesign dos gráficos de Planejamento e Throughput

### Problema

Os dois gráficos inferiores ("Throughput" e "Balanço do Fluxo") não comunicam bem o que significam. A dor principal: **não fica claro se um item foi planejado para aquela sprint/semana ou se caiu de paraquedas**. Os nomes e as métricas atuais são técnicos demais e não contam a história certa.

### O que muda

**Gráfico 1 — "Itens Planejados vs Não Planejados"** (substitui "Balanço do Fluxo")
- Renomear para **"Itens Planejados vs Não Planejados"**
- Barras empilhadas por semana: **Planejados** (criados antes da semana e resolvidos nela) + **Não Planejados** (criados e resolvidos na mesma semana)
- Linha de **% Planejamento** (eixo direito, 0-100%): mostra a proporção de itens planejados sobre o total resolvido na semana — dá visão imediata da previsibilidade
- Tooltip customizado mostrando: Planejados (X), Não Planejados (Y), Total (Z), Taxa de Planejamento (W%)
- Legenda com mini-explicação inline: "Planejado = criado antes da semana | Não Planejado = criado e resolvido na mesma semana"

**Gráfico 2 — "Vazão Semanal"** (substitui "Throughput Semanal")
- Renomear para **"Vazão Semanal"**
- Barras simples (não empilhadas): total de itens resolvidos por semana
- Linha de **média móvel** (últimas 4 semanas) para mostrar tendência
- Linha de **Lead Time médio** no eixo direito (mantido)
- Tooltip mostrando: Vazão (X itens), Média Móvel (Y), Lead Time (Z dias)

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useSquadDashboard.ts` | Adicionar campos `percentPlanejado` e `mediMovel` ao `WeekPoint` |
| `src/components/wow-v2/SquadDashboard.tsx` | Redesign dos dois gráficos com novos nomes, tooltips customizados, linha de % planejamento e média móvel |

### Detalhes técnicos

No hook `useSquadDashboard.ts`:
- `percentPlanejado = planejadas / (planejadas + naoPlanejadas) * 100` (ou 0 se sem dados)
- `mediaMovel = média de vazaoTotal das últimas 4 semanas`

No componente, tooltips customizados com React para exibir as informações contextualizadas, e uma linha de texto explicativo abaixo de cada título de seção para que qualquer pessoa entenda o gráfico sem precisar de treinamento.

