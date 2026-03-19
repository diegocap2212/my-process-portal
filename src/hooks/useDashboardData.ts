import { useMemo } from "react";
import type { Report } from "@/types/report";
import { SM_SQUADS, getSquadProjectType } from "@/data/squads";
import type { ProjectType } from "@/data/squads";

export interface CheckpointStats {
  key: string;
  label: string;
  total: number;
  yes: number;
  no: number;
  pct: number;
}

export interface SquadHealth {
  squad: string;
  sm: string;
  projectType: ProjectType | null;
  cone: number;
  pdti: number;
  parado: number;
  wipEpic: number;
  wipUs: number;
  totalReports: number;
}

export interface WeeklyTrend {
  week: string;
  cone: number;
  pdti: number;
  parado: number;
  wipEpic: number;
  wipUs: number;
}

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

  // Bottleneck detection — Cone only for Locavia, no PDTI
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
        // Cone only for Locavia squads
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

  // SM Executive Summaries — no compliance, with oQue
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

        // Squads with alerts (any checkpoint in red)
        const alertSquads = squads.filter((sq) => {
          const sqReps = reps.filter((r) => r.squad === sq);
          const paradoP = calcPct(sqReps, "parado");
          return paradoP !== -1 && paradoP >= 50;
        });

        // Group squads by project type
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
