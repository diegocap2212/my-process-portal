

## WoW v2 Completo — Abas de Referência + Dados Reais do Cone via SharePoint

### O que será feito

**Frente 1** — Trazer as 4 abas de referência do WoW v1 (Framework, Cadências, Papel & Regras, Padrões) para dentro do WoW v2, criando uma experiência unificada.

**Frente 2** — Conectar o WoW v2 ao Excel do SharePoint (via conector Microsoft OneDrive) para puxar vazão, lead time, escopo e dados do cone automaticamente, substituindo o mock.

### Frente 1 — Abas de referência no WoW v2

**Arquivo: `src/pages/WoWV2.tsx`**

Expandir o array `TABS` com separador visual:

```text
Operacional:  Report SM (◉) | Visão SDM (◎) | Histórico (↻)
              ──── separador visual ────
Referência:   Framework (◯) | Cadências (↻) | Papel (◎) | Padrões (◆)
```

Mudanças:
- Importar `FrameworkTab`, `CadenciasTab`, `PapelTab`, `PadroesTab`
- Adicionar state `exp` (para accordion das cadências)
- Renderizar os componentes existentes nas novas abas
- Ajustar o `FrameworkTab` para que os links internos (`setTab("cadencias")`) funcionem no contexto v2
- Separador visual entre os dois grupos de tabs (linha vertical ou espaço maior)
- Tabs de referência com estilo mais sutil (opacidade menor quando inativas)

Nenhum componente novo precisa ser criado — todos já existem e funcionam.

### Frente 2 — Dados reais do SharePoint

O Excel no SharePoint contém os dados que alimentam o Locavia Dashboard (vazão, lead time, escopo, entregas). Para trazer esses dados para o WoW v2:

**Passo 1 — Conectar Microsoft OneDrive**
Usar o conector `microsoft_onedrive` (se disponível) ou conector SharePoint para acessar o arquivo Excel programaticamente.

**Passo 2 — Edge Function para ler o Excel**
Criar `supabase/functions/read-sharepoint-data/index.ts`:
- Autentica via conector
- Lê o arquivo Excel do SharePoint usando a Microsoft Graph API (`/drives/{id}/items/{id}/workbook/worksheets/{name}/range`)
- Retorna JSON com os dados de vazão, cycle time, lead time, escopo por squad/time
- Cache de 1h para não bater na API a cada load

**Passo 3 — Hook no frontend**
Criar `src/hooks/useConeData.ts`:
- Chama a edge function
- Faz parse dos dados para a mesma interface `SquadConeData` que o mock usa
- Fallback para `cone-mock.ts` se a API falhar

**Passo 4 — Substituir mock nos componentes**
- `SmReportTab.tsx` e `SdmTab.tsx` passam a usar `useConeData()` em vez de `CONE_MOCK_DATA`
- Mesma interface, mesma UI, dados reais

**Dependência**: Preciso que você conecte o SharePoint/OneDrive via conector quando eu pedir. Também vou precisar saber:
- O nome/path do arquivo Excel no SharePoint
- Quais abas/colunas contêm os dados (vazão, lead time, etc.)

### Arquivos

| Ação | Arquivo |
|------|---------|
| Editar | `src/pages/WoWV2.tsx` — adicionar 4 tabs de referência + state `exp` |
| Novo | `supabase/functions/read-sharepoint-data/index.ts` — lê Excel via Graph API |
| Novo | `src/hooks/useConeData.ts` — hook que consome a edge function |
| Editar | `src/components/wow-v2/SmReportTab.tsx` — usar `useConeData` em vez de mock |
| Editar | `src/components/wow-v2/SdmTab.tsx` — usar `useConeData` em vez de mock |

### Ordem de implementação
1. Abas de referência no v2 (rápido, sem dependência externa)
2. Conectar SharePoint/OneDrive (precisa do conector)
3. Edge function + hook para dados reais
4. Substituir mock nos componentes

