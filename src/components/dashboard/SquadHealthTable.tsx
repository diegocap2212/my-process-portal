import React from "react";
import type { SquadHealth } from "@/hooks/useDashboardData";
import { fontMono } from "@/styles/constants";
import { smColors } from "@/data/squads";

interface Props {
  data: SquadHealth[];
}

const COLS = [
  { key: "cone", label: "Cone" },
  { key: "pdti", label: "PDTI" },
  { key: "parado", label: "Parado" },
  { key: "wipEpic", label: "WIP Épicos" },
  { key: "wipUs", label: "WIP USs" },
];

function cellColor(pct: number, isParado: boolean): string {
  if (pct === -1) return "hsl(210 40% 96.1%)"; // no data
  const good = isParado ? pct < 30 : pct >= 70;
  const mid = isParado ? pct < 60 : pct >= 40;
  if (good) return "hsla(142, 50%, 35%, 0.15)";
  if (mid) return "hsla(45, 90%, 50%, 0.15)";
  return "hsla(0, 84%, 60%, 0.15)";
}

function cellText(pct: number): string {
  if (pct === -1) return "—";
  return `${pct}%`;
}

const SquadHealthTable: React.FC<Props> = ({ data }) => (
  <div style={{
    background: "hsl(0 0% 100%)", borderRadius: 8,
    border: "1px solid hsl(214 31.8% 91.4%)", overflow: "hidden", marginBottom: 20,
  }}>
    <div style={{ padding: "12px 16px", borderBottom: "1px solid hsl(214 31.8% 91.4%)" }}>
      <span style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)" }}>
        SAÚDE DOS SQUADS — % SIM POR CHECKPOINT
      </span>
    </div>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ background: "hsl(210 40% 96.1%)" }}>
            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(215.4 16.3% 46.9%)", fontSize: 10 }}>SM</th>
            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(215.4 16.3% 46.9%)", fontSize: 10 }}>Squad</th>
            {COLS.map((c) => (
              <th key={c.key} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "hsl(215.4 16.3% 46.9%)", fontSize: 10 }}>
                {c.label}
              </th>
            ))}
            <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "hsl(215.4 16.3% 46.9%)", fontSize: 10 }}>
              Rpts
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.sm}-${row.squad}`} style={{ borderTop: "1px solid hsl(214 31.8% 91.4%)" }}>
              <td style={{ padding: "6px 12px", fontWeight: 600, color: smColors[row.sm] || "hsl(222.2 84% 4.9%)" }}>
                {row.sm}
              </td>
              <td style={{ padding: "6px 12px" }}>{row.squad}</td>
              {COLS.map((c) => {
                const val = row[c.key as keyof SquadHealth] as number;
                return (
                  <td key={c.key} style={{
                    padding: "6px 10px", textAlign: "center", fontWeight: 600,
                    background: cellColor(val, c.key === "parado"),
                    color: val === -1 ? "hsl(215.4 16.3% 46.9%)" : "hsl(222.2 84% 4.9%)",
                  }}>
                    {cellText(val)}
                  </td>
                );
              })}
              <td style={{ padding: "6px 10px", textAlign: "center", color: "hsl(215.4 16.3% 46.9%)" }}>
                {row.totalReports}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default SquadHealthTable;
