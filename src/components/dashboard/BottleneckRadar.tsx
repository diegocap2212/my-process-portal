import React from "react";
import type { Bottleneck } from "@/hooks/useDashboardData";
import { fontMono } from "@/styles/constants";
import { smColors } from "@/data/squads";

interface Props {
  bottlenecks: Bottleneck[];
}

const typeEmoji: Record<string, string> = {
  parado: "🛑",
  wipEpic: "📊",
  wipUs: "📋",
  cone: "📐",
  pdti: "📄",
};

const BottleneckRadar: React.FC<Props> = ({ bottlenecks }) => {
  if (bottlenecks.length === 0) {
    return (
      <div style={{
        background: "hsla(142, 50%, 35%, 0.08)", borderRadius: 8,
        border: "1px solid hsla(142, 50%, 35%, 0.2)", padding: "16px 20px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div>
            <div style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(142 50% 30%)" }}>
              SEM GARGALOS DETECTADOS
            </div>
            <div style={{ fontSize: 11, color: "hsl(142 50% 25%)", marginTop: 2 }}>
              Nenhum squad apresenta problemas recorrentes no período filtrado.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "hsl(0 0% 100%)", borderRadius: 8,
      border: "1px solid hsl(214 31.8% 91.4%)", overflow: "hidden", marginBottom: 20,
    }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid hsl(214 31.8% 91.4%)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>🚨</span>
        <span style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(0 84% 45%)" }}>
          RADAR DE GARGALOS — {bottlenecks.length} ALERTA{bottlenecks.length > 1 ? "S" : ""}
        </span>
      </div>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {bottlenecks.map((b, i) => (
          <div key={`${b.sm}-${b.squad}-${b.type}-${i}`} style={{
            padding: "12px 14px", borderRadius: 6,
            background: b.severity === "critical"
              ? "hsla(0, 84%, 60%, 0.06)"
              : "hsla(45, 90%, 50%, 0.06)",
            border: `1px solid ${b.severity === "critical"
              ? "hsla(0, 84%, 60%, 0.2)"
              : "hsla(45, 90%, 50%, 0.3)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{typeEmoji[b.type] || "⚠️"}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
                padding: "2px 6px", borderRadius: 3,
                background: b.severity === "critical" ? "hsla(0,84%,60%,0.15)" : "hsla(45,90%,50%,0.15)",
                color: b.severity === "critical" ? "hsl(0 84% 40%)" : "hsl(35 80% 35%)",
              }}>
                {b.severity === "critical" ? "CRÍTICO" : "ATENÇÃO"}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: smColors[b.sm] || "hsl(222 84% 4.9%)" }}>
                {b.sm}
              </span>
              <span style={{ fontSize: 11, color: "hsl(215.4 16.3% 46.9%)" }}>→</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(222.2 84% 4.9%)" }}>
                {b.squad}
              </span>
              <span style={{ fontSize: 10, color: "hsl(215.4 16.3% 46.9%)", marginLeft: "auto" }}>
                {b.pct}% dos reports
              </span>
            </div>
            <div style={{ fontSize: 11, color: "hsl(222.2 47.4% 11.2%)", fontWeight: 500 }}>
              {b.label}
            </div>
            {b.lastText && (
              <div style={{
                fontSize: 10, color: "hsl(215.4 16.3% 46.9%)", marginTop: 4,
                fontStyle: "italic", lineHeight: 1.4,
                borderLeft: "2px solid hsl(214 31.8% 91.4%)", paddingLeft: 8,
              }}>
                "{b.lastText.length > 200 ? b.lastText.slice(0, 200) + "…" : b.lastText}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottleneckRadar;
