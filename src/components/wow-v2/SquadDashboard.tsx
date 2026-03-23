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
  criados: number;
  resolvidos: number;
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

const SquadDashboard: React.FC<Props> = ({ rawItems, squadName, sm, accent }) => {
  const week = getCurrentWeek();
  const { notes, setNotes, saveNotes, saving } = useSquadReports(sm, squadName, week);
  const { overrides, saveOverride } = useSquadOverrides(sm, squadName);
  const { kpis, weeklyData } = useSquadDashboard(rawItems, squadName, sm, overrides);

  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const realData = weeklyData.filter((w) => w.aFazer > 0 || w.criados > 0 || w.resolvidos > 0);
  const projectionData = weeklyData.filter((w) => w.melhorCenario !== undefined);
  const burndownData = [...realData.map(w => ({ ...w })), ...projectionData];

  const handleBarClick = useCallback((data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      const p = data.activePayload[0].payload;
      setEditModal({ week: p.week, criados: p.criados, resolvidos: p.resolvidos });
    }
  }, []);

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setEditSaving(true);
    await Promise.all([
      saveOverride(editModal.week, "criados", editModal.criados),
      saveOverride(editModal.week, "resolvidos", editModal.resolvidos),
    ]);
    setEditSaving(false);
    setEditModal(null);
  };

  const handleNotesBlur = () => {
    saveNotes(notes);
  };

  return (
    <div style={{
      background: "#faf9f7", border: "1px solid #e0dcd7", borderTop: `3px solid ${accent}`,
      padding: "16px 20px", marginBottom: 16,
    }}>
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
            <Area type="monotone" dataKey="melhorCenario" name="Melhor (3/sem)" stroke="#2A6B50" fill="#2A6B50" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="5 3" />
            <Area type="monotone" dataKey="piorCenario" name="Pior (1/sem)" stroke="#9E3D2B" fill="#9E3D2B" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="5 3" />
            <Area type="monotone" dataKey="tendencia" name="Tendência" stroke="#c9a84c" fill="none" strokeWidth={1.5} strokeDasharray="3 3" />
            <Legend wrapperStyle={{ fontSize: 9 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Throughput - clickable */}
      {sectionLabel("Throughput Semanal · clique para editar", "#2A6B50")}
      <div style={{ background: "#fff", border: "1px solid #e0dcd7", padding: "12px", marginBottom: 4 }}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={realData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0dcd7" />
            <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#999" />
            <YAxis yAxisId="left" tick={{ fontSize: 9 }} stroke="#999" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} stroke="#999" />
            <Tooltip contentStyle={{ fontSize: 11, background: "#0f1729", color: "#fff", border: "none", borderRadius: 4 }} />
            <Bar yAxisId="left" dataKey="resolvidos" name="Vazão" fillOpacity={0.7} radius={[2, 2, 0, 0]}>
              {realData.map((entry, i) => (
                <Cell key={i} fill={entry.hasOverride ? "#c9a84c" : accent} stroke={entry.hasOverride ? "#9E3D2B" : "none"} strokeWidth={entry.hasOverride ? 2 : 0} strokeDasharray={entry.hasOverride ? "4 2" : ""} />
              ))}
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="leadTime" name="Lead Time (dias)" stroke="#c9a84c" strokeWidth={2} dot={{ r: 3 }} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Balanço do Fluxo - clickable */}
      {sectionLabel("Balanço do Fluxo · clique para editar", "#7B5EA7")}
      <div style={{ background: "#fff", border: "1px solid #e0dcd7", padding: "12px" }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={realData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0dcd7" />
            <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#999" />
            <YAxis tick={{ fontSize: 9 }} stroke="#999" />
            <Tooltip contentStyle={{ fontSize: 11, background: "#0f1729", color: "#fff", border: "none", borderRadius: 4 }} />
            <Bar dataKey="criados" name="Demandas Criadas" fillOpacity={0.6} radius={[2, 2, 0, 0]}>
              {realData.map((entry, i) => (
                <Cell key={i} fill={entry.hasOverride ? "#c9a84c" : "#7B5EA7"} stroke={entry.hasOverride ? "#9E3D2B" : "none"} strokeWidth={entry.hasOverride ? 2 : 0} strokeDasharray={entry.hasOverride ? "4 2" : ""} />
              ))}
            </Bar>
            <Bar dataKey="resolvidos" name="Entregas" fillOpacity={0.7} radius={[2, 2, 0, 0]}>
              {realData.map((entry, i) => (
                <Cell key={i} fill={entry.hasOverride ? "#c9a84c" : "#2A6B50"} stroke={entry.hasOverride ? "#9E3D2B" : "none"} strokeWidth={entry.hasOverride ? 2 : 0} strokeDasharray={entry.hasOverride ? "4 2" : ""} />
              ))}
            </Bar>
            <Legend wrapperStyle={{ fontSize: 9 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Squad Report textarea */}
      {sectionLabel(`Report · ${squadName}`, accent)}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleNotesBlur}
        placeholder={`Observações sobre ${squadName} esta semana...`}
        rows={4}
        style={{ ...inputStyle, resize: "vertical" as const, background: "#fff" }}
      />
      {saving && (
        <div style={{ ...fontMono, fontSize: 9, color: "rgba(26,29,35,.4)", marginTop: 4 }}>
          Salvando...
        </div>
      )}

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
              <label style={{ ...fontMono, fontSize: 9, color: "rgba(26,29,35,.5)", display: "block", marginBottom: 4 }}>Criados</label>
              <input
                type="number"
                value={editModal.criados}
                onChange={(e) => setEditModal({ ...editModal, criados: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...fontMono, fontSize: 9, color: "rgba(26,29,35,.5)", display: "block", marginBottom: 4 }}>Resolvidos</label>
              <input
                type="number"
                value={editModal.resolvidos}
                onChange={(e) => setEditModal({ ...editModal, resolvidos: parseInt(e.target.value) || 0 })}
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
