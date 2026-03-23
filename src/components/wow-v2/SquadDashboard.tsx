import React, { useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { useSquadDashboard } from "@/hooks/useSquadDashboard";
import { useSquadReports, useSquadOverrides } from "@/hooks/useSquadReports";
import { getCurrentWeek } from "@/hooks/useWeeklyReport";
import type { JiraItem } from "@/services/metricsCalculator";
import { fontMono, inputStyle } from "@/styles/constants";
import MetricCard from "./MetricCard";

interface Props {
  rawItems: JiraItem[];
  squadName: string;
  sm: string;
  accent: string;
}

interface EditModal {
  week: string;
  entradas: number;
  saidas: number;
}

const sectionLabel = (text: string, color: string) => (
  <div style={{
    ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em",
    textTransform: "uppercase" as const, color, marginBottom: 10, marginTop: 20,
    display: "flex", alignItems: "center", gap: 6,
  }}>
    <span style={{ width: 10, height: 1, background: color }} />{text}
  </div>
);

const REPORT_FIELDS = [
  { key: "q1" as const, n: "①", label: "O que você tracionou que os números não mostram?", ph: "Desbloqueios, facilitações, alinhamentos, decisões que você conduziu..." },
  { key: "q2" as const, n: "②", label: "Algo travado que precisa de escalação?", ph: "Se não tem nada travado, deixe em branco. Se tem, diga o quê." },
  { key: "q3" as const, n: "③", label: "Alguma entrega que deveria virar narrativa pro cliente?", ph: "Desbloqueio, entrega, resultado com potencial de virar munição executiva..." },
  { key: "q4" as const, n: "④", label: "Acompanhamento", ph: "Temas livres, anotações, pontos para condensar ao longo do tempo..." },
];

const SquadDashboard: React.FC<Props> = ({ rawItems, squadName, sm, accent }) => {
  const week = getCurrentWeek();
  const { report, updateField, saveReport, saving } = useSquadReports(sm, squadName, week);
  const { overrides, saveOverride } = useSquadOverrides(sm, squadName);
  const [selectedRelease, setSelectedRelease] = useState<string>("");
  const { kpis, weeklyData, releases } = useSquadDashboard(rawItems, squadName, sm, overrides, selectedRelease || undefined);

  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const realData = weeklyData.filter((w) => w.aFazer > 0 || w.entradas > 0 || w.saidas > 0);
  const projectionData = weeklyData.filter((w) => w.melhorCenario !== undefined);
  const burndownData = [...realData.map(w => ({ ...w })), ...projectionData];

  const handleBarClick = useCallback((data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      const p = data.activePayload[0].payload;
      setEditModal({ week: p.week, entradas: p.entradas, saidas: p.saidas });
    }
  }, []);

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setEditSaving(true);
    await Promise.all([
      saveOverride(editModal.week, "criados", editModal.entradas),
      saveOverride(editModal.week, "resolvidos", editModal.saidas),
    ]);
    setEditSaving(false);
    setEditModal(null);
  };

  return (
    <div style={{
      background: "#faf9f7", border: "1px solid #e0dcd7", borderTop: `3px solid ${accent}`,
      padding: "16px 20px", marginBottom: 16,
    }}>
      {/* Release filter */}
      {releases.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "rgba(26,29,35,.45)" }}>Release</span>
          <select
            value={selectedRelease}
            onChange={(e) => setSelectedRelease(e.target.value)}
            style={{
              ...fontMono, fontSize: 10, padding: "4px 8px",
              border: "1px solid #e0dcd7", background: "#fff",
              color: "#1a1d23", cursor: "pointer",
            }}
          >
            <option value="">Todas</option>
            {releases.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 4 }}>
        <MetricCard label="Escopo Total" value={kpis.escopo} unit="itens" accent={accent} small />
        <MetricCard label="Entregas" value={kpis.entregas} unit="itens" accent="#2A6B50" small />
        <MetricCard label="WIP" value={kpis.wip} unit="itens" accent={kpis.wip > 10 ? "#9E3D2B" : "#0f1729"} small />
        <MetricCard label="Lead Time" value={kpis.leadTime} unit="dias" small />
      </div>

      {/* Burndown & Cone */}
      {sectionLabel("Burndown & Projeção do Cone", accent)}
      <div style={{ background: "#fff", border: "1px solid #e0dcd7", padding: "12px", marginBottom: 4 }}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={burndownData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0dcd7" />
            <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#999" />
            <YAxis tick={{ fontSize: 9 }} stroke="#999" />
            <Tooltip contentStyle={{ fontSize: 11, background: "#0f1729", color: "#fff", border: "none", borderRadius: 4 }} />
            <Area type="monotone" dataKey="aFazer" name="A Fazer (Real)" stroke={accent} fill={accent} fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="melhorCenario" name="Melhor Cenário" stroke="#2A6B50" fill="#2A6B50" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="5 3" />
            <Area type="monotone" dataKey="piorCenario" name="Pior Cenário" stroke="#9E3D2B" fill="#9E3D2B" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="5 3" />
            <Area type="monotone" dataKey="tendencia" name="Tendência" stroke="#c9a84c" fill="none" strokeWidth={1.5} strokeDasharray="3 3" />
            <Legend wrapperStyle={{ fontSize: 9 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Itens Planejados vs Não Planejados */}
      {sectionLabel("Itens Planejados vs Não Planejados", "#7B5EA7")}
      <div style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.45)", marginBottom: 8, marginTop: -8, lineHeight: 1.4 }}>
        Planejado = criado antes da semana e resolvido nela &nbsp;|&nbsp; Não Planejado = criado e resolvido na mesma semana
      </div>
      <div style={{ background: "#fff", border: "1px solid #e0dcd7", padding: "12px", marginBottom: 4 }}>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={realData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0dcd7" />
            <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#999" />
            <YAxis yAxisId="left" tick={{ fontSize: 9 }} stroke="#999" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} stroke="#999" domain={[0, 100]} unit="%" />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              const total = (d?.planejadas || 0) + (d?.naoPlanejadas || 0);
              return (
                <div style={{ background: "#0f1729", color: "#fff", padding: "10px 14px", borderRadius: 4, fontSize: 11, lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: "#2A6B50" }}>✓ Planejados: {d?.planejadas || 0}</div>
                  <div style={{ color: "#c9a84c" }}>⚡ Não Planejados: {d?.naoPlanejadas || 0}</div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.15)", marginTop: 4, paddingTop: 4 }}>
                    Total: {total} &nbsp;·&nbsp; Taxa: {d?.percentPlanejado || 0}%
                  </div>
                </div>
              );
            }} />
            <Bar yAxisId="left" dataKey="planejadas" name="Planejados" stackId="plan" fill="#2A6B50" fillOpacity={0.75} radius={[0, 0, 0, 0]} />
            <Bar yAxisId="left" dataKey="naoPlanejadas" name="Não Planejados" stackId="plan" fill="#c9a84c" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="percentPlanejado" name="% Planejamento" stroke="#7B5EA7" strokeWidth={2} dot={{ r: 3, fill: "#7B5EA7" }} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Vazão Semanal */}
      {sectionLabel("Vazão Semanal", "#2A6B50")}
      <div style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.45)", marginBottom: 8, marginTop: -8, lineHeight: 1.4 }}>
        Total de itens resolvidos por semana &nbsp;·&nbsp; Linha tracejada = média móvel (4 sem)
      </div>
      <div style={{ background: "#fff", border: "1px solid #e0dcd7", padding: "12px" }}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={realData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0dcd7" />
            <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#999" />
            <YAxis yAxisId="left" tick={{ fontSize: 9 }} stroke="#999" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} stroke="#999" />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div style={{ background: "#0f1729", color: "#fff", padding: "10px 14px", borderRadius: 4, fontSize: 11, lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: "#2A6B50" }}>Vazão: {d?.vazaoTotal || 0} itens</div>
                  <div style={{ color: "#7B5EA7" }}>Média Móvel: {d?.mediaMovel || 0}</div>
                  <div style={{ color: "#9E3D2B" }}>Lead Time: {d?.leadTime || 0} dias</div>
                </div>
              );
            }} />
            <Bar yAxisId="left" dataKey="vazaoTotal" name="Vazão" fill="#2A6B50" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="mediaMovel" name="Média Móvel (4 sem)" stroke="#7B5EA7" strokeWidth={2} strokeDasharray="6 3" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="leadTime" name="Lead Time (dias)" stroke="#9E3D2B" strokeWidth={2} dot={{ r: 3 }} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Qualitative Report per Squad */}
      {sectionLabel(`Report Semanal · ${squadName}`, accent)}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
        {REPORT_FIELDS.map(({ key, n, label, ph }) => (
          <div key={key}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{ ...fontMono, fontSize: 11, color: accent, fontWeight: 700 }}>{n}</span>
              <span style={{ fontSize: 11, color: "#1a1d23", fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{label}</span>
            </div>
            <textarea
              value={report[key]}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={ph}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" as const, background: "#fff" }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => saveReport()}
        disabled={saving}
        style={{
          width: "100%", padding: "10px", background: saving ? "#555" : "#0f1729",
          color: "#fff", border: "none", fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
          cursor: saving ? "wait" : "pointer",
        }}
      >
        {saving ? "Salvando..." : `Salvar report · ${squadName}`}
      </button>

      {/* Edit Modal */}
      {editModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15,23,41,.6)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
        }} onClick={() => setEditModal(null)}>
          <div style={{
            background: "#fff", padding: "24px", minWidth: 320,
            border: "1px solid #e0dcd7", boxShadow: "0 8px 32px rgba(0,0,0,.2)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: accent, marginBottom: 16 }}>
              Editar · {editModal.week}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ ...fontMono, fontSize: 9, color: "rgba(26,29,35,.5)", display: "block", marginBottom: 4 }}>Entradas</label>
              <input
                type="number"
                value={editModal.entradas}
                onChange={(e) => setEditModal({ ...editModal, entradas: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...fontMono, fontSize: 9, color: "rgba(26,29,35,.5)", display: "block", marginBottom: 4 }}>Saídas</label>
              <input
                type="number"
                value={editModal.saidas}
                onChange={(e) => setEditModal({ ...editModal, saidas: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                style={{
                  flex: 1, padding: "10px", background: "#0f1729", color: "#fff",
                  border: "none", ...fontMono, fontSize: 10, fontWeight: 600,
                  letterSpacing: ".08em", textTransform: "uppercase" as const, cursor: "pointer",
                }}
              >
                {editSaving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setEditModal(null)}
                style={{
                  padding: "10px 16px", background: "transparent", color: "#1a1d23",
                  border: "1px solid #e0dcd7", ...fontMono, fontSize: 10, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadDashboard;
