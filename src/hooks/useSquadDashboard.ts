import { useMemo } from "react";
import type { JiraItem } from "@/services/metricsCalculator";
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
  aFazer: number | null;
  melhorCenario?: number;
  piorCenario?: number;
  tendencia?: number;
  // Throughput
  planejadas: number;
  naoPlanejadas: number;
  vazaoTotal: number;
  leadTime: number;
  // Balanço
  entradas: number;
  saidas: number;
  saldo: number;
  transbordos: number;
  hasOverride?: boolean;
}

export interface SquadDashboardData {
  kpis: SquadKPIs;
  weeklyData: WeekPoint[];
  releases: string[];
}

// ── Helpers (exact same as Vercel) ──────────────────────────────
function getMon(d: Date): Date {
  const mon = new Date(d);
  mon.setDate(mon.getDate() - (mon.getDay() === 0 ? 6 : mon.getDay() - 1));
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function excelToJSDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  if (typeof dateStr === "string" && dateStr.includes("-")) return new Date(dateStr);

  // dd/MM/yyyy HH:mm
  const brMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (brMatch) {
    const [, dd, mm, yyyy, hh, min] = brMatch;
    return new Date(+yyyy, +mm - 1, +dd, +hh, +min);
  }

  // dd/MM/yyyy
  const brDateOnly = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brDateOnly) {
    const [, dd, mm, yyyy] = brDateOnly;
    return new Date(+yyyy, +mm - 1, +dd);
  }

  const excelDate = parseFloat(String(dateStr));
  if (isNaN(excelDate)) return null;
  return new Date((excelDate - 25569) * 86400 * 1000);
}

function formatWeekRange(date: Date): string {
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 6);
  const f = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${f(start)} - ${f(end)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function getSquadTeams(squadName: string, sm: string): string[] {
  return Object.entries(JIRA_TEAM_TO_SQUAD)
    .filter(([_, v]) => v.squad === squadName && v.sm === sm)
    .map(([k]) => k);
}

// ── Main hook (exact replication of Vercel useDashboardData) ────
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

    // Releases
    const releases = Array.from(
      new Set(squadItems.map((i) => i.Release).filter(Boolean))
    ).sort();

    // Normalize + filter by release (same as Vercel selectedTeams/selectedReleases)
    const filtered = (
      selectedRelease
        ? squadItems.filter((i) => i.Release === selectedRelease)
        : squadItems
    ).map((item) => ({
      ...item,
      Status: typeof item.Status === "string" ? item.Status.toUpperCase() : "UNKNOWN",
    }));

    // ── KPIs (same as Vercel metrics) ──
    const totalItems = filtered.length;
    const deliveredCount = filtered.filter((i) => !!i.Resolved).length;
    const wipCount = filtered.filter(
      (i) => !excelToJSDate(i.Resolved) && i.Status !== "DESCARTADO"
    ).length;

    const resolvedItems = filtered.filter((i) => i.Resolved && i.Created);
    const avgCycleTime =
      resolvedItems.length > 0
        ? resolvedItems.reduce((acc, i) => {
            const start = excelToJSDate(i.Created)!.getTime();
            const end = excelToJSDate(i.Resolved)!.getTime();
            return acc + (end - start);
          }, 0) /
          (resolvedItems.length * 86400000)
        : 0;

    // ── Burndown chart data (exact Vercel logic) ──
    const allWeeks = Array.from(
      new Set(
        filtered
          .map((i) => {
            const d = excelToJSDate(i.Resolved) || excelToJSDate(i.Created);
            return d ? getMon(d).toISOString() : null;
          })
          .filter(Boolean)
      )
    ).sort() as string[];

    const dynamicHistory = allWeeks.map((weekKey) => {
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

      // Scope: items created up to end of week (inclusive, same as Vercel)
      const currentScope = filtered.filter((i) => {
        const c = excelToJSDate(i.Created);
        return c && c <= weekEnd;
      }).length;

      // Resolved: items resolved up to end of week
      const resolvedCount = filtered.filter((i) => {
        const r = excelToJSDate(i.Resolved);
        return r && r <= weekEnd;
      }).length;

      const aFazer = Math.max(0, currentScope - resolvedCount);
      const isPast = weekStart <= new Date();

      return {
        week: formatDate(weekStart),
        weekDate: weekStart,
        aFazer: isPast ? aFazer : null,
        fullAFazer: aFazer,
      };
    });

    // Filter same as Vercel
    const filteredHistory = dynamicHistory.filter(
      (d) => d.aFazer !== null || d.weekDate >= getMon(new Date())
    );

    // ── Cone projection (exact Vercel: 3 best, 1 worst, velocity trend) ──
    const lastRealPoint = filteredHistory.filter((d) => d.aFazer !== null).pop();
    const lastRealValue = lastRealPoint?.fullAFazer || 0;

    // Velocity calculation (same as Vercel)
    const firstDelivery = filtered.reduce((min, item) => {
      const r = excelToJSDate(item.Resolved);
      return r && r < min ? r : min;
    }, new Date());

    const now = new Date();
    const weeksElapsed = Math.max(
      1,
      Math.ceil((now.getTime() - firstDelivery.getTime()) / (7 * 86400000))
    );
    const itemsDelivered = filtered.filter((i) => !!i.Resolved).length;
    const velocity = itemsDelivered / weeksElapsed;

    const lastDate = lastRealPoint?.weekDate || getMon(now);

    const projectionPoints: WeekPoint[] = [];
    let currentBest = lastRealValue;
    let currentWorst = lastRealValue;
    let currentTrend = lastRealValue;

    for (let i = 1; i <= 20; i++) {
      currentBest = Math.max(0, currentBest - 3);
      currentWorst = Math.max(0, currentWorst - 1);
      currentTrend = Math.max(0, currentTrend - velocity);

      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + i * 7);

      projectionPoints.push({
        week: formatDate(nextDate),
        weekDate: nextDate,
        aFazer: null,
        melhorCenario: Math.round(currentBest),
        piorCenario: Math.round(currentWorst),
        tendencia: Math.round(currentTrend),
        planejadas: 0,
        naoPlanejadas: 0,
        vazaoTotal: 0,
        leadTime: 0,
        entradas: 0,
        saidas: 0,
        saldo: 0,
        transbordos: 0,
      });

      if (currentBest === 0 && currentWorst === 0 && currentTrend === 0) break;
    }

    // ── Weekly performance (exact Vercel logic with carry) ──
    let minD = new Date();
    let maxD = new Date(0);
    filtered.forEach((item) => {
      const c = excelToJSDate(item.Created);
      const r = excelToJSDate(item.Resolved);
      if (c && c < minD) minD = c;
      if (c && c > maxD) maxD = c;
      if (r && r > maxD) maxD = r;
    });

    const weeklyStatsMap: Record<
      string,
      {
        date: Date;
        throughput: number;
        leadTimeSum: number;
        resolvedInWeek: number;
        carry: number;
        planned: number;
        unplanned: number;
        inflow: number;
      }
    > = {};

    if (filtered.length > 0) {
      const curr = getMon(minD);
      const limit = getMon(new Date(maxD.getTime() + 7 * 86400000));
      while (curr <= limit) {
        weeklyStatsMap[curr.toISOString()] = {
          date: new Date(curr),
          throughput: 0,
          leadTimeSum: 0,
          resolvedInWeek: 0,
          carry: 0,
          planned: 0,
          unplanned: 0,
          inflow: 0,
        };
        curr.setDate(curr.getDate() + 7);
      }

      filtered.forEach((item) => {
        const c = excelToJSDate(item.Created);
        const r = excelToJSDate(item.Resolved);

        if (c) {
          const cKey = getMon(c).toISOString();
          if (weeklyStatsMap[cKey]) weeklyStatsMap[cKey].inflow += 1;
        }

        if (r) {
          const key = getMon(r).toISOString();
          if (weeklyStatsMap[key]) {
            weeklyStatsMap[key].throughput += 1;
            weeklyStatsMap[key].resolvedInWeek += 1;
            if (c && c < getMon(r)) weeklyStatsMap[key].planned += 1;
            else weeklyStatsMap[key].unplanned += 1;
            if (c)
              weeklyStatsMap[key].leadTimeSum +=
                (r.getTime() - c.getTime()) / 86400000;
          }
        }

        // Carry (transbordos) — exact Vercel logic
        Object.keys(weeklyStatsMap).forEach((key) => {
          const wStart = new Date(key);
          const wEnd = new Date(wStart.getTime() + 7 * 86400000);
          if (c && c < wEnd && (!r || r >= wEnd)) {
            weeklyStatsMap[key].carry += 1;
          }
        });
      });
    }

    const weeklyPerformance = Object.values(weeklyStatsMap)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .filter((w) => w.throughput > 0 || w.carry > 0 || w.inflow > 0)
      .map((w): WeekPoint => {
        const weekLabel = formatWeekRange(w.date);

        // Apply overrides
        let finalEntradas = w.inflow;
        let finalSaidas = w.throughput;
        let hasOverride = false;
        if (overrides) {
          const criadoOv = overrides.find(
            (o) => o.week === weekLabel && o.field === "criados"
          );
          const resolvidoOv = overrides.find(
            (o) => o.week === weekLabel && o.field === "resolvidos"
          );
          if (criadoOv) {
            finalEntradas = criadoOv.value;
            hasOverride = true;
          }
          if (resolvidoOv) {
            finalSaidas = resolvidoOv.value;
            hasOverride = true;
          }
        }

        return {
          week: weekLabel,
          weekDate: w.date,
          aFazer: 0,
          planejadas: w.planned,
          naoPlanejadas: w.unplanned,
          vazaoTotal: hasOverride ? finalSaidas : w.throughput,
          leadTime:
            w.resolvedInWeek > 0
              ? +((w.leadTimeSum / w.resolvedInWeek).toFixed(1))
              : 0,
          entradas: finalEntradas,
          saidas: finalSaidas,
          saldo: finalEntradas - finalSaidas,
          transbordos: w.carry,
          hasOverride,
        };
      });

    // ── Combine burndown + projection ──
    const burndownData: WeekPoint[] = filteredHistory.map((h) => ({
      week: h.week,
      weekDate: h.weekDate,
      aFazer: h.aFazer,
      planejadas: 0,
      naoPlanejadas: 0,
      vazaoTotal: 0,
      leadTime: 0,
      entradas: 0,
      saidas: 0,
      saldo: 0,
      transbordos: 0,
    }));

    // Add connection point for projection
    if (burndownData.length > 0 && projectionPoints.length > 0) {
      const lastBurndown = burndownData[burndownData.length - 1];
      projectionPoints[0].melhorCenario = lastBurndown.aFazer ?? lastRealValue;
      projectionPoints[0].piorCenario = lastBurndown.aFazer ?? lastRealValue;
      projectionPoints[0].tendencia = lastBurndown.aFazer ?? lastRealValue;
    }

    const allWeeklyData = [...burndownData, ...projectionPoints, ...weeklyPerformance];

    return {
      kpis: {
        escopo: totalItems,
        entregas: deliveredCount,
        wip: wipCount,
        leadTime: +(avgCycleTime.toFixed(1)),
      },
      weeklyData: allWeeklyData,
      releases,
    };
  }, [rawItems, squadName, sm, overrides, selectedRelease]);
}
