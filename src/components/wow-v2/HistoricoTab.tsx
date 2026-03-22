import React, { useState } from "react";
import { fontSerif, fontMono, labelStyle } from "@/styles/constants";
import { SM_NAMES, smColors } from "@/data/squads";
import { useWeeklyReports } from "@/hooks/useWeeklyReport";

const HistoricoTab: React.FC = () => {
  const { reports, loading } = useWeeklyReports();
  const [filterSm, setFilterSm] = useState("");

  const filtered = filterSm ? reports.filter((r) => r.sm === filterSm) : reports;

  return (
    <div>
      {/* SM Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <div
          onClick={() => setFilterSm("")}
          style={{
            padding: "5px 12px", fontSize: 10, fontWeight: !filterSm ? 600 : 400,
            color: !filterSm ? "#fff" : "rgba(26,29,35,.5)",
            background: !filterSm ? "#0f1729" : "transparent",
            border: `1px solid ${!filterSm ? "#0f1729" : "#e0dcd7"}`,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          }}
        >
          Todos
        </div>
        {SM_NAMES.map((sm) => (
          <div
            key={sm}
            onClick={() => setFilterSm(sm)}
            style={{
              padding: "5px 12px", fontSize: 10, fontWeight: filterSm === sm ? 600 : 400,
              color: filterSm === sm ? "#fff" : "rgba(26,29,35,.5)",
              background: filterSm === sm ? smColors[sm] : "transparent",
              border: `1px solid ${filterSm === sm ? smColors[sm] : "#e0dcd7"}`,
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {sm}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ ...fontMono, fontSize: 10, color: "rgba(26,29,35,.4)", padding: "30px 0", textAlign: "center" }}>
          Carregando histórico...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div style={{ ...fontMono, fontSize: 10, color: "rgba(26,29,35,.3)", marginBottom: 4 }}>
            Nenhum report semanal encontrado.
          </div>
          <div style={{ fontSize: 11, color: "rgba(26,29,35,.25)", fontFamily: "'DM Sans',sans-serif" }}>
            Os reports aparecerão aqui após o primeiro envio.
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", paddingLeft: 24 }}>
          {/* Timeline line */}
          <div style={{
            position: "absolute", left: 7, top: 0, bottom: 0,
            width: 1, background: "#e0dcd7",
          }} />

          {filtered.map((report, i) => {
            const smColor = smColors[report.sm] || "#0f1729";
            return (
              <div key={report.id} style={{ position: "relative", marginBottom: 16 }}>
                {/* Dot */}
                <div style={{
                  position: "absolute", left: -20, top: 14,
                  width: 10, height: 10, borderRadius: "50%",
                  background: smColor, border: "2px solid #fff",
                  boxShadow: "0 0 0 1px #e0dcd7",
                }} />

                {/* Card */}
                <div style={{
                  background: "#fff", border: "1px solid #e0dcd7",
                  borderLeft: `3px solid ${smColor}`,
                }}>
                  <div style={{
                    padding: "10px 14px", borderBottom: "1px solid #f0ede8",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...fontSerif, fontSize: 13, fontWeight: 600, color: smColor }}>{report.sm}</span>
                      <span style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.35)" }}>Semana {report.week}</span>
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px" }}>
                    {[
                      { label: "Tração", text: report.q1, color: "#2A6B50" },
                      { label: "Travado", text: report.q2, color: "#9E3D2B" },
                      { label: "Narrativa", text: report.q3, color: "#c9a84c" },
                    ].filter(({ text }) => text?.trim()).map(({ label, text, color }) => (
                      <div key={label} style={{
                        borderLeft: `2px solid ${color}`,
                        paddingLeft: 10, marginBottom: 6,
                      }}>
                        <div style={{ ...fontMono, fontSize: 7, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 1 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 11, color: "#1a1d23", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
                          {text}
                        </div>
                      </div>
                    ))}
                    {!report.q1?.trim() && !report.q2?.trim() && !report.q3?.trim() && (
                      <span style={{ ...fontMono, fontSize: 9, color: "rgba(26,29,35,.3)" }}>Report vazio</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoricoTab;
