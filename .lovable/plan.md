

## Plano: Corrigir gráficos vazios — parsing de datas e filtro por Release

### Problemas encontrados

**1. Bug crítico: parsing de datas quebrado**

O dado real vem no formato americano `M/D/YY H:mm` (ex: `"3/3/26 10:55"`), que é exatamente como o Vercel parseia. Mas o portal usa regex que espera `DD/MM/YYYY HH:mm` (2 dígitos fixos, ano com 4 dígitos). Resultado: **todas as datas retornam null** → nenhum dado semanal é gerado → gráficos vazios.

| Formato no dado | Regex do portal | Match? |
|---|---|---|
| `3/3/26 10:55` | `^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$` | ❌ Não |
| `2/13/26 14:48` | idem | ❌ Não |

**2. Filtro por Team não diferencia squads**

Todos os itens têm `Team: "UP"` ou `""`. Não há distinção entre times. O dashboard Vercel usa filtro por Release (O4R1, O4R2) — precisamos fazer o mesmo.

### Solução

| Arquivo | Mudança |
|---|---|
| `src/hooks/useSquadDashboard.ts` | Substituir `excelToJSDate` pela lógica flexível do Vercel (suporta M/D/YY, DD/MM/YYYY, Excel serial). Filtrar por Release em vez de Team. |
| `src/services/metricsCalculator.ts` | Atualizar `parseExcelDate` com a mesma lógica flexível. Adicionar mapeamento `RELEASE_TO_SQUAD` para separar squads por release. |
| `src/data/squads.ts` | Adicionar mapeamento de releases para squads (ex: O4R1 → Edmilson/Scania, O4R2 → Gabriela/TAOS) |

### Detalhes técnicos

**Nova lógica de parsing (replicando Vercel)**:
```ts
// Suporta: "3/3/26 10:55", "03/03/2026 10:55", "2/13/26 14:48", Excel serial
function excelToJSDate(dateStr) {
  // Se contém '/', split em partes
  // Se first > 12 → DD/MM, senão → MM/DD (padrão Jira Cloud)
  // Ano < 100 → +2000
}
```

**Nova lógica de filtro por Release**:
```ts
// Em vez de filtrar por Team, filtrar por Release
const squadItems = rawItems.filter(item =>
  releasesBySquad[`${sm}|${squadName}`]?.includes(item.Release)
);
```

**Mapeamento Release → Squad** (a confirmar com o usuário):
- O4R1 → Edmilson / Scania
- O4R2 → Gabriela / TAOS (ou dividir entre Gabriela e Rafael)

### Pergunta pendente

Os releases O4R1 e O4R2 — como se distribuem entre os SMs? Todos os itens são do mesmo projeto? Se sim, faz mais sentido mostrar todos os dados em uma única view por SM, filtrável por release, em vez de separar em squads fictícios.

