

## Plano: Alinhar dados do portal com o dashboard da Vercel

### Problema identificado

Os gráficos do portal mostram **zeros** porque existem dois desalinhamentos entre os dados reais (data.json do GitHub) e a lógica do portal:

1. **Mapeamento de times incorreto**: O `JIRA_TEAM_TO_SQUAD` mapeia times como "SCANIA S 650", "TAOS", "GOL", "NIVUS", "OPTIMUS" — mas os dados reais do Jira usam nomes como **UP, AMAROK, TERA, GOL, PARATI, TIGUAN, RESSARCIMENTO**, entre outros. A maioria dos itens cai no time "UP" e não é associada a nenhum squad.

2. **Parsing de datas**: O `parseExcelDate` espera números seriais do Excel (ex: "46084.45"), mas dependendo do momento os dados podem chegar como strings formatadas ("03/03/2026 10:55"). A função precisa lidar com ambos os formatos.

### O que muda

| Arquivo | Mudança |
|---------|---------|
| `src/services/metricsCalculator.ts` | Atualizar `parseExcelDate` para aceitar **ambos os formatos** (serial Excel e string "dd/MM/yyyy HH:mm"). Atualizar `JIRA_TEAM_TO_SQUAD` com os times reais do data.json |
| `src/data/squads.ts` | Atualizar `SM_SQUAD_DETAILS` para refletir os squads reais associados a cada SM |
| `src/data/cone-mock.ts` | Atualizar mock data com os nomes corretos dos squads |

### Mapeamento proposto

Preciso da sua confirmação sobre qual time do Jira pertence a qual SM/squad. Baseado nos dados atuais, os times encontrados são:

```text
Times no Jira (data.json):
  UP, AMAROK, TERA, GOL, PARATI, TIGUAN, RESSARCIMENTO
  + vários itens sem time (Team: "")
```

Dois projetos Jira coexistem: **WA-** (Blip/WhatsApp) e **RM-** (outros).

**Preciso que você me confirme o mapeamento correto:**
- Edmilson cuida de quais times?
- Gabriela cuida de quais times?
- Rafael cuida de quais times?

Isso é essencial para que os gráficos por squad mostrem os dados corretos.

### Lógica dos gráficos (mantida igual ao Vercel)

Os gráficos que já temos (Burndown, Throughput, Balanço do Fluxo) seguem a mesma lógica do dashboard Vercel:
- **Burndown**: "A Fazer" real + projeção cone (melhor 3/sem, pior 1/sem, tendência baseada na velocidade real)
- **Throughput**: Vazão semanal + Lead Time médio
- **Balanço**: Criados vs Resolvidos por semana

A lógica de cálculo já está alinhada — o problema é puramente de **mapeamento de times** e **parsing de datas**.

