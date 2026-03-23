

## Plano: Integrar Dados Reais do SharePoint via Edge Function

### Entendimento Atualizado

O fluxo do dashboard Vercel é: **SharePoint Excel → sync diário → data.json local**. Os dados são itens Jira com colunas `Type, Key, Summary, Status, Team, Created, Resolved, Release`. O dashboard calcula métricas (vazão, cycle time, P85, cone) a partir desses dados brutos.

Nós já temos a Edge Function `read-sharepoint-data` que lê o Excel diretamente do SharePoint via Microsoft Graph API, com os secrets Azure configurados.

### Implementação

**1. Ajustar Edge Function `read-sharepoint-data`**
- Já existe e lê o SharePoint Excel
- Adicionar um modo `?mode=read&sheet=NOME_DA_ABA` que retorna os dados brutos como `JiraItem[]`
- Precisamos descobrir qual aba contém os dados (a função já tem modo `discover` para listar abas)

**2. Criar `src/services/metricsCalculator.ts`**
- Replica a lógica do `useDashboardData.ts` do Vercel:
  - Parse de datas Excel (decimal → JS Date)
  - **Vazão**: itens resolvidos na última semana por Team
  - **Cycle Time**: média de `(Resolved - Created)` em dias por Team
  - **P85**: percentil 85 do cycle time por Team
  - **Itens >P85**: contagem de itens com cycle time acima do P85
  - **Cone**: verde/amarelo/vermelho baseado na projeção (melhor cenário 3/sem, pior 1/sem)
- Mapeia `Team` do Jira → SM/Squad usando `SM_SQUAD_DETAILS`

**3. Criar `src/hooks/useConeData.ts`**
- Chama `supabase.functions.invoke('read-sharepoint-data', { body: { mode: 'read', sheet: '...' } })`
- Passa os dados pelo `metricsCalculator`
- Retorna `Record<string, Record<string, SquadConeData>>`
- Fallback para `CONE_MOCK_DATA` se API falhar
- Estados de loading/error

**4. Atualizar `src/data/squads.ts`**
- Adicionar mapeamento `Team` (Jira) → Squad name para cada SM
- Ex: `{ "Time Scania": { sm: "Edmilson", squad: "Scania" } }`

**5. Atualizar `SmReportTab.tsx` e `SdmTab.tsx`**
- Substituir imports de `CONE_MOCK_DATA` por `useConeData()`
- Adicionar loading skeleton
- Mesma UI, dados reais

### Primeiro Passo Técnico

Antes de implementar os cálculos, vou testar a Edge Function existente com `?mode=discover` para listar as abas do Excel e entender a estrutura dos dados. Isso vai confirmar que a autenticação Azure está funcionando e revelar os nomes corretos das abas.

### Arquivos Impactados

| Ação | Arquivo |
|------|---------|
| Editar | `supabase/functions/read-sharepoint-data/index.ts` |
| Novo | `src/services/metricsCalculator.ts` |
| Novo | `src/hooks/useConeData.ts` |
| Editar | `src/data/squads.ts` (mapeamento Team→SM) |
| Editar | `src/components/wow-v2/SmReportTab.tsx` |
| Editar | `src/components/wow-v2/SdmTab.tsx` |

