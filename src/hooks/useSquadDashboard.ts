import { useMemo } from "react";
import type { JiraItem } from "@/services/metricsCalculator";
import { parseExcelDate, getMonday, formatWeekLabel, formatWeekRange } from "@/services/metricsCalculator";
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
  // Throughput
  planejadas: number;
  naoPlanejadas: number;
  vazaoTotal: number;
  leadTime: number;
  percentPlanejado: number;
  mediaMovel: number;
  // Balanço
  entradas: number;
  saidas: number;
  saldo: number;
  hasOverride?: boolean;
}

export interface SquadDashboardData {
  kpis: SquadKPIs;
  weeklyData: WeekPoint[];
  releases: string[];
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
  overrides?: SquadDataOverride[],
  selectedRelease?: string
): SquadDashboardData {
  return useMemo(() => {
    const teams = getSquadTeams(squadName, sm);
    const squadItems = rawItems.filter((item) => teams.includes(item.Team));

    // Extract unique releases
    const releases = Array.from(new Set(squadItems.map((i) => i.Release).filter(Boolean))).sort();

    // Filter by release if selected
    const filteredByRelease = selectedRelease
      ? squadItems.filter((i) => i.Release === selectedRelease)
      : squadItems;

    // Parse dates & normalize status
    const parsed = filteredByRelease.map((item) => ({
      ...item,
      Status: (item.Status || "").toUpperCase(),
      createdDate: parseExcelDate(item.Created),
      resolvedDate: parseExcelDate(item.Resolved),
    }));

    // KPIs
    const escopo = parsed.length;
    const entregas = parsed.filter((i) => i.resolvedDate).length;
    const wip = parsed.filter(
      (i) => !i.resolvedDate && i.Status !== "DESCARTADO"
    ).length;

    const cycleTimes = parsed
      .filter((i) => i.createdDate && i.resolvedDate)
      .map((i) => (i.resolvedDate!.getTime() - i.createdDate!.getTime()) / 86400000)
      .filter((d) => d >= 0);

    const leadTime =
      cycleTimes.length > 0
        ? +(cycleTimes.reduce((s, v) => s + v, 0) / cycleTimes.length).toFixed(1)
        : 0;

    // Dynamic weekly buckets from first item to current week
    const allDates = parsed
      .map((i) => i.createdDate)
      .filter((d): d is Date => d !== null);
    
    const now = new Date();
    const currentMonday = getMonday(now);
    
    let firstMonday: Date;
    if (allDates.length > 0) {
      const earliest = new Date(Math.min(...allDates.map((d) => d.getTime())));
      firstMonday = getMonday(earliest);
    } else {
      firstMonday = new Date(currentMonday.getTime() - 11 * 7 * 86400000);
    }

    const weeks: Date[] = [];
    let w = new Date(firstMonday);
    while (w <= currentMonday) {
      weeks.push(new Date(w));
      w = new Date(w.getTime() + 7 * 86400000);
    }

    // Find first week with a resolved item (for velocity calc)
    let firstResolvedWeekIdx = -1;

    const weeklyData: WeekPoint[] = weeks.map((weekStart, idx) => {
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
      const label = formatWeekRange(weekStart);

      // Burndown cumulativo (como Vercel): scope até semana - resolved até semana
      const scopeAtWeek = parsed.filter(
        (i) => i.createdDate && i.createdDate < weekEnd && i.Status !== "DESCARTADO"
      ).length;
      const resolvedAtWeek = parsed.filter(
        (i) => i.resolvedDate && i.resolvedDate < weekEnd
      ).length;
      const aFazer = Math.max(0, scopeAtWeek - resolvedAtWeek);

      // Entradas (inflow): itens criados na semana
      const entradas = parsed.filter(
        (i) => i.createdDate && i.createdDate >= weekStart && i.createdDate < weekEnd
      ).length;

      // Saídas: itens resolvidos na semana
      const resolvedThisWeek = parsed.filter(
        (i) => i.resolvedDate && i.resolvedDate >= weekStart && i.resolvedDate < weekEnd
      );
      const saidas = resolvedThisWeek.length;

      if (saidas > 0 && firstResolvedWeekIdx === -1) {
        firstResolvedWeekIdx = idx;
      }

      // Throughput: Planejadas vs Não Planejadas (como Vercel)
      const planejadas = resolvedThisWeek.filter(
        (i) => i.createdDate && i.createdDate < weekStart
      ).length;
      const naoPlanejadas = resolvedThisWeek.filter(
        (i) => i.createdDate && i.createdDate >= weekStart
      ).length;

      // Lead Time médio da semana
      const weekCycleTimes = resolvedThisWeek
        .filter((i) => i.createdDate)
        .map((i) => (i.resolvedDate!.getTime() - i.createdDate!.getTime()) / 86400000)
        .filter((d) => d >= 0);

      const weekLeadTime =
        weekCycleTimes.length > 0
          ? +(weekCycleTimes.reduce((s, v) => s + v, 0) / weekCycleTimes.length).toFixed(1)
          : 0;

      // Apply overrides
      let finalEntradas = entradas;
      let finalSaidas = saidas;
      let hasOverride = false;
      if (overrides) {
        const criadoOverride = overrides.find((o) => o.week === label && o.field === "criados");
        const resolvidoOverride = overrides.find((o) => o.week === label && o.field === "resolvidos");
        if (criadoOverride) { finalEntradas = criadoOverride.value; hasOverride = true; }
        if (resolvidoOverride) { finalSaidas = resolvidoOverride.value; hasOverride = true; }
      }

      const saldo = finalEntradas - finalSaidas;

      const total = planejadas + naoPlanejadas;
      const percentPlanejado = total > 0 ? +((planejadas / total) * 100).toFixed(0) : 0;

      return {
        week: label,
        weekDate: weekStart,
        aFazer,
        planejadas,
        naoPlanejadas,
        vazaoTotal: hasOverride ? finalSaidas : saidas,
        leadTime: weekLeadTime,
        percentPlanejado,
        mediaMovel: 0, // calculated below
        entradas: finalEntradas,
        saidas: finalSaidas,
        saldo,
        hasOverride,
      };
    });

    // Calculate 4-week moving average for vazaoTotal
    for (let i = 0; i < weeklyData.length; i++) {
      const start = Math.max(0, i - 3);
      const window = weeklyData.slice(start, i + 1);
      const avg = window.reduce((s, w) => s + w.vazaoTotal, 0) / window.length;
      weeklyData[i].mediaMovel = +avg.toFixed(1);
    }

    // Cone projection (como Vercel): velocity = totalEntregas / totalSemanas desde primeira entrega
    const currentAFazer = weeklyData[weeklyData.length - 1]?.aFazer || 0;
    const totalEntregas = entregas;
    const weeksWithData = firstResolvedWeekIdx >= 0
      ? weeks.length - firstResolvedWeekIdx
      : 1;
    const velocity = weeksWithData > 0 ? totalEntregas / weeksWithData : 1;

    // 20 projection weeks (como Vercel)
    for (let i = 1; i <= 20; i++) {
      const projDate = new Date(currentMonday.getTime() + i * 7 * 86400000);
      const label = formatWeekLabel(projDate);
      const melhor = Math.max(0, Math.round(currentAFazer - i * (velocity * 1.5)));
      const pior = Math.max(0, Math.round(currentAFazer - i * (velocity * 0.5)));
      const tendencia = Math.max(0, Math.round(currentAFazer - i * velocity));

      weeklyData.push({
        week: label,
        weekDate: projDate,
        aFazer: 0,
        melhorCenario: melhor,
        piorCenario: pior,
        tendencia,
        planejadas: 0,
        naoPlanejadas: 0,
        vazaoTotal: 0,
        leadTime: 0,
        percentPlanejado: 0,
        mediaMovel: 0,
        entradas: 0,
        saidas: 0,
        saldo: 0,
      });
    }

    return {
      kpis: { escopo, entregas, wip, leadTime },
      weeklyData,
      releases,
    };
  }, [rawItems, squadName, sm, overrides, selectedRelease]);
}
