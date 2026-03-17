import { useMemo } from "react";
import type { Report } from "@/types/report";
import { SM_SQUADS } from "@/data/squads";

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

const CHECKPOINTS = [
  { key: "cone", label: "Cone atualizado" },
  { key: "pdti", label: "PDTI consistente" },
  { key: "parado", label: "Item parado >2d" },
  { key: "wipEpic", label: "WIP Épicos" },
  { key: "wipUs", label: "WIP USs/Tasks" },
] as const;

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  return start.toISOString().slice(0, 10);
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
        key,
        label,
        total: answered.length,
        yes,
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

    const result: SquadHealth[] = [];
    // Include all known squads
    Object.entries(SM_SQUADS).forEach(([sm, squads]) => {
      squads.forEach((squad) => {
        const key = `${sm}|${squad}`;
        const reps = map.get(key) || [];
        const calc = (field: string) => {
          const answered = reps.filter((r) => r[field as keyof Report] !== null);
          if (answered.length === 0) return -1; // no data
          const yes = answered.filter((r) => r[field as keyof Report] === true).length;
          return Math.round((yes / answered.length) * 100);
        };
        result.push({
          squad,
          sm,
          cone: calc("cone"),
          pdti: calc("pdti"),
          parado: calc("parado"),
          wipEpic: calc("wipEpic"),
          wipUs: calc("wipUs"),
          totalReports: reps.length,
        });
      });
    });
    return result;
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
      .map(([week, reps]) => {
        const calc = (field: string) => {
          const answered = reps.filter((r) => r[field as keyof Report] !== null);
          if (answered.length === 0) return 0;
          return Math.round(
            (answered.filter((r) => r[field as keyof Report] === true).length / answered.length) * 100
          );
        };
        return {
          week: week.slice(5), // MM-DD
          cone: calc("cone"),
          pdti: calc("pdti"),
          parado: calc("parado"),
          wipEpic: calc("wipEpic"),
          wipUs: calc("wipUs"),
        };
      });
  }, [filtered]);

  const smFrequency = useMemo<SmFrequency[]>(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.sm, (map.get(r.sm) || 0) + 1));
    return Array.from(map.entries())
      .map(([sm, count]) => ({ sm, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  return {
    filtered,
    totalReports: filtered.length,
    checkpointStats,
    squadHealth,
    weeklyTrends,
    smFrequency,
  };
}
