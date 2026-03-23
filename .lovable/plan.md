

## Plano: Alinhar cálculos do portal com o dashboard Vercel (repo público)

### Diferenças encontradas (código-fonte comparado)

Analisei o `useDashboardData.ts` do repo público e comparei com o `useSquadDashboard.ts` do portal. As divergências:

| Aspecto | Vercel (correto) | Portal (atual) | Impacto |
|---------|------------------|----------------|---------|
| **Cone: melhor/pior cenário** | Fixo: 3 itens/sem (melhor), 1 item/sem (pior) | velocity*1.5 (melhor), velocity*0.5 (pior) | Projeções diferentes |
| **Cone: tendência** | `velocity = totalEntregas / semanasDesdeFirstEntrega` | Igual | OK |
| **Burndown scope** | Inclui DESCARTADO no scope | Exclui DESCARTADO do scope | "A Fazer" menor no portal |
| **Label da semana** | Range: "13/01 - 19/01" | Só segunda: "13/01" | Visual diferente |
| **Parsing Excel** | `(serial - 25569) * 86400000` | `epoch(1899,11,30) + serial * 86400000` | Equivalente, OK |
| **Throughput/Planejadas** | Mesma lógica | Mesma lógica | OK |

### O que será alterado

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useSquadDashboard.ts` | (1) Cone com 3/1 fixos. (2) Incluir DESCARTADO no scope do burndown. (3) Labels em formato range "dd/MM - dd/MM" |
| `src/services/metricsCalculator.ts` | Adicionar função `formatWeekRange` para gerar label no formato "dd/MM - dd/MM" |

### Detalhes técnicos

**Cone (alinhar com Vercel)**:
```
melhorCenario = currentAFazer - i * 3
piorCenario = currentAFazer - i * 1
tendencia = currentAFazer - i * velocity  (mantém)
```

**Burndown scope (alinhar com Vercel)**:
```
// Remover filtro de DESCARTADO do scope
scopeAtWeek = parsed.filter(i => i.createdDate && i.createdDate < weekEnd).length
// (sem && i.Status !== "DESCARTADO")
```

**Labels**:
```
formatWeekRange(date) => "13/01 - 19/01"
```

