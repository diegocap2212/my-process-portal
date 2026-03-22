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

// Backward-compatible flat map
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
