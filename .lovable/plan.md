

# Plano Completo de Implementação — Dashboard MVP + Formulario Refinado

Este plano contém todas as alterações necessárias, arquivo por arquivo, com o código exato para copiar e colar. Você pode implementar tudo manualmente sem o AI.

---

## Visão Geral das Mudanças

```text
src/data/squads.ts              ← Atualizar estrutura (remover Elizabeth, add Taos, categorias)
src/components/tabs/HojeTab.tsx ← Cone condicional, sem PDTI, labels focados em resultados
src/hooks/useDashboardData.ts   ← Sem PDTI no radar, Cone só Locavia, oQue no summary
src/pages/Dashboard.tsx         ← Sem KPICards/Chart/SquadHealth, com ExecutiveSummary
src/components/dashboard/ContextCards.tsx      ← Já existe, mantido
src/components/dashboard/BottleneckRadar.tsx   ← Já existe, mantido
src/components/dashboard/ExecutiveSummary.tsx  ← Já existe, mantido
src/components/dashboard/ReportDetailsList.tsx ← Atualizar labels (sem PDTI nos badges)
src/components/dashboard/DashboardFilters.tsx  ← Já ok
src/components/dashboard/DashboardExport.tsx   ← Já ok
src/components/dashboard/ImageModal.tsx        ← Já ok
```

---

## 1. `src/data/squads.ts` — Substituir conteúdo inteiro

```typescript
export type ProjectType = "Locavia" | "Sobrevivência" | "Sustentação";

export interface SquadInfo {
  name: string;
  projectType: ProjectType;
  description?: string;
}

export const SM_SQUAD_DETAILS: Record<string, SquadInfo[]> = {
  Edmilson: [
    { name: "Scania", projectType: "Locavia" },
    { name: "Contratos", projectType: "Sobrevivência" },
    { name: "Plataforma", projectType: "Sobrevivência" },
  ],
  Gabriela: [
    { name: "Canal Indireto", projectType: "Sustentação" },
    { name: "Taos", projectType: "Locavia", description: "Crédito, Proposta e Time" },
  ],
  Rafael: [
    { name: "Nivus", projectType: "Locavia", description: "Portal Autoatendimento" },
    { name: "Optimus", projectType: "Locavia", description: "Contratos" },
  ],
};

export const SM_SQUADS: Record<string, string[]> = Object.fromEntries(
  Object.entries(SM_SQUAD_DETAILS).map(([sm, squads]) => [sm, squads.map((s) => s.name)])
);

export const SM_NAMES = Object.keys(SM_SQUAD_DETAILS);

export const smColors: Record<string, string> = {
  Edmilson: "#1A3A8F",
  Gabriela: "#2A6B50",
  Rafael: "#9E3D2B",
};

export const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  Locavia: "hsl(222 47% 30%)",
  Sobrevivência: "hsl(35 70% 45%)",
  Sustentação: "hsl(160 40% 35%)",
};

export function getSquadProjectType(squadName: string): ProjectType | null {
  for (const squads of Object.values(SM_SQUAD_DETAILS)) {
    const found = squads.find((s) => s.name === squadName);
    if (found) return found.projectType;
  }
  return null;
}
```

**Mudanças**: Removida Elizabeth. Gabriela agora tem "Canal Indireto" (Sustentação) e "Taos" (Locavia). Rafael tem Nivus e Optimus.

---

## 2. `src/components/tabs/HojeTab.tsx` — Editar 3 seções

### 2a. Linha 149-154: Cone condicional + sem PDTI

Substituir o bloco de checkpoints (linhas 149-154) por:

```tsx
{getSquadProjectType(rSq) === "Locavia" && (
  <Checkpoint label="Cone atualizado e analisado?" link={LINKS.cone} val={rCone} setVal={setRCone} tx={rConeTx} setTx={setRConeTx} ph="Análise do cone — restantes, transbordo, projeção..." />
)}
<Checkpoint label="Item parado >2 dias?" val={rParado} setVal={setRParado} tx={rParadoTx} setTx={setRParadoTx} ph="Quais itens? Qual ação tomada para desbloquear?" />
<Checkpoint label="WIP Épicos sob controle?" val={rWipE} setVal={setRWipE} tx={rWipETx} setTx={setRWipETx} ph="Quais épicos ativos? Progresso atual?" />
<Checkpoint label="WIP USs/Tasks — começando e terminando?" val={rWipU} setVal={setRWipU} tx={rWipUTx} setTx={setRWipUTx} ph="Fluxo de entrega ok? Itens completados?" />
```

(Nota: PDTI foi completamente removido do formulário)

### 2b. Linhas 163-168: Labels focados em resultados

Substituir a seção "Resultados & Contexto" por:

```tsx
<div style={{ ...labelStyle, color: "#2A6B50", marginBottom: 5, marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
  <span style={{ width: 12, height: 1, background: "#2A6B50" }} />Resultados & Contexto
</div>
<textarea value={rOque} onChange={(e) => setROque(e.target.value)} placeholder="Principais entregas e resultados do dia — o que foi concluído, o que avançou?" rows={2} style={{ ...inputStyle, marginBottom: 5, resize: "vertical" as const }} />
<textarea value={rProb} onChange={(e) => setRProb(e.target.value)} placeholder="Riscos ativos e impedimentos — o que pode impactar entregas?" rows={2} style={{ ...inputStyle, marginBottom: 5, resize: "vertical" as const }} />
<textarea value={rAcoes} onChange={(e) => setRAcoes(e.target.value)} placeholder="Decisões tomadas e próximos passos — o que foi resolvido, o que vem a seguir?" rows={2} style={{ ...inputStyle, marginBottom: 5, resize: "vertical" as const }} />
```

### 2c. Submit (linhas 54-63): Ainda enviar pdti como null

No `submit`, os campos `pdti` e `pdtiText` ainda devem ser enviados (para manter compatibilidade com o Firebase). Basta garantir que o `submit` continua enviando:

```tsx
pdti: rPdti, pdtiText: rPdtiTx,
```

Como o state `rPdti` nunca muda (sempre `null`), o Firebase recebe `null` — correto.

---

## 3. `src/hooks/useDashboardData.ts` — Substituir conteúdo inteiro

```typescript
import { useMemo } from "react";
import type { Report } from "@/types/report";
import { SM_SQUADS, getSquadProjectType } from "@/data/squads";
import type { ProjectType } from "@/data/squads";

export interface SmFrequency {
  sm: string;
  count: number;
}

export interface Bottleneck {
  squad: string;
  sm: string;
  type: "parado" | "wipEpic" | "wipUs" | "cone";
  label: string;
  pct: number;
  severity: "critical" | "warning";
  lastText: string;
}

export interface SmSummary {
  sm: string;
  totalReports: number;
  squads: string[];
  recentProblems: string[];
  recentActions: string[];
  recentOQue: string[];
  alertSquads: string[];
  squadsByType: Record<string, string[]>;
}

const BOTTLENECK_CHECKS = [
  { key: "parado", label: "Itens parados >2d", invertGood: true, threshold: 50, locaviaOnly: false },
  { key: "wipEpic", label: "WIP Épicos descontrolado", invertGood: false, threshold: 50, locaviaOnly: false },
  { key: "wipUs", label: "WIP USs descontrolado", invertGood: false, threshold: 50, locaviaOnly: false },
  { key: "cone", label: "Cone desatualizado", invertGood: false, threshold: 50, locaviaOnly: true },
] as const;

function calcPct(reports: Report[], field: string): number {
  const answered = reports.filter((r) => r[field as keyof Report] !== null);
  if (answered.length === 0) return -1;
  const yes = answered.filter((r) => r[field as keyof Report] === true).length;
  return Math.round((yes / answered.length) * 100);
}

export function useDashboardData(
  reports: Report[],
  filters: { sm: string; squad: string; startDate: string; endDate: string }
) {
  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (filters.sm && r.sm !== filters.sm) return false;
      if (filters.squad && r.squad !== filters.squad) return false;
      if (filters.startDate && r.date < filters.startDate) return false;
      if (filters.endDate && r.date > filters.endDate) return false;
      return true;
    });
  }, [reports, filters.sm, filters.squad, filters.startDate, filters.endDate]);

  const smFrequency = useMemo<SmFrequency[]>(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.sm, (map.get(r.sm) || 0) + 1));
    return Array.from(map.entries())
      .map(([sm, count]) => ({ sm, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  const bottlenecks = useMemo<Bottleneck[]>(() => {
    const squadMap = new Map<string, Report[]>();
    filtered.forEach((r) => {
      const key = `${r.sm}|${r.squad}`;
      if (!squadMap.has(key)) squadMap.set(key, []);
      squadMap.get(key)!.push(r);
    });

    const result: Bottleneck[] = [];
    squadMap.forEach((reps, key) => {
      const [sm, squad] = key.split("|");
      if (reps.length < 1) return;

      const projectType = getSquadProjectType(squad);

      for (const check of BOTTLENECK_CHECKS) {
        if (check.locaviaOnly && projectType !== "Locavia") continue;

        const answered = reps.filter((r) => r[check.key as keyof Report] !== null);
        if (answered.length === 0) continue;

        const badCount = check.invertGood
          ? answered.filter((r) => r[check.key as keyof Report] === true).length
          : answered.filter((r) => r[check.key as keyof Report] === false).length;

        const badPct = Math.round((badCount / answered.length) * 100);
        if (badPct < check.threshold) continue;

        const textField = `${check.key}Text` as keyof Report;
        const sorted = [...reps].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        const lastText = sorted.find((r) => r[textField])
          ? String(sorted.find((r) => r[textField])![textField])
          : "";

        result.push({
          squad, sm,
          type: check.key as Bottleneck["type"],
          label: check.label,
          pct: badPct,
          severity: badPct >= 70 ? "critical" : "warning",
          lastText,
        });
      }
    });

    return result.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
      return b.pct - a.pct;
    });
  }, [filtered]);

  const smSummaries = useMemo<SmSummary[]>(() => {
    const smMap = new Map<string, Report[]>();
    filtered.forEach((r) => {
      if (!smMap.has(r.sm)) smMap.set(r.sm, []);
      smMap.get(r.sm)!.push(r);
    });

    return Array.from(smMap.entries())
      .map(([sm, reps]) => {
        const squads = [...new Set(reps.map((r) => r.squad))];
        const sorted = [...reps].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

        const recentProblems = sorted
          .filter((r) => r.problemas?.trim())
          .slice(0, 5)
          .map((r) => `[${r.squad} ${r.date}] ${r.problemas}`);

        const recentActions = sorted
          .filter((r) => r.acoes?.trim())
          .slice(0, 5)
          .map((r) => `[${r.squad} ${r.date}] ${r.acoes}`);

        const recentOQue = sorted
          .filter((r) => r.oQue?.trim())
          .slice(0, 5)
          .map((r) => `[${r.squad} ${r.date}] ${r.oQue}`);

        const alertSquads = squads.filter((sq) => {
          const sqReps = reps.filter((r) => r.squad === sq);
          const paradoP = calcPct(sqReps, "parado");
          return paradoP !== -1 && paradoP >= 50;
        });

        const squadsByType: Record<string, string[]> = {};
        squads.forEach((sq) => {
          const pt = getSquadProjectType(sq) || "Outros";
          if (!squadsByType[pt]) squadsByType[pt] = [];
          squadsByType[pt].push(sq);
        });

        return {
          sm, totalReports: reps.length, squads,
          recentProblems, recentActions, recentOQue, alertSquads, squadsByType,
        };
      })
      .sort((a, b) => a.sm.localeCompare(b.sm));
  }, [filtered]);

  return {
    filtered, totalReports: filtered.length,
    smFrequency, bottlenecks, smSummaries,
  };
}
```

**Diferenças vs. original**: Removidos os tipos `CheckpointStats`, `SquadHealth`, `WeeklyTrend` (não usados mais). PDTI removido do `BOTTLENECK_CHECKS`. `SmSummary` inclui `recentOQue` e `squadsByType`.

---

## 4. `src/pages/Dashboard.tsx` — Substituir conteúdo inteiro

```typescript
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReports } from "@/hooks/useReports";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import DashboardExport from "@/components/dashboard/DashboardExport";
import ContextCards from "@/components/dashboard/ContextCards";
import BottleneckRadar from "@/components/dashboard/BottleneckRadar";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";
import ReportDetailsList from "@/components/dashboard/ReportDetailsList";
import { fontSerif, fontMono } from "@/styles/constants";

export default function Dashboard() {
  const navigate = useNavigate();
  const { reports, loading } = useReports();
  const [sm, setSm] = useState("");
  const [squad, setSquad] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const { filtered, totalReports, smFrequency, bottlenecks, smSummaries } =
    useDashboardData(reports, { sm, squad, startDate, endDate });

  return (
    <div style={{ minHeight: "100vh", background: "hsl(210 40% 96.1%)" }}>
      <div style={{
        background: "hsl(222.2 84% 4.9%)", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 18px",
          display: "flex", alignItems: "center", height: 44, gap: 10,
        }}>
          <div
            onClick={() => navigate("/")}
            style={{ ...fontSerif, fontSize: 17, color: "hsl(210 40% 98%)", cursor: "pointer" }}
          >
            Torre <span style={{ color: "hsl(43 52% 54%)", fontWeight: 600 }}>LM</span>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,.1)" }} />
          <div style={{ ...fontMono, fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.5)" }}>
            DASHBOARD
          </div>
          <div style={{ flex: 1 }} />
          <div
            onClick={() => navigate("/")}
            style={{ fontSize: 10, color: "rgba(255,255,255,.4)", cursor: "pointer", padding: "4px 8px" }}
          >
            ← Voltar ao WoW
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 18px 50px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ ...fontSerif, fontSize: 24, color: "hsl(222.2 84% 4.9%)" }}>
            Dashboard de Gestão
          </div>
          {!loading && (
            <DashboardExport
              dashboardRef={contentRef}
              filters={{ sm, squad, startDate, endDate }}
            />
          )}
        </div>
        <div style={{ fontSize: 12, color: "hsl(215.4 16.3% 46.9%)", marginBottom: 16 }}>
          Métricas compiladas dos reports diários dos Scrum Masters
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "hsl(215.4 16.3% 46.9%)" }}>
            Carregando dados do Firebase...
          </div>
        ) : (
          <div ref={contentRef}>
            <DashboardFilters
              sm={sm} setSm={setSm} squad={squad} setSquad={setSquad}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
            />
            <ContextCards
              totalReports={totalReports}
              smFrequency={smFrequency}
              bottleneckCount={bottlenecks.length}
              criticalCount={bottlenecks.filter(b => b.severity === "critical").length}
              reports={filtered}
            />
            <BottleneckRadar bottlenecks={bottlenecks} />
            <ExecutiveSummary summaries={smSummaries} bottlenecks={bottlenecks} />
            <ReportDetailsList reports={filtered} />
          </div>
        )}
      </div>
    </div>
  );
}
```

Este arquivo **já está correto** como mostrado. Sem KPICards, CheckpointChart ou SquadHealthTable.

---

## 5. `src/components/dashboard/ReportDetailsList.tsx` — Remover PDTI dos badges

Na linha 11-17, alterar o array `CHECKPOINTS` para remover o PDTI:

```typescript
const CHECKPOINTS = [
  { key: "cone", textKey: "coneText", label: "Cone atualizado" },
  { key: "parado", textKey: "paradoText", label: "Item parado >2d" },
  { key: "wipEpic", textKey: "wipEpicText", label: "WIP Épicos" },
  { key: "wipUs", textKey: "wipUsText", label: "WIP USs/Tasks" },
] as const;
```

Opcionalmente, nas linhas 122-126, atualizar os labels qualitativos:

```tsx
{[
  { label: "Entregas e Resultados", value: r.oQue },
  { label: "Riscos e Impedimentos", value: r.problemas },
  { label: "Decisões e Próximos Passos", value: r.acoes },
].filter(({ value }) => value?.trim()).map(({ label, value }) => (
```

---

## 6. Arquivos que NÃO precisam de alteração

Os seguintes arquivos **já estão corretos** e não precisam ser tocados:

- `src/components/dashboard/ContextCards.tsx` — cards de contexto rápido, ok
- `src/components/dashboard/BottleneckRadar.tsx` — radar de gargalos, ok
- `src/components/dashboard/ExecutiveSummary.tsx` — resumo executivo com oQue, ok
- `src/components/dashboard/DashboardFilters.tsx` — filtros, ok
- `src/components/dashboard/DashboardExport.tsx` — export PDF, ok
- `src/components/dashboard/ImageModal.tsx` — modal de imagem, ok
- `src/App.tsx` — rotas já configuradas, ok
- `src/types/report.ts` — mantém pdti no tipo para retrocompatibilidade, ok
- `src/firebase.ts` — sem mudanças, ok

---

## 7. Arquivos que podem ser DELETADOS (opcionais)

Se existirem, estes arquivos não são mais importados e podem ser removidos:

- `src/components/dashboard/KPICards.tsx`
- `src/components/dashboard/CheckpointChart.tsx`
- `src/components/dashboard/SquadHealthTable.tsx`

---

## Checklist de Implementação

1. Atualizar `src/data/squads.ts` (copiar seção 1)
2. Editar `src/components/tabs/HojeTab.tsx` (seção 2 — cone condicional, sem PDTI, labels)
3. Substituir `src/hooks/useDashboardData.ts` (copiar seção 3)
4. Verificar `src/pages/Dashboard.tsx` (seção 4 — já deve estar correto)
5. Editar `src/components/dashboard/ReportDetailsList.tsx` (seção 5 — remover PDTI dos badges)
6. Deletar arquivos não usados (seção 7 — opcional)
7. Testar: selecionar SM Gabriela, verificar que "Taos" aparece. Selecionar squad não-Locavia, verificar que Cone não aparece.

---

## Próximos Passos (Futuro, quando houver créditos)

- **Integração SharePoint/OneDrive** para trazer vazão, transbordo e lead time automaticamente
- **View de Report Executivo** que gere HTML no formato do report compartilhado
- **Taos com 3 cones**: adicionar sub-checkpoints de Cone (Crédito, Proposta, Time) quando squad = Taos

