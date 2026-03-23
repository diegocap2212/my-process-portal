import type { ConeStatusType, SquadConeData } from "@/data/cone-mock";

export interface JiraItem {
  Type: string;
  Key: string;
  Summary: string;
  Status: string;
  Team: string;
  Created: string | null;
  Resolved: string | null;
  Release: string;
}

// Excel serial number → JS Date
export function excelSerialToDate(serial: number): Date {
  const epoch = new Date(1899, 11, 30); // Excel epoch
  return new Date(epoch.getTime() + serial * 86400000);
}

export function parseExcelDate(val: string | null): Date | null {
  if (!val) return null;
  const num = parseFloat(val);
  if (isNaN(num)) return null;
  return excelSerialToDate(num);
}

// Get Monday of a given date's week
export function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

export function formatWeekLabel(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

// Team name from Jira → { sm, squad }
export const JIRA_TEAM_TO_SQUAD: Record<string, { sm: string; squad: string }> = {
  "SCANIA S 650": { sm: "Edmilson", squad: "Scania" },
  TAOS: { sm: "Gabriela", squad: "Taos" },
  GOL: { sm: "Gabriela", squad: "Canal Indireto" },
  NIVUS: { sm: "Rafael", squad: "Nivus" },
  OPTIMUS: { sm: "Rafael", squad: "Optimus" },
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function calculateMetrics(
  items: JiraItem[]
): Record<string, Record<string, SquadConeData>> {
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 86400000);

  // Group items by squad
  const bySquad: Record<string, { sm: string; squad: string; items: JiraItem[] }> = {};

  for (const item of items) {
    const mapping = TEAM_TO_SQUAD[item.Team];
    if (!mapping) continue;
    const key = `${mapping.sm}::${mapping.squad}`;
    if (!bySquad[key]) bySquad[key] = { ...mapping, items: [] };
    bySquad[key].items.push(item);
  }

  const result: Record<string, Record<string, SquadConeData>> = {};

  for (const { sm, squad, items: squadItems } of Object.values(bySquad)) {
    // Resolved items with cycle times
    const resolvedWithCycle: { resolved: Date; cycleDays: number }[] = [];

    for (const item of squadItems) {
      const created = parseExcelDate(item.Created);
      const resolved = parseExcelDate(item.Resolved);
      if (!created || !resolved) continue;
      const cycleDays = (resolved.getTime() - created.getTime()) / 86400000;
      if (cycleDays >= 0) resolvedWithCycle.push({ resolved, cycleDays });
    }

    // Vazão: resolved in last 4 weeks
    const recentResolved = resolvedWithCycle.filter(
      (r) => r.resolved >= fourWeeksAgo
    );
    const vazao = recentResolved.length;

    // Cycle times from last 4 weeks
    const cycleTimes = recentResolved.map((r) => r.cycleDays).sort((a, b) => a - b);
    const avgCycle = cycleTimes.length > 0
      ? +(cycleTimes.reduce((s, v) => s + v, 0) / cycleTimes.length).toFixed(1)
      : 0;

    const p85 = cycleTimes.length > 0 ? +percentile(cycleTimes, 85).toFixed(1) : 0;

    const acimP85 = p85 > 0
      ? recentResolved.filter((r) => r.cycleDays > p85).length
      : 0;

    // Cone: simple heuristic
    let cone: ConeStatusType = "green";
    if (acimP85 >= 3 || vazao === 0) cone = "red";
    else if (acimP85 >= 1) cone = "yellow";

    if (!result[sm]) result[sm] = {};
    result[sm][squad] = { vazao, cycleTime: avgCycle, p85, acimP85, cone };
  }

  // Ensure all known squads appear even if no data
  for (const [team, mapping] of Object.entries(TEAM_TO_SQUAD)) {
    if (!result[mapping.sm]) result[mapping.sm] = {};
    if (!result[mapping.sm][mapping.squad]) {
      result[mapping.sm][mapping.squad] = {
        vazao: 0, cycleTime: 0, p85: 0, acimP85: 0, cone: "green",
      };
    }
  }

  return result;
}
