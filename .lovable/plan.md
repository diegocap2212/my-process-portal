

## Plano: Report Qualitativo por Squad

### Situação atual
O report qualitativo (4 perguntas) fica no final da página e é único por SM/semana, salvo na tabela `weekly_reports`.

### O que muda
Mover o report qualitativo para **dentro de cada bloco de squad** (abaixo dos gráficos), tornando-o específico por time. Cada squad terá seus próprios 4 campos qualitativos.

### Implementação

| Ação | Detalhe |
|------|---------|
| **Migração** | Adicionar colunas `q1`, `q2`, `q3`, `q4` (TEXT, default '') na tabela `squad_reports` — que já tem `sm`, `squad`, `week` |
| **`useSquadReports.ts`** | Expandir o hook para carregar e salvar os 4 campos qualitativos junto com `notes` |
| **`SquadDashboard.tsx`** | Substituir o textarea simples pelos 4 campos qualitativos (mesmas perguntas de hoje) + botão salvar por squad |
| **`SmReportTab.tsx`** | Remover a seção "Report Semanal · Qualitativo" do final da página (os 4 campos + botão enviar), pois agora cada squad tem o seu |

### Banco de dados
```sql
ALTER TABLE squad_reports
  ADD COLUMN q1 TEXT NOT NULL DEFAULT '',
  ADD COLUMN q2 TEXT NOT NULL DEFAULT '',
  ADD COLUMN q3 TEXT NOT NULL DEFAULT '',
  ADD COLUMN q4 TEXT NOT NULL DEFAULT '';
```

A tabela `weekly_reports` permanece para histórico mas não recebe mais dados novos.

