import React, { useState, useMemo } from "react";
import { fontSerif, fontMono, labelStyle, inputStyle } from "@/styles/constants";
import { SM_NAMES, SM_SQUAD_DETAILS, smColors } from "@/data/squads";

import ConeStatus from "./ConeStatus";
import SquadDashboard from "./SquadDashboard";
import { useWeeklyReports, getCurrentWeek } from "@/hooks/useWeeklyReport";
import { useConeData } from "@/hooks/useConeData";
import { parseExcelDate } from "@/services/metricsCalculator";

const PERIOD_OPTIONS = [
  { label: "Última semana", days: 7 },
  { label: "Últimas 2 semanas", days: 14 },
  { label: "Últimas 4 semanas", days: 28 },
  { label: "Último mês", days: 30 },
  { label: "Últimos 3 meses", days: 90 },
  { label: "Tudo", days: 0 },
];

const SmReportTab: React.FC = () => {
  const [selectedSm, setSelectedSm] = useState(SM_NAMES[0]);
  
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [periodDays, setPeriodDays] = useState(28);

  const { submitWeeklyReport } = useWeeklyReports();
  const { data: coneData, rawItems, loading: coneLoading, isLive } = useConeData();
  const smData = coneData[selectedSm] || {};
  const week = getCurrentWeek();

  const handleSubmit = async () => {
    if (!q1.trim() && !q2.trim() && !q3.trim() && !q4.trim()) return;
    setSubmitting(true);
    const ok = await submitWeeklyReport({ sm: selectedSm, week, q1, q2, q3, q4 });
    if (ok) { setQ1(""); setQ2(""); setQ3(""); setQ4(""); }
    setSubmitting(false);
  };

  return (
    <div>
      {/* SM Selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {SM_NAMES.map((sm) => (
          <div
            key={sm}
            onClick={() => { setSelectedSm(sm); setQ1(""); setQ2(""); setQ3(""); setQ4(""); }}
            style={{
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: selectedSm === sm ? 600 : 400,
              color: selectedSm === sm ? "#fff" : "rgba(26,29,35,.5)",
              background: selectedSm === sm ? smColors[sm] : "transparent",
              border: `1px solid ${selectedSm === sm ? smColors[sm] : "#e0dcd7"}`,
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              transition: "all .2s",
            }}
          >
            {sm}
          </div>
        ))}
      </div>

      {/* Week indicator */}
      <div style={{
        ...fontMono, fontSize: 9, color: "rgba(26,29,35,.4)",
        marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: isLive ? "#2A6B50" : "#c9a84c" }} />
        SEMANA {week} {isLive ? "· DADOS REAIS" : "· MOCK"}
      </div>

      {/* Métricas do Cone por Squad */}
      <div style={{ ...labelStyle, color: "#7B5EA7", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 12, height: 1, background: "#7B5EA7" }} />Métricas do Cone · Automático
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        {Object.entries(smData).map(([squad, data]) => (
          <div key={squad} style={{ background: "#fff", border: "1px solid #e0dcd7" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderBottom: "1px solid #e0dcd7", background: "#faf9f7",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23", fontFamily: "'DM Sans',sans-serif" }}>{squad}</span>
                {SM_SQUAD_DETAILS[selectedSm]?.find(s => s.name === squad)?.description && (
                  <span style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.35)" }}>
                    {SM_SQUAD_DETAILS[selectedSm].find(s => s.name === squad)!.description}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ ...fontMono, fontSize: 10, color: "rgba(26,29,35,.5)" }}>
                  Vazão <span style={{ fontWeight: 600, color: "#1a1d23" }}>{data.vazao}</span> · Cycle <span style={{ fontWeight: 600, color: "#1a1d23" }}>{data.cycleTime}d</span> · P85 <span style={{ fontWeight: 600, color: "#1a1d23" }}>{data.p85}d</span> · {">"}P85 <span style={{ fontWeight: 600, color: data.acimP85 > 0 ? "#9E3D2B" : "#1a1d23" }}>{data.acimP85}</span>
                </div>
                <ConeStatus status={data.cone} />
              </div>
            </div>
            <div style={{ padding: "12px" }}>
              <SquadDashboard rawItems={rawItems} squadName={squad} sm={selectedSm} accent={smColors[selectedSm]} />
            </div>
          </div>
        ))}
      </div>

      {/* Qualitative Report */}
      <div style={{ ...labelStyle, color: "#2A6B50", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 12, height: 1, background: "#2A6B50" }} />Report Semanal · Qualitativo
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {[
          { n: "①", label: "O que você tracionou que os números não mostram?", val: q1, set: setQ1, ph: "Desbloqueios, facilitações, alinhamentos, decisões que você conduziu..." },
          { n: "②", label: "Algo travado que precisa de escalação?", val: q2, set: setQ2, ph: "Se não tem nada travado, deixe em branco. Se tem, diga o quê e em qual squad." },
          { n: "③", label: "Alguma entrega que deveria virar narrativa pro cliente?", val: q3, set: setQ3, ph: "Desbloqueio, entrega, resultado que tem potencial de virar munição executiva..." },
          { n: "④", label: "Acompanhamento", val: q4, set: setQ4, ph: "Temas livres, anotações, pontos para condensar ao longo do tempo..." },
        ].map(({ n, label, val, set, ph }) => (
          <div key={n}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{ ...fontMono, fontSize: 11, color: smColors[selectedSm], fontWeight: 700 }}>{n}</span>
              <span style={{ fontSize: 11, color: "#1a1d23", fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{label}</span>
            </div>
            <textarea
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={ph}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" as const }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || (!q1.trim() && !q2.trim() && !q3.trim() && !q4.trim())}
        style={{
          width: "100%", padding: "12px", background: submitting ? "#555" : "#0f1729",
          color: "#fff", border: "none", fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
          cursor: submitting ? "wait" : "pointer", opacity: (!q1.trim() && !q2.trim() && !q3.trim() && !q4.trim()) ? 0.4 : 1,
        }}
      >
        {submitting ? "Salvando..." : "Enviar report da semana"}
      </button>
    </div>
  );
};

export default SmReportTab;
