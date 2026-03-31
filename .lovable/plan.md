

## Plano: Corrigir gráficos vazios — mapeamento de times desatualizado

### Problema raiz

Os gráficos não aparecem porque o mapeamento `JIRA_TEAM_TO_SQUAD` no portal está desatualizado em relação aos dados reais.

**Dados reais** (vindos do data.json): os itens têm `Team: "UP"` ou `Team: ""` (vazio).

**Mapeamento atual no portal**: espera `"SCANIA S 650"`, `"TAOS"`, `"GOL"`, `"NIVUS"`, `"OPTIMUS"`.

Como nenhum item no data.json tem esses nomes de time, o filtro `squadItems = rawItems.filter(item => teams.includes(item.Team))` retorna **array vazio** para todos os squads, resultando em gráficos sem dados.

### Pergunta antes de implementar

Preciso entender como os dados estão organizados agora. Pelo que vejo no data.json, praticamente todos os itens têm `Team: "UP"` ou vazio. O dashboard Vercel permite filtrar por "Team" como um dropdown simples.

**Opções para alinhar:**

1. **Filtrar por Release** em vez de Team — cada release (O4R1, O4R2) pode ser associada a um SM/squad
2. **Atualizar o mapeamento** — se os times mudaram de nome no Jira, atualizar `JIRA_TEAM_TO_SQUAD` para incluir `"UP"` e outros nomes atuais
3. **Remover a separação por squad** e mostrar todos os itens como o Vercel faz, filtrando apenas por Team/Release via dropdown

### Mudanças necessárias (após decisão)

| Arquivo | Mudança |
|---------|---------|
| `src/services/metricsCalculator.ts` | Atualizar `JIRA_TEAM_TO_SQUAD` com os nomes de team corretos |
| `src/hooks/useSquadDashboard.ts` | Ajustar filtro se lógica de agrupamento mudar |
| `src/data/squads.ts` | Atualizar `SM_SQUAD_DETAILS` se squads/nomes mudarem |

### Detalhe técnico

O fluxo atual:
```text
data.json → Edge Function → rawItems (Team="UP") 
  → getSquadTeams("Scania","Edmilson") → busca "SCANIA S 650" 
  → match: ZERO → gráficos vazios
```

O fix precisa alinhar o que `getSquadTeams` procura com o que realmente vem no campo `Team` dos dados.

