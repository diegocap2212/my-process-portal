

## Plano: Alinhar cálculos do portal com o dashboard Vercel

### Problema raiz

Analisei o código-fonte do dashboard Vercel (`useDashboardData.ts`) e comparei com o portal. Existem 4 diferenças fundamentais na lógica de cálculo que causam divergência nos números:

### Diferenças encontradas

| Aspecto | Vercel | Portal | Impacto |
|---------|--------|--------|---------|
| **Parsing de datas** | `(serial - 25569) * 86400 * 1000` | `epoch(1899,11,30) + serial * 86400000` | Equivalente, OK |
| **Status** | `Status.toUpperCase()` na normalização | Case-sensitive, checa "DESCARTADO" e "Descartado" | Itens "descartado" podem escapar |
| **Burndown "A Fazer"** | Cumulativo: `scope_até_semana - resolved_até_semana` | Point-in-time: itens criados antes e não resolvidos antes | Pode divergir em edge cases |
| **Projeção cone** | Velocity = `totalEntregas / totalSemanas` desde primeira entrega, 20 semanas | Velocity = média últimas 4 semanas, 8 semanas | Velocidades e alcance diferentes |
| **Throughput** | "Planejadas" vs "Não Planejadas" + "Vazão Total" + "Lead Time (Méd)" | "Criados" vs "Resolvidos" | Métricas diferentes |
| **Balanço do Fluxo** | "Entradas" vs "Saídas" = "Saldo" (delta) | "Criados" vs "Resolvidos" | Mesmo conceito, labels diferentes |
| **Histórico** | Todas as semanas desde o primeiro item | Últimas 12 semanas apenas | Gráfico muito mais curto |

### O que será alterado

| Arquivo | Mudança |
|---------|---------|
| `src/services/metricsCalculator.ts` | Normalizar `Status.toUpperCase()` no parsing |
| `src/hooks/useSquadDashboard.ts` | (1) Calcular "A Fazer" cumulativo como Vercel. (2) Projeção cone com velocity = totalEntregas/totalSemanas e 20 semanas. (3) Histórico dinâmico desde primeiro item (não fixo 12 semanas). (4) Throughput com Planejadas/Não Planejadas. (5) Balanço com Entradas/Saídas/Saldo |
| `src/components/wow-v2/SquadDashboard.tsx` | Atualizar gráficos para usar as novas séries (Planejadas, Não Planejadas, Entradas, Saídas, Saldo) |

### Detalhes técnicos

**Burndown cumulativo** (alinhado com Vercel):
```
scope_na_semana = itens criados até fim da semana
resolved_na_semana = itens resolvidos até fim da semana
aFazer = scope - resolved
```

**Velocity do cone** (alinhado com Vercel):
```
velocity = totalEntregas / semanas_desde_primeira_entrega
```

**Throughput** (alinhado com Vercel):
- Planejadas: resolvidas na semana que foram criadas antes daquela semana
- Não Planejadas: resolvidas na semana que foram criadas naquela mesma semana
- Lead Time médio por semana

**Balanço do Fluxo** (alinhado com Vercel):
- Entradas (inflow): itens criados na semana
- Saídas: itens resolvidos na semana
- Saldo: Entradas - Saídas

