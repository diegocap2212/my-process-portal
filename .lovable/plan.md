

## Plano: Report por Squad + Edição de Dados nos Gráficos

### O que muda

1. **Report individual por squad**: Abaixo dos gráficos de cada squad, campos de texto para o SM registrar observações específicas daquele time (ex: report do Nivus separado do Optimus).

2. **Edição dos dados nos gráficos**: Permitir que o SM clique em uma semana e altere manualmente os valores de criados/resolvidos — útil quando os dados do Jira não refletem a realidade.

### Implementação

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| **Migração** | Nova migration | Criar tabela `squad_reports` (sm, squad, week, notes TEXT) e tabela `squad_data_overrides` (sm, squad, week, field TEXT, value INT) para persistir reports por squad e edições manuais |
| **Novo** | `src/hooks/useSquadReports.ts` | Hook para CRUD dos reports por squad e dos overrides de dados |
| **Editar** | `src/components/wow-v2/SquadDashboard.tsx` | Adicionar: (1) textarea abaixo dos gráficos para o report do squad, (2) modal de edição ao clicar em uma barra/ponto do gráfico — permitindo alterar `criados` e `resolvidos` daquela semana |
| **Editar** | `src/hooks/useSquadDashboard.ts` | Aceitar `overrides` opcionais e aplicar os valores editados sobre os dados calculados do Jira |

### Fluxo de edição dos gráficos

1. SM clica em uma barra do gráfico de Throughput ou Balanço
2. Abre um mini-modal com os campos "Criados" e "Resolvidos" pré-preenchidos com o valor atual
3. SM altera e salva → persiste na tabela `squad_data_overrides`
4. O gráfico re-renderiza com os valores editados (indicador visual de que foi editado manualmente)

### Banco de dados

```sql
-- Report qualitativo por squad
CREATE TABLE squad_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sm TEXT NOT NULL,
  squad TEXT NOT NULL,
  week TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sm, squad, week)
);

-- Override manual dos dados dos gráficos
CREATE TABLE squad_data_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sm TEXT NOT NULL,
  squad TEXT NOT NULL,
  week TEXT NOT NULL,
  field TEXT NOT NULL, -- 'criados' ou 'resolvidos'
  value INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sm, squad, week, field)
);
```

RLS: public read/insert/update/delete (mesmo padrão das tabelas existentes).

### Detalhes técnicos

- O textarea do report por squad usa `ON CONFLICT (sm, squad, week) DO UPDATE` para upsert.
- Os overrides são aplicados no hook `useSquadDashboard` antes de gerar os dados dos gráficos: se existe override para aquela semana/field, o valor do Jira é substituído.
- Barras com override recebem uma borda pontilhada ou cor diferenciada para sinalizar edição manual.

