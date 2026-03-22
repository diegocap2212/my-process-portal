

## WoW Portal v2 — Novo Modelo Operacional com Design Existente

### Contexto
O protótipo do Claude traz um modelo operacional excelente (Report SM semanal + Visão SDM consolidada + Histórico), mas com um design dark mode genérico. O projeto atual tem uma identidade visual sofisticada e editorial que deve ser preservada e elevada: Newsreader serif para títulos, IBM Plex Mono para labels/dados, DM Sans para corpo, paleta navy (#0f1729) + gold (#c9a84c) + branco clean, cards com bordas sutis e hierarquia tipográfica refinada.

### O que será construído

Uma nova página `/v2` com 3 abas dentro do design system existente, mantendo a mesma barra de navegação sticky dark, tipografia editorial e estrutura visual dos cards.

### Arquitetura

| Ação | Arquivo |
|------|---------|
| Novo | `src/pages/WoWV2.tsx` — Página principal com 3 sub-abas |
| Novo | `src/components/wow-v2/SmReportTab.tsx` — Visão do SM: métricas cone (simuladas) + 3 perguntas |
| Novo | `src/components/wow-v2/SdmTab.tsx` — Visão SDM: cards consolidados por SM + padrões transversais |
| Novo | `src/components/wow-v2/HistoricoTab.tsx` — Timeline de reports passados |
| Novo | `src/components/wow-v2/MetricCard.tsx` — Card de métrica individual (vazão, cycle time, etc.) |
| Novo | `src/components/wow-v2/ConeStatus.tsx` — Badge de status do cone (estilo existente) |
| Novo | `src/data/cone-mock.ts` — Dados simulados do cone por SM/squad |
| Novo | `src/hooks/useWeeklyReport.ts` — Submit/fetch de reports semanais no Firebase (`weeklyReports`) |
| Editar | `src/App.tsx` — Adicionar rota `/v2` |
| Editar | `src/components/layout/Navbar.tsx` — Adicionar botão "WoW v2" |
| Editar | `src/data/squads.ts` — Atualizar Gabriela: substituir Esteira de Crédito + Portal Vendas por Taos |

### Design — Seguindo o sistema existente

**Tipografia**: Newsreader para headers de seção, IBM Plex Mono para labels/badges/dados, DM Sans para corpo e textareas — exatamente como já funciona no WoW e Dashboard.

**Cores**: Navy #0f1729 para header e backgrounds escuros, gold #c9a84c para acentos e tabs ativas, cores por SM (Edmilson #1A3A8F, Gabriela #2A6B50, Rafael #9E3D2B), cores por tipo de projeto (PROJECT_TYPE_COLORS).

**Cards**: Background branco, border `1px solid #e0dcd7`, sem border-radius exagerado (0 ou 2px como o form atual), bordas coloridas à esquerda para indicar SM, seções com separadores sutis usando a `labelStyle` existente.

**Elevação do design**: Adicionar micro-interações nos hovers dos SM cards (borda esquerda anima de 3px para 5px), tabela de métricas com alternância sutil de fundo, indicadores de cone com dot colorido + label em mono (como o badge "● FIREBASE" que já existe), números grandes em destaque (fontSize 28-32) para métricas chave.

### Fluxo por aba

**Aba 1: Report SM** (preenchimento semanal na sexta)
- Seletor de SM no topo (pills com cor do SM, estilo dos tabs existentes)
- Bloco "Métricas do Cone" com header labelStyle roxo (#7B5EA7) — 4 MetricCards em grid: Vazão, Cycle Time, P85, Itens >P85
- Tabela de squads com dados por squad (mesma estética da selectStyle existente)
- Badge do pior cone com ConeStatus
- Bloco "Report Semanal" com header labelStyle verde (#2A6B50) — 3 perguntas numeradas com textareas no inputStyle existente:
  1. "O que você tracionou que os números não mostram?"
  2. "Algo travado que precisa de escalação?"
  3. "Alguma entrega que deveria virar narrativa pro cliente?"
- Botão submit idêntico ao atual (background #0f1729, full-width)

**Aba 2: Visão SDM** (consolidação na segunda)
- 3 MetricCards no topo: Vazão Torre (soma), Cycle Time Médio, Total Itens >P85
- Cards por SM com:
  - Header com cor do SM + badge de status do report (estilo "● FIREBASE")
  - Métricas resumidas inline
  - 3 blocos de texto (tração/travado/narrativa) com borderLeft colorido (como ExecutiveSummary)
- Seção "Padrões Transversais" no rodapé com alertas automáticos (mesmo visual do BottleneckRadar)

**Aba 3: Histórico**
- Timeline vertical com dot + linha (cor do SM)
- Cards de report passados expansíveis (mesmo padrão do ReportDetailsList)
- Filtro por SM

### Dados simulados do cone (`cone-mock.ts`)

Estrutura pronta para futura integração real:
```text
{
  Edmilson: {
    Scania:     { vazao: 5, cycleTime: 2.8, p85: 4.5, acimP85: 0, cone: "green" },
    Contratos:  { vazao: 3, cycleTime: 5.0, p85: 7.0, acimP85: 2, cone: "yellow" },
    Plataforma: { vazao: 2, cycleTime: 6.1, p85: 8.0, acimP85: 3, cone: "red" }
  },
  Gabriela: {
    "Canal Indireto": { vazao: 4, cycleTime: 3.2, p85: 5.0, acimP85: 1, cone: "yellow" },
    Taos:             { vazao: 6, cycleTime: 4.0, p85: 6.5, acimP85: 2, cone: "red" }
  },
  Rafael: {
    Nivus:   { vazao: 4, cycleTime: 3.5, p85: 5.2, acimP85: 1, cone: "green" },
    Optimus: { vazao: 3, cycleTime: 4.8, p85: 6.0, acimP85: 2, cone: "yellow" }
  }
}
```

### Hook `useWeeklyReport.ts`
- Grava no Firebase collection `weeklyReports` com campos: `sm, week (YYYY-Wnn), q1, q2, q3, createdAt`
- Lê reports existentes para popular Visão SDM e Histórico
- Reutiliza o padrão do `useReports.ts` (onSnapshot + timeout)

### Squads da Gabriela
Atualizar `squads.ts`: substituir "Esteira de Crédito" e "Portal Vendas Assistidas" por:
- `{ name: "Canal Indireto", projectType: "Sustentação" }`
- `{ name: "Taos", projectType: "Locavia", description: "Crédito, Proposta e Time" }`

### Integração
- Rota `/v2` adicionada ao `App.tsx`
- Navbar ganha botão "WoW v2" ao lado do "DASHBOARD" (mesmo estilo, cor diferenciada)
- Página antiga `/` permanece intacta

