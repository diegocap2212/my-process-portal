import React from "react";
import type { SmFrequency } from "@/hooks/useDashboardData";
import type { Report } from "@/types/report";
import { fontMono, fontSerif } from "@/styles/constants";
import { smColors } from "@/data/squads";

interface Props {
  totalReports: number;
  smFrequency: SmFrequency[];
  bottleneckCount: number;
  criticalCount: number;
  reports: Report[];
}

const ContextCards: React.FC<Props> = ({ totalReports, smFrequency, bottleneckCount, criticalCount, reports }) => {
  // Last report date per SM
  const lastReportBySm: Record<string, string> = {};
  reports.forEach((r) => {
    if (!lastReportBySm[r.sm] || r.date > lastReportBySm[r.sm]) {
      lastReportBySm[r.sm] = r.date;
    }
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 20 }}>
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

      {/* Bottleneck count */}
      <div style={{
        padding: "14px 16px", background: "hsl(0 0% 100%)", borderRadius: 8,
        border: bottleneckCount > 0
          ? "1px solid hsla(0, 84%, 60%, 0.3)"
          : "1px solid hsl(214 31.8% 91.4%)",
      }}>
        <div style={{ ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)", marginBottom: 6 }}>
          GARGALOS ATIVOS
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: bottleneckCount > 0 ? "hsl(0 84% 45%)" : "hsl(142 50% 30%)" }}>
            {bottleneckCount}
          </span>
          {criticalCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "hsl(0 84% 45%)" }}>
              {criticalCount} crítico{criticalCount > 1 ? "s" : ""}
            </span>
          )}
          {bottleneckCount === 0 && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "hsl(142 50% 30%)" }}>✓ Sem alertas</span>
          )}
        </div>
      </div>

      {/* Last report per SM */}
      <div style={{
        padding: "14px 16px", background: "hsl(0 0% 100%)", borderRadius: 8,
        border: "1px solid hsl(214 31.8% 91.4%)",
      }}>
        <div style={{ ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)", marginBottom: 8 }}>
          ÚLTIMO REPORT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {Object.entries(lastReportBySm).sort(([a], [b]) => a.localeCompare(b)).map(([sm, date]) => (
            <div key={sm} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: smColors[sm] || "hsl(222.2 84% 4.9%)" }}>{sm}</span>
              <span style={{ ...fontMono, fontSize: 10, color: "hsl(215.4 16.3% 46.9%)" }}>{date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextCards;
