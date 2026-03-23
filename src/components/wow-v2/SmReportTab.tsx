import React, { useState } from "react";
import { fontSerif, fontMono, labelStyle, inputStyle } from "@/styles/constants";
import { SM_NAMES, SM_SQUAD_DETAILS, smColors } from "@/data/squads";
import MetricCard from "./MetricCard";
import ConeStatus from "./ConeStatus";
import { useWeeklyReports, getCurrentWeek } from "@/hooks/useWeeklyReport";
import { useConeData, getSmTotalsFromData } from "@/hooks/useConeData";

const SmReportTab: React.FC = () => {
  const [selectedSm, setSelectedSm] = useState(SM_NAMES[0]);
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { submitWeeklyReport } = useWeeklyReports();
  const smData = CONE_MOCK_DATA[selectedSm] || {};
  const totals = getSmTotals(selectedSm);
  const week = getCurrentWeek();

  const handleSubmit = async () => {
    if (!q1.trim() && !q2.trim() && !q3.trim()) return;
    setSubmitting(true);
    const ok = await submitWeeklyReport({ sm: selectedSm, week, q1, q2, q3 });
    if (ok) { setQ1(""); setQ2(""); setQ3(""); }
    setSubmitting(false);
  };

  return (
    <div>
      {/* SM Selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {SM_NAMES.map((sm) => (
          <div
            key={sm}
            onClick={() => { setSelectedSm(sm); setQ1(""); setQ2(""); setQ3(""); }}
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
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c" }} />
        SEMANA {week}
      </div>

      {/* Metrics Grid */}
      <div style={{ ...labelStyle, color: "#7B5EA7", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 12, height: 1, background: "#7B5EA7" }} />Métricas do Cone · Automático
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
        <MetricCard label="Vazão" value={totals.vazao} unit="itens" accent={smColors[selectedSm]} />
        <MetricCard label="Cycle Time" value={totals.cycleTime} unit="dias" />
        <MetricCard label="P85" value={totals.p85} unit="dias" />
        <MetricCard label="Itens >P85" value={totals.acimP85} accent={totals.acimP85 > 2 ? "#9E3D2B" : "#0f1729"} />
      </div>

      {/* Squad Table */}
      <div style={{
        background: "#fff", border: "1px solid #e0dcd7", marginBottom: 24, overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
          padding: "8px 12px", background: "#faf9f7", borderBottom: "1px solid #e0dcd7",
        }}>
          {["Squad", "Vazão", "Cycle", "P85", ">P85", "Cone"].map((h) => (
            <div key={h} style={{ ...fontMono, fontSize: 8, fontWeight: 600, letterSpacing: ".1em", color: "rgba(26,29,35,.4)", textTransform: "uppercase" }}>
              {h}
            </div>
          ))}
        </div>
        {Object.entries(smData).map(([squad, data], i) => (
          <div key={squad} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
            padding: "10px 12px", borderBottom: i < Object.keys(smData).length - 1 ? "1px solid #f0ede8" : "none",
            background: i % 2 === 1 ? "#fdfcfb" : "#fff",
            alignItems: "center",
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#1a1d23", fontFamily: "'DM Sans',sans-serif" }}>
              {squad}
              {SM_SQUAD_DETAILS[selectedSm]?.find(s => s.name === squad)?.description && (
                <span style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.35)", marginLeft: 6 }}>
                  {SM_SQUAD_DETAILS[selectedSm].find(s => s.name === squad)!.description}
                </span>
              )}
            </div>
            <div style={{ ...fontMono, fontSize: 12, color: "#1a1d23" }}>{data.vazao}</div>
            <div style={{ ...fontMono, fontSize: 12, color: "#1a1d23" }}>{data.cycleTime}d</div>
            <div style={{ ...fontMono, fontSize: 12, color: "#1a1d23" }}>{data.p85}d</div>
            <div style={{ ...fontMono, fontSize: 12, color: data.acimP85 > 0 ? "#9E3D2B" : "#1a1d23", fontWeight: data.acimP85 > 0 ? 600 : 400 }}>
              {data.acimP85}
            </div>
            <ConeStatus status={data.cone} />
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
        disabled={submitting || (!q1.trim() && !q2.trim() && !q3.trim())}
        style={{
          width: "100%", padding: "12px", background: submitting ? "#555" : "#0f1729",
          color: "#fff", border: "none", fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
          cursor: submitting ? "wait" : "pointer", opacity: (!q1.trim() && !q2.trim() && !q3.trim()) ? 0.4 : 1,
        }}
      >
        {submitting ? "Salvando..." : "Enviar report da semana"}
      </button>
    </div>
  );
};

export default SmReportTab;
