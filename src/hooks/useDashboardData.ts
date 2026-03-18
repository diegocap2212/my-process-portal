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
  type: "parado" | "wipEpic" | "wipUs" | "cone" | "pdti";
  label: string;
  pct: number;
  severity: "critical" | "warning";
  lastText: string;
}

export interface SmSummary {
  sm: string;
  totalReports: number;
  squads: string[];
  overallCompliance: number;
  recentProblems: string[];
  recentActions: string[];
  alertSquads: string[];
  squadsByType: Record<string, string[]>;
}

const CHECKPOINTS = [
  { key: "cone", label: "Cone atualizado" },
  { key: "pdti", label: "PDTI consistente" },
  { key: "parado", label: "Item parado >2d" },
  { key: "wipEpic", label: "WIP Épicos" },
  { key: "wipUs", label: "WIP USs/Tasks" },
] as const;

const BOTTLENECK_CHECKS = [
  { key: "parado", label: "Itens parados >2d", invertGood: true, threshold: 50 },
  { key: "wipEpic", label: "WIP Épicos descontrolado", invertGood: false, threshold: 50 },
  { key: "wipUs", label: "WIP USs descontrolado", invertGood: false, threshold: 50 },
  { key: "cone", label: "Cone desatualizado", invertGood: false, threshold: 50 },
  { key: "pdti", label: "PDTI inconsistente", invertGood: false, threshold: 50 },
] as const;

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  return start.toISOString().slice(0, 10);
}

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

  const checkpointStats = useMemo<CheckpointStats[]>(() => {
    return CHECKPOINTS.map(({ key, label }) => {
      const answered = filtered.filter((r) => r[key as keyof Report] !== null);
      const yes = answered.filter((r) => r[key as keyof Report] === true).length;
      return {
        key, label,
        total: answered.length, yes,
        no: answered.length - yes,
        pct: answered.length > 0 ? Math.round((yes / answered.length) * 100) : 0,
      };
    });
  }, [filtered]);

  const squadHealth = useMemo<SquadHealth[]>(() => {
    const map = new Map<string, Report[]>();
    filtered.forEach((r) => {
      const key = `${r.sm}|${r.squad}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    const seenKeys = new Set<string>();
    Object.entries(SM_SQUADS).forEach(([sm, squads]) => {
      squads.forEach((squad) => seenKeys.add(`${sm}|${squad}`));
    });
    map.forEach((_, key) => seenKeys.add(key));

    const result: SquadHealth[] = [];
    seenKeys.forEach((key) => {
      const [sm, squad] = key.split("|");
      const reps = map.get(key) || [];
      result.push({
        squad, sm,
        projectType: getSquadProjectType(squad),
        cone: calcPct(reps, "cone"),
        pdti: calcPct(reps, "pdti"),
        parado: calcPct(reps, "parado"),
        wipEpic: calcPct(reps, "wipEpic"),
        wipUs: calcPct(reps, "wipUs"),
        totalReports: reps.length,
      });
    });
    return result.sort((a, b) => a.sm.localeCompare(b.sm) || a.squad.localeCompare(b.squad));
  }, [filtered]);

  const weeklyTrends = useMemo<WeeklyTrend[]>(() => {
    const weeks = new Map<string, Report[]>();
    filtered.forEach((r) => {
      if (!r.date) return;
      const wk = getWeekKey(r.date);
      if (!weeks.has(wk)) weeks.set(wk, []);
      weeks.get(wk)!.push(r);
    });
    return Array.from(weeks.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, reps]) => ({
        week: week.slice(5),
        cone: calcPct(reps, "cone") === -1 ? 0 : calcPct(reps, "cone"),
        pdti: calcPct(reps, "pdti") === -1 ? 0 : calcPct(reps, "pdti"),
        parado: calcPct(reps, "parado") === -1 ? 0 : calcPct(reps, "parado"),
        wipEpic: calcPct(reps, "wipEpic") === -1 ? 0 : calcPct(reps, "wipEpic"),
        wipUs: calcPct(reps, "wipUs") === -1 ? 0 : calcPct(reps, "wipUs"),
      }));
  }, [filtered]);

  const smFrequency = useMemo<SmFrequency[]>(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.sm, (map.get(r.sm) || 0) + 1));
    return Array.from(map.entries())
      .map(([sm, count]) => ({ sm, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Bottleneck detection
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

      for (const check of BOTTLENECK_CHECKS) {
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

  // SM Executive Summaries
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

        // Overall compliance: avg of all checkpoint %yes (excluding parado which is inverted)
        const fields = ["cone", "pdti", "wipEpic", "wipUs"];
        const pcts = fields.map((f) => {
          const p = calcPct(reps, f);
          return p === -1 ? 0 : p;
        });
        const paradoPct = calcPct(reps, "parado");
        pcts.push(paradoPct === -1 ? 100 : 100 - paradoPct); // invert parado
        const overallCompliance = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);

        const recentProblems = sorted
          .filter((r) => r.problemas?.trim())
          .slice(0, 5)
          .map((r) => `[${r.squad} ${r.date}] ${r.problemas}`);

        const recentActions = sorted
          .filter((r) => r.acoes?.trim())
          .slice(0, 5)
          .map((r) => `[${r.squad} ${r.date}] ${r.acoes}`);

        // Squads with alerts (any checkpoint in red)
        const alertSquads = squads.filter((sq) => {
          const sqReps = reps.filter((r) => r.squad === sq);
          const paradoP = calcPct(sqReps, "parado");
          const coneP = calcPct(sqReps, "cone");
          return (paradoP !== -1 && paradoP >= 50) || (coneP !== -1 && coneP < 40);
        });

        // Group squads by project type
        const squadsByType: Record<string, string[]> = {};
        squads.forEach((sq) => {
          const pt = getSquadProjectType(sq) || "Outros";
          if (!squadsByType[pt]) squadsByType[pt] = [];
          squadsByType[pt].push(sq);
        });

        return {
          sm, totalReports: reps.length, squads, overallCompliance,
          recentProblems, recentActions, alertSquads, squadsByType,
        };
      })
      .sort((a, b) => a.sm.localeCompare(b.sm));
  }, [filtered]);

  return {
    filtered, totalReports: filtered.length,
    checkpointStats, squadHealth, weeklyTrends, smFrequency,
    bottlenecks, smSummaries,
  };
}
