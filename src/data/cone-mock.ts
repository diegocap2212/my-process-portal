export type ConeStatusType = "green" | "yellow" | "red";

export interface SquadConeData {
  vazao: number;
  cycleTime: number;
  p85: number;
  acimP85: number;
  cone: ConeStatusType;
}

export const CONE_MOCK_DATA: Record<string, Record<string, SquadConeData>> = {
  Edmilson: {
    Scania: { vazao: 5, cycleTime: 2.8, p85: 4.5, acimP85: 0, cone: "green" },
  },
  Gabriela: {
    GOL: { vazao: 4, cycleTime: 3.2, p85: 5.0, acimP85: 1, cone: "yellow" },
    TAOS: { vazao: 6, cycleTime: 4.0, p85: 6.5, acimP85: 2, cone: "red" },
  },
  Rafael: {
    Nivus: { vazao: 4, cycleTime: 3.5, p85: 5.2, acimP85: 1, cone: "green" },
    Optimus: { vazao: 3, cycleTime: 4.8, p85: 6.0, acimP85: 2, cone: "yellow" },
  },
};

export function getSmTotals(sm: string) {
  const squads = CONE_MOCK_DATA[sm];
  if (!squads) return { vazao: 0, cycleTime: 0, p85: 0, acimP85: 0, worstCone: "green" as ConeStatusType };

  const entries = Object.values(squads);
  const vazao = entries.reduce((s, e) => s + e.vazao, 0);
  const cycleTime = entries.length > 0 ? +(entries.reduce((s, e) => s + e.cycleTime, 0) / entries.length).toFixed(1) : 0;
  const p85 = entries.length > 0 ? +(entries.reduce((s, e) => s + e.p85, 0) / entries.length).toFixed(1) : 0;
  const acimP85 = entries.reduce((s, e) => s + e.acimP85, 0);

  const coneOrder: ConeStatusType[] = ["green", "yellow", "red"];
  const worstCone = entries.reduce<ConeStatusType>(
    (worst, e) => (coneOrder.indexOf(e.cone) > coneOrder.indexOf(worst) ? e.cone : worst),
    "green"
  );

  return { vazao, cycleTime, p85, acimP85, worstCone };
}

export function getTorreTotals() {
  let vazao = 0, cycleSum = 0, acimP85 = 0, count = 0;
  for (const squads of Object.values(CONE_MOCK_DATA)) {
    for (const data of Object.values(squads)) {
      vazao += data.vazao;
      cycleSum += data.cycleTime;
      acimP85 += data.acimP85;
      count++;
    }
  }
  return {
    vazao,
    cycleTime: count > 0 ? +(cycleSum / count).toFixed(1) : 0,
    acimP85,
    totalSquads: count,
  };
}
