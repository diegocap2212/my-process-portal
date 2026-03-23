

## Integração SharePoint — Plano de Implementação

### Situação atual
- Azure AD configurado: Client ID `966e1a2e...`, Tenant ID `8f13a14b...`, Client Secret recebido
- Projeto **não tem Supabase/Lovable Cloud** configurado — preciso ativar para criar Edge Functions
- Mock data em `src/data/cone-mock.ts` já tem a interface `SquadConeData` pronta

### Pré-requisitos antes de codar

**1. Ativar Lovable Cloud** — necessário para Edge Functions. Vou ativar na implementação.

**2. Armazenar 3 secrets no projeto:**
- `AZURE_TENANT_ID` = `8f13a14b-e674-447f-93e0-812f6809af2f`
- `AZURE_CLIENT_ID` = `966e1a2e-781a-40b1-b4b1-d6991bc9906f`
- `AZURE_CLIENT_SECRET` = o valor que você enviou

**3. Informação pendente do usuário:**
- **Nome do site SharePoint** (ex: `TorreLM`, `Locavia`)
- **Path do arquivo Excel** dentro do SharePoint (ex: `Documents/metricas.xlsx`)
- **Nome da aba/planilha** que contém os dados do cone (vazão, cycle time, etc.)
- **Estrutura das colunas** — quais colunas mapeiam para vazão, cycleTime, p85, acimP85, cone

### Implementação técnica

| Ação | Arquivo |
|------|---------|
| Novo | `supabase/functions/read-sharepoint-data/index.ts` — Edge Function |
| Novo | `src/hooks/useConeData.ts` — Hook que consome a Edge Function |
| Editar | `src/components/wow-v2/SmReportTab.tsx` — Trocar mock por dados reais |
| Editar | `src/components/wow-v2/SdmTab.tsx` — Trocar mock por dados reais |

**Edge Function** (`read-sharepoint-data`):
- Autentica no Azure AD via client credentials flow (`https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`)
- Usa Microsoft Graph API para ler o Excel (`/sites/{siteId}/drive/items/{itemId}/workbook/worksheets/{sheet}/usedRange`)
- Faz parse das linhas para o formato `SquadConeData`
- Cache de 1h via header `Cache-Control`
- CORS headers para chamadas do frontend

**Hook** (`useConeData`):
- Chama a Edge Function via `supabase.functions.invoke('read-sharepoint-data')`
- Retorna dados na mesma interface `Record<string, Record<string, SquadConeData>>`
- Fallback automático para `CONE_MOCK_DATA` se a API falhar
- Estado de loading/error

**Componentes** (SmReportTab + SdmTab):
- Substituir imports diretos de `CONE_MOCK_DATA` por `useConeData()`
- Mesma UI, mesma lógica, dados reais

### Próximo passo imediato

Antes de implementar, preciso que você me diga:
1. O **nome do site SharePoint** onde está o Excel
2. O **nome/path do arquivo** Excel
3. A **aba da planilha** e **estrutura das colunas** (quais colunas = vazão, cycle time, p85, etc.)

Sem isso, a Edge Function não sabe onde buscar os dados. Posso criar a estrutura inteira com placeholder e você ajusta depois, ou podemos mapear agora.

