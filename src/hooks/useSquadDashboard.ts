import { useMemo } from "react";
import type { JiraItem } from "@/services/metricsCalculator";
import { parseExcelDate, getMonday, formatWeekLabel } from "@/services/metricsCalculator";
import { JIRA_TEAM_TO_SQUAD } from "@/services/metricsCalculator";
import type { SquadDataOverride } from "@/hooks/useSquadReports";

export interface SquadKPIs {
  escopo: number;
  entregas: number;
  wip: number;
  leadTime: number;
}

export interface WeekPoint {
  week: string;
  weekDate: Date;
  aFazer: number;
  melhorCenario?: number;
  piorCenario?: number;
  tendencia?: number;
  criados: number;
  resolvidos: number;
  leadTime: number;
  hasOverride?: boolean;
}

export interface SquadDashboardData {
  kpis: SquadKPIs;
  weeklyData: WeekPoint[];
}

function getSquadTeams(squadName: string, sm: string): string[] {
  return Object.entries(JIRA_TEAM_TO_SQUAD)
    .filter(([_, v]) => v.squad === squadName && v.sm === sm)
    .map(([k]) => k);
}

export function useSquadDashboard(
  rawItems: JiraItem[],
  squadName: string,
  sm: string,
  overrides?: SquadDataOverride[]
): SquadDashboardData {
  return useMemo(() => {
    const teams = getSquadTeams(squadName, sm);
    const squadItems = rawItems.filter((item) => teams.includes(item.Team));

    // Parse dates
    const parsed = squadItems.map((item) => ({
      ...item,
      createdDate: parseExcelDate(item.Created),
      resolvedDate: parseExcelDate(item.Resolved),
    }));

    // KPIs
    const escopo = parsed.length;
    const entregas = parsed.filter((i) => i.resolvedDate).length;
    const wip = parsed.filter(
      (i) => !i.resolvedDate && i.Status !== "DESCARTADO" && i.Status !== "Descartado"
    ).length;

    const cycleTimes = parsed
      .filter((i) => i.createdDate && i.resolvedDate)
      .map((i) => (i.resolvedDate!.getTime() - i.createdDate!.getTime()) / 86400000)
      .filter((d) => d >= 0);

    const leadTime =
      cycleTimes.length > 0
        ? +(cycleTimes.reduce((s, v) => s + v, 0) / cycleTimes.length).toFixed(1)
        : 0;

    // Weekly buckets (last 12 weeks)
    const now = new Date();
    const currentMonday = getMonday(now);
    const weeks: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      const w = new Date(currentMonday.getTime() - i * 7 * 86400000);
      weeks.push(w);
    }

    const weeklyData: WeekPoint[] = weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
      const label = formatWeekLabel(weekStart);

      const criados = parsed.filter(
        (i) => i.createdDate && i.createdDate >= weekStart && i.createdDate < weekEnd
      ).length;

      const resolvidos = parsed.filter(
        (i) => i.resolvedDate && i.resolvedDate >= weekStart && i.resolvedDate < weekEnd
      ).length;

      const weekCycleTimes = parsed
        .filter(
          (i) =>
            i.resolvedDate &&
            i.resolvedDate >= weekStart &&
            i.resolvedDate < weekEnd &&
            i.createdDate
        )
        .map((i) => (i.resolvedDate!.getTime() - i.createdDate!.getTime()) / 86400000)
        .filter((d) => d >= 0);

      const weekLeadTime =
        weekCycleTimes.length > 0
          ? +(weekCycleTimes.reduce((s, v) => s + v, 0) / weekCycleTimes.length).toFixed(1)
          : 0;

      // A Fazer: items created before weekEnd and not resolved before weekEnd
      const aFazer = parsed.filter(
        (i) =>
          i.createdDate &&
          i.createdDate < weekEnd &&
          (!i.resolvedDate || i.resolvedDate >= weekEnd) &&
          i.Status !== "DESCARTADO" &&
          i.Status !== "Descartado"
      ).length;

      // Apply overrides if present
      let finalCriados = criados;
      let finalResolvidos = resolvidos;
      let hasOverride = false;
      if (overrides) {
        const criadoOverride = overrides.find((o) => o.week === label && o.field === "criados");
        const resolvidoOverride = overrides.find((o) => o.week === label && o.field === "resolvidos");
        if (criadoOverride) { finalCriados = criadoOverride.value; hasOverride = true; }
        if (resolvidoOverride) { finalResolvidos = resolvidoOverride.value; hasOverride = true; }
      }

      return { week: label, weekDate: weekStart, aFazer, criados: finalCriados, resolvidos: finalResolvidos, leadTime: weekLeadTime, hasOverride };
    });

    // Projections from current week
    const currentAFazer = weeklyData[weeklyData.length - 1]?.aFazer || 0;
    const recentVazao = weeklyData.slice(-4).map((w) => w.resolvidos);
    const avgVazao = recentVazao.length > 0
      ? recentVazao.reduce((s, v) => s + v, 0) / recentVazao.length
      : 1;

    // Add 8 more projection weeks
    for (let i = 1; i <= 8; i++) {
      const projDate = new Date(currentMonday.getTime() + i * 7 * 86400000);
      const label = formatWeekLabel(projDate);
      const melhor = Math.max(0, currentAFazer - i * 3);
      const pior = Math.max(0, currentAFazer - i * 1);
      const tendencia = Math.max(0, Math.round(currentAFazer - i * avgVazao));

      weeklyData.push({
        week: label,
        weekDate: projDate,
        aFazer: 0,
        melhorCenario: melhor,
        piorCenario: pior,
        tendencia,
        criados: 0,
        resolvidos: 0,
        leadTime: 0,
      });
    }

    return {
      kpis: { escopo, entregas, wip, leadTime },
      weeklyData,
    };
  }, [rawItems, squadName, sm]);
}
