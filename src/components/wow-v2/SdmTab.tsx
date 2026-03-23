import React from "react";
import { fontSerif, fontMono, labelStyle } from "@/styles/constants";
import { SM_NAMES, smColors, SM_SQUAD_DETAILS } from "@/data/squads";
import { useWeeklyReports, getCurrentWeek } from "@/hooks/useWeeklyReport";
import type { WeeklyReport } from "@/hooks/useWeeklyReport";
import { useConeData, getSmTotalsFromData, getTorreTotalsFromData } from "@/hooks/useConeData";
import MetricCard from "./MetricCard";
import ConeStatus from "./ConeStatus";

const SdmTab: React.FC = () => {
  const { reports, loading } = useWeeklyReports();
  const { data: coneData, loading: coneLoading, isLive } = useConeData();
  const torre = getTorreTotalsFromData(coneData);
  const week = getCurrentWeek();

  const getLatestReport = (sm: string): WeeklyReport | null => {
    return reports.find((r) => r.sm === sm && r.week === week) || null;
  };

  return (
    <div>
      {/* Week indicator */}
      <div style={{
        ...fontMono, fontSize: 9, color: "rgba(26,29,35,.4)",
        marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: isLive ? "#2A6B50" : "#c9a84c" }} />
        VISÃO CONSOLIDADA · SEMANA {week} {isLive ? "· DADOS REAIS" : "· MOCK"}
      </div>

      {/* Torre Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
        <MetricCard label="Vazão Torre" value={torre.vazao} unit="itens" accent="#c9a84c" />
        <MetricCard label="Cycle Time Médio" value={torre.cycleTime} unit="dias" />
        <MetricCard label="Itens >P85" value={torre.acimP85} accent={torre.acimP85 > 5 ? "#9E3D2B" : "#0f1729"} />
        <MetricCard label="Squads Ativos" value={torre.totalSquads} />
      </div>

      {/* SM Cards */}
      <div style={{ ...labelStyle, color: "#0f1729", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 12, height: 1, background: "#0f1729" }} />Resumo por Scrum Master
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {SM_NAMES.map((sm) => {
          const totals = getSmTotalsFromData(coneData, sm);
          const report = getLatestReport(sm);
          const squads = SM_SQUAD_DETAILS[sm] || [];
          const smData = coneData[sm] || {};

          return (
            <div key={sm} style={{
              background: "#fff", border: "1px solid #e0dcd7",
              borderLeft: `4px solid ${smColors[sm]}`,
              transition: "border-left-width .15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderLeftWidth = "6px")}
              onMouseLeave={(e) => (e.currentTarget.style.borderLeftWidth = "4px")}
            >
              {/* Header */}
              <div style={{
                padding: "12px 16px", borderBottom: "1px solid #f0ede8",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ ...fontSerif, fontSize: 16, fontWeight: 600, color: smColors[sm] }}>{sm}</span>
                  <span style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.35)" }}>
                    {squads.map(s => s.name).join(" · ")}
                  </span>
                </div>
                <div style={{
                  ...fontMono, fontSize: 8, fontWeight: 600,
                  padding: "2px 7px",
                  background: report ? "rgba(42,107,80,.08)" : "rgba(158,61,43,.08)",
                  border: `1px solid ${report ? "rgba(42,107,80,.2)" : "rgba(158,61,43,.2)"}`,
                  color: report ? "#2A6B50" : "#9E3D2B",
                }}>
                  {report ? "● REPORT ✓" : "○ PENDENTE"}
                </div>
              </div>

              {/* Metrics inline */}
              <div style={{ padding: "10px 16px", display: "flex", gap: 16, borderBottom: "1px solid #f0ede8", flexWrap: "wrap" }}>
                {[
                  { l: "Vazão", v: totals.vazao },
                  { l: "Cycle", v: `${totals.cycleTime}d` },
                  { l: ">P85", v: totals.acimP85 },
                ].map(({ l, v }) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.4)", textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1d23" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.4)", textTransform: "uppercase", letterSpacing: ".08em" }}>Cone</span>
                  <ConeStatus status={totals.worstCone} />
                </div>
              </div>

              {/* Qualitative content */}
              {report ? (
                <div style={{ padding: "12px 16px" }}>
                  {[
                    { label: "Tração", text: report.q1, color: "#2A6B50" },
                    { label: "Travado", text: report.q2, color: "#9E3D2B" },
                    { label: "Narrativa", text: report.q3, color: "#c9a84c" },
                  ].filter(({ text }) => text?.trim()).map(({ label, text, color }) => (
                    <div key={label} style={{
                      borderLeft: `2px solid ${color}`,
                      paddingLeft: 10, marginBottom: 8,
                    }}>
                      <div style={{ ...fontMono, fontSize: 8, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 12, color: "#1a1d23", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
                        {text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "16px", textAlign: "center" }}>
                  <span style={{ ...fontMono, fontSize: 10, color: "rgba(26,29,35,.3)" }}>
                    Aguardando report semanal...
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Transversal Patterns */}
      <div style={{ ...labelStyle, color: "#9E3D2B", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 12, height: 1, background: "#9E3D2B" }} />Padrões Transversais · Detecção Automática
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(() => {
          const patterns: { icon: string; text: string; severity: "critical" | "warning" | "info" }[] = [];
          let totalAcimP85 = 0;
          const criticalCones: string[] = [];
          const pendingReports: string[] = [];

          SM_NAMES.forEach((sm) => {
            const smData = coneData[sm] || {};
            Object.entries(smData).forEach(([squad, data]) => {
              totalAcimP85 += data.acimP85;
              if (data.cone === "red") criticalCones.push(`${squad} (${sm})`);
            });
            if (!getLatestReport(sm)) pendingReports.push(sm);
          });

          if (totalAcimP85 > 0)
            patterns.push({ icon: "⚠", text: `${totalAcimP85} itens acima do P85 na torre — risco de envelhecimento`, severity: totalAcimP85 > 5 ? "critical" : "warning" });
          if (criticalCones.length > 0)
            patterns.push({ icon: "🔴", text: `Cones críticos: ${criticalCones.join(", ")}`, severity: "critical" });
          if (pendingReports.length > 0)
            patterns.push({ icon: "○", text: `Reports pendentes: ${pendingReports.join(", ")}`, severity: "info" });

          if (patterns.length === 0) {
            return (
              <div style={{ ...fontMono, fontSize: 10, color: "rgba(26,29,35,.3)", padding: "12px 0" }}>
                Nenhum padrão detectado — torre saudável.
              </div>
            );
          }

          const sevColors = { critical: "#9E3D2B", warning: "#9a7b2e", info: "rgba(26,29,35,.45)" };
          return patterns.map((p, i) => (
            <div key={i} style={{
              background: "#fff", border: "1px solid #e0dcd7",
              borderLeft: `3px solid ${sevColors[p.severity]}`,
              padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 12 }}>{p.icon}</span>
              <span style={{ fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: "#1a1d23" }}>
                {p.text}
              </span>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};

export default SdmTab;
