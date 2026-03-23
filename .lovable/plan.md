

## Plano: Integrar Dados Reais via Google Sheets (Mesmo Fonte do Dashboard Vercel)

### Descoberta Importante

Analisei o código do `locavia-dashboard` no GitHub e descobri que ele **nao le diretamente do SharePoint**. Ele usa uma **URL de Google Sheets** como intermediário:

```
VITE_CLOUD_DATA_URL = "https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:json"
```

Os dados sao itens Jira com colunas: `Type`, `Key`, `Summary`, `Status`, `Team`, `Created`, `Resolved`, `Release`. A partir disso, o dashboard calcula vazao, cycle time, lead time, WIP, projecao do cone (melhor/pior cenario), balanco de fluxo — tudo client-side.

### O que muda

Podemos **abandonar a autenticacao Azure/SharePoint** e usar a mesma Google Sheets URL. Isso elimina o problema do Client Secret.

### Informacao necessaria

Preciso que voce me envie a **URL do Google Sheets** que o dashboard Vercel usa (o valor de `VITE_CLOUD_DATA_URL` no Vercel). Ela tem este formato:
`https://docs.google.com/spreadsheets/d/SEU-ID/gviz/tq?tqx=out:json`

### Implementacao

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| Novo | `supabase/functions/read-jira-data/index.ts` | Edge Function que busca dados da Google Sheets, faz parse do formato gviz, e retorna `JiraItem[]` |
| Novo | `src/hooks/useConeData.ts` | Hook que consome a Edge Function, replica os calculos do dashboard Vercel (vazao, cycle time, P85, itens >P85, cone) e retorna no formato `Record<string, Record<string, SquadConeData>>` |
| Novo | `src/services/metricsCalculator.ts` | Logica de calculo extraida do `useDashboardData.ts` do Vercel: throughput semanal, lead time medio, P85, projecao do cone |
| Editar | `src/components/wow-v2/SmReportTab.tsx` | Substituir `CONE_MOCK_DATA` por `useConeData()`, mostrar loading state |
| Editar | `src/components/wow-v2/SdmTab.tsx` | Substituir `CONE_MOCK_DATA` por `useConeData()`, mostrar loading state |
| Editar | `src/data/squads.ts` | Mapear nomes de `Team` (do Jira) para SM/Squad |

### Logica de calculo (replicando o dashboard Vercel)

Para cada squad (Team):
- **Vazao**: itens resolvidos na ultima semana
- **Cycle Time**: media de `(Resolved - Created)` em dias
- **P85**: percentil 85 do cycle time
- **Itens >P85**: contagem de itens com cycle time acima do P85
- **Cone**: verde se vazao >= 3 e nenhum >P85, amarelo se 1-2 >P85, vermelho se >= 3 >P85

### Detalhes tecnicos

- A Edge Function armazena a URL do Google Sheets como secret (`GOOGLE_SHEETS_DATA_URL`)
- O formato gviz retorna JSON envolto em callback — a Edge Function faz o parse
- Cache de 1h via `Cache-Control` header
- Fallback para `CONE_MOCK_DATA` se a API falhar

