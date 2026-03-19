import React from "react";
import type { SmSummary, Bottleneck } from "@/hooks/useDashboardData";
import { fontMono, fontSerif } from "@/styles/constants";
import { smColors, PROJECT_TYPE_COLORS } from "@/data/squads";
import type { ProjectType } from "@/data/squads";

interface Props {
  summaries: SmSummary[];
  bottlenecks: Bottleneck[];
}

const ExecutiveSummary: React.FC<Props> = ({ summaries, bottlenecks }) => {
  if (summaries.length === 0) return null;

  const bottlenecksBySm = (sm: string) => bottlenecks.filter(b => b.sm === sm);

  return (
    <div style={{
      background: "hsl(0 0% 100%)", borderRadius: 8,
      border: "1px solid hsl(214 31.8% 91.4%)", overflow: "hidden", marginBottom: 20,
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid hsl(214 31.8% 91.4%)" }}>
        <span style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)" }}>
          RESUMO EXECUTIVO POR SM
        </span>
      </div>

      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
        {summaries.map((s) => {
          const smBottlenecks = bottlenecksBySm(s.sm);
          return (
            <div key={s.sm} style={{
              border: "1px solid hsl(214 31.8% 91.4%)", borderRadius: 6,
              overflow: "hidden",
            }}>
              {/* SM Header */}
              <div style={{
                padding: "10px 14px",
                background: `${smColors[s.sm] || "hsl(222.2 84% 4.9%)"}10`,
                borderBottom: "1px solid hsl(214 31.8% 91.4%)",
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              }}>
                <div style={{
                  ...fontSerif, fontSize: 16, fontWeight: 600,
                  color: smColors[s.sm] || "hsl(222.2 84% 4.9%)",
                }}>
                  {s.sm}
                </div>
                <span style={{ ...fontMono, fontSize: 9, color: "hsl(215.4 16.3% 46.9%)" }}>
                  {s.totalReports} reports
                </span>
                {smBottlenecks.length > 0 && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                    background: "hsla(0, 84%, 60%, 0.12)", color: "hsl(0 84% 40%)",
                  }}>
                    {smBottlenecks.length} gargalo{smBottlenecks.length > 1 ? "s" : ""}
                  </span>
                )}
                {s.alertSquads.length > 0 && (
                  <div style={{
                    marginLeft: "auto", fontSize: 9, fontWeight: 600,
                    color: "hsl(0 84% 45%)", display: "flex", alignItems: "center", gap: 4,
                  }}>
                    ⚠ {s.alertSquads.join(", ")}
                  </div>
                )}
              </div>

              <div style={{ padding: "10px 14px" }}>
                {/* Squads by project type */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {Object.entries(s.squadsByType).map(([type, squads]) => (
                    <div key={type} style={{
                      padding: "4px 8px", borderRadius: 4, fontSize: 10,
                      background: `${PROJECT_TYPE_COLORS[type as ProjectType] || "hsl(215 16% 47%)"}15`,
                      color: PROJECT_TYPE_COLORS[type as ProjectType] || "hsl(215 16% 47%)",
                      fontWeight: 600,
                    }}>
                      {type}: {squads.join(", ")}
                    </div>
                  ))}
                </div>

                {/* 3-column layout: O que aconteceu / Problemas / Ações */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <TextSection
                    title="O QUE ACONTECEU"
                    items={s.recentOQue}
                    emptyText="Sem atualizações"
                    accentColor="hsl(222 47% 30%)"
                  />
                  <TextSection
                    title="PROBLEMAS"
                    items={s.recentProblems}
                    emptyText="Nenhum problema reportado"
                    accentColor="hsl(0 84% 45%)"
                  />
                  <TextSection
                    title="AÇÕES TOMADAS"
                    items={s.recentActions}
                    emptyText="Nenhuma ação registrada"
                    accentColor="hsl(142 50% 30%)"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function TextSection({ title, items, emptyText, accentColor }: {
  title: string; items: string[]; emptyText: string; accentColor: string;
}) {
  return (
    <div>
      <div style={{
        ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em",
        textTransform: "uppercase", color: accentColor, marginBottom: 6,
      }}>
        {title}
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 10, color: "hsl(215.4 16.3% 46.9%)", fontStyle: "italic" }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              fontSize: 10, lineHeight: 1.4, color: "hsl(222.2 47.4% 11.2%)",
              borderLeft: `2px solid ${accentColor}30`,
              paddingLeft: 8,
            }}>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExecutiveSummary;
