import React from "react";
import type { CheckpointStats, SmFrequency } from "@/hooks/useDashboardData";
import { fontMono } from "@/styles/constants";

interface Props {
  totalReports: number;
  checkpointStats: CheckpointStats[];
  smFrequency: SmFrequency[];
}

const colors: Record<string, string> = {
  cone: "hsl(222.2 47.4% 11.2%)",
  pdti: "hsl(210 40% 30%)",
  parado: "hsl(0 84.2% 60.2%)",
  wipEpic: "hsl(280 40% 40%)",
  wipUs: "hsl(280 30% 55%)",
};

const KPICards: React.FC<Props> = ({ totalReports, checkpointStats, smFrequency }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 20 }}>
    {/* Total reports */}
    <div style={{
      padding: "14px 16px", background: "hsl(222.2 84% 4.9%)", borderRadius: 8, color: "hsl(210 40% 98%)",
    }}>
      <div style={{ ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.5, marginBottom: 6 }}>
        TOTAL REPORTS
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{totalReports}</div>
      <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>
        {smFrequency.map((s) => `${s.sm}: ${s.count}`).join(" · ")}
      </div>
    </div>

    {/* Checkpoint cards */}
    {checkpointStats.map((cp) => {
      const isGood = cp.key === "parado" ? cp.pct < 30 : cp.pct >= 70;
      return (
        <div key={cp.key} style={{
          padding: "14px 16px", background: "hsl(0 0% 100%)", borderRadius: 8,
          border: `1px solid hsl(214 31.8% 91.4%)`,
        }}>
          <div style={{ ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)", marginBottom: 6 }}>
            {cp.label}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: colors[cp.key] || "hsl(222.2 84% 4.9%)" }}>
              {cp.pct}%
            </span>
            <span style={{ fontSize: 10, color: isGood ? "hsl(142 50% 35%)" : "hsl(0 84.2% 60.2%)", fontWeight: 600 }}>
              {cp.key === "parado"
                ? (isGood ? "✓ Baixo" : "⚠ Alto")
                : (isGood ? "✓ Bom" : "⚠ Atenção")}
            </span>
          </div>
          {/* Mini bar */}
          <div style={{ height: 4, background: "hsl(210 40% 96.1%)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2, width: `${cp.pct}%`,
              background: isGood ? "hsl(142 50% 35%)" : "hsl(0 84.2% 60.2%)",
              transition: "width .5s ease",
            }} />
          </div>
          <div style={{ fontSize: 9, color: "hsl(215.4 16.3% 46.9%)", marginTop: 4 }}>
            {cp.yes} sim · {cp.no} não · {cp.total} respostas
          </div>
        </div>
      );
    })}
  </div>
);

export default KPICards;
