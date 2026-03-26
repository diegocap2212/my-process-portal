import React, { useState, useCallback, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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

const PERIOD_OPTIONS = [
  { label: "Todo o período", value: "all" },
  { label: "Últimas 4 semanas", value: "4w" },
  { label: "Últimas 8 semanas", value: "8w" },
  { label: "Últimas 12 semanas", value: "12w" },
  { label: "Último mês", value: "1m" },
  { label: "Últimos 3 meses", value: "3m" },
  { label: "Últimos 6 meses", value: "6m" },
];

const sectionLabel = (text: string, color: string) => (
  <div style={{
    fontSize: 16, fontWeight: 700, color: "#111827",
    marginBottom: 12, marginTop: 28,
    fontFamily: "'DM Sans',sans-serif",
  }}>
    {text}
  </div>
);

const REPORT_FIELDS = [
  { key: "q1" as const, n: "①", label: "O que você tracionou que os números não mostram?", ph: "Desbloqueios, facilitações, alinhamentos, decisões que você conduziu..." },
  { key: "q2" as const, n: "②", label: "Algo travado que precisa de escalação?", ph: "Se não tem nada travado, deixe em branco. Se tem, diga o quê." },
  { key: "q3" as const, n: "③", label: "Alguma entrega que deveria virar narrativa pro cliente?", ph: "Desbloqueio, entrega, resultado com potencial de virar munição executiva..." },
  { key: "q4" as const, n: "④", label: "Acompanhamento", ph: "Temas livres, anotações, pontos para condensar ao longo do tempo..." },
];

function getFilterDate(period: string): Date | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  switch (period) {
    case "4w": return new Date(now.getTime() - 4 * 7 * 86400000);
    case "8w": return new Date(now.getTime() - 8 * 7 * 86400000);
    case "12w": return new Date(now.getTime() - 12 * 7 * 86400000);
    case "1m": { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
    case "3m": { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
    case "6m": { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d; }
    default: return null;
  }
}

const SquadDashboard: React.FC<Props> = ({ rawItems, squadName, sm, accent }) => {
  const week = getCurrentWeek();
  const { report, updateField, saveReport, saving } = useSquadReports(sm, squadName, week);
  const { overrides, saveOverride } = useSquadOverrides(sm, squadName);
  const [selectedRelease, setSelectedRelease] = useState<string>("");
  const [period, setPeriod] = useState("all");
  const { kpis, weeklyData, releases } = useSquadDashboard(rawItems, squadName, sm, overrides, selectedRelease || undefined);

  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Apply period filter to weekly data
  const filterDate = useMemo(() => getFilterDate(period), [period]);

  const filteredWeeklyData = useMemo(() => {
    if (!filterDate) return weeklyData;
    return weeklyData.filter((w) => w.weekDate >= filterDate);
  }, [weeklyData, filterDate]);

  // Separate burndown/projection data from weekly performance data
  const burndownData = filteredWeeklyData.filter(
    (w) => w.aFazer !== null || w.melhorCenario !== undefined
  );
  const performanceData = filteredWeeklyData.filter(
    (w) => w.melhorCenario === undefined && (w.vazaoTotal > 0 || w.entradas > 0 || w.planejadas > 0 || w.naoPlanejadas > 0 || w.transbordos > 0)
  );

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

  const chartCardStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "20px",
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,.04)",
  };

  const tooltipStyle: React.CSSProperties = {
    background: "#fff",
    color: "#111827",
    padding: "12px 16px",
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 1.6,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 16px rgba(0,0,0,.08)",
  };

  return (
    <div>
      {/* Filters bar */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center",
        marginBottom: 20,
      }}>
        {releases.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em" }}>Release</span>
            <select
              value={selectedRelease}
              onChange={(e) => setSelectedRelease(e.target.value)}
              style={{
                fontSize: 13, padding: "6px 12px",
                border: "1px solid #e5e7eb", borderRadius: 8,
                background: "#fff", color: "#111827", cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <option value="">Todas</option>
              {releases.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em" }}>Período</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              fontSize: 13, padding: "6px 12px",
              border: "1px solid #e5e7eb", borderRadius: 8,
              background: "#fff", color: "#111827", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 8 }}>
        <MetricCard label="Escopo Total" value={kpis.escopo} unit="" accent={accent} small />
        <MetricCard label="Entregas" value={kpis.entregas} unit="" accent="#059669" small />
        <MetricCard label="WIP (A Fazer)" value={kpis.wip} unit="" accent={kpis.wip > 10 ? "#dc2626" : "#111827"} small />
        <MetricCard label="Lead Time" value={kpis.leadTime} unit="d" small />
      </div>

      {/* Burndown & Cone */}
      {sectionLabel("Burndown & Projeção do Cone", accent)}
      <div style={chartCardStyle}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={burndownData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e7eb" />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e7eb" />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="aFazer" name="Realizado" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.08} strokeWidth={2} connectNulls={false} />
            <Area type="monotone" dataKey="melhorCenario" name="Melhor Cenário" stroke="#059669" fill="#059669" fillOpacity={0.04} strokeWidth={1.5} strokeDasharray="5 3" />
            <Area type="monotone" dataKey="piorCenario" name="Pior Cenário" stroke="#dc2626" fill="#dc2626" fillOpacity={0.04} strokeWidth={1.5} strokeDasharray="5 3" />
            <Area type="monotone" dataKey="tendencia" name="Tendência" stroke="#d97706" fill="none" strokeWidth={1.5} strokeDasharray="3 3" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Throughput & Balanço side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Throughput */}
        <div style={chartCardStyle}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
            Throughput Mensurado
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performanceData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} onClick={handleBarClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 8, fill: "#9ca3af" }} stroke="#e5e7eb" angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e7eb" />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                const total = (d?.planejadas || 0) + (d?.naoPlanejadas || 0);
                const pct = total > 0 ? Math.round((d?.planejadas / total) * 100) : 0;
                return (
                  <div style={tooltipStyle}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    <div style={{ color: "#059669" }}>✓ Planejadas: {d?.planejadas || 0}</div>
                    <div style={{ color: "#d97706" }}>⚡ Não Planejadas: {d?.naoPlanejadas || 0}</div>
                    <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 4, paddingTop: 4 }}>
                      Vazão Total: {total} · Taxa: {pct}%
                    </div>
                    {d?.leadTime > 0 && <div>Lead Time: {d.leadTime} dias</div>}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="vazaoTotal" name="Vazão Total" fill="#4f46e5" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9ca3af" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#4f46e5" }} /> Vazão Total
            </div>
          </div>
        </div>

        {/* Balanço do Fluxo */}
        <div style={chartCardStyle}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
            Balanço do Fluxo (Delta)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performanceData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 8, fill: "#9ca3af" }} stroke="#e5e7eb" angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e7eb" />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={tooltipStyle}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    <div style={{ color: "#7c3aed" }}>Demandas Criadas: {d?.entradas || 0}</div>
                    <div style={{ color: "#059669" }}>Entregas Feitas: {d?.saidas || 0}</div>
                    <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 4, paddingTop: 4, color: (d?.saldo || 0) > 0 ? "#dc2626" : "#059669" }}>
                      Saldo: {(d?.saldo || 0) > 0 ? "+" : ""}{d?.saldo || 0}
                    </div>
                    {d?.transbordos > 0 && <div>Transbordos: {d.transbordos}</div>}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="entradas" name="Demandas Criadas" fill="#7c3aed" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" name="Entregas Feitas" fill="#059669" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {performanceData.length > 0 && (
            <div style={{
              marginTop: 8, padding: "8px 12px", background: "#f9fafb", borderRadius: 8,
              fontSize: 12, color: "#6b7280", fontFamily: "'DM Sans',sans-serif",
            }}>
              Saldo (Semana Atual): <strong style={{ color: (performanceData[performanceData.length - 1]?.saldo || 0) > 0 ? "#dc2626" : "#059669" }}>
                {(performanceData[performanceData.length - 1]?.saldo || 0) > 0 ? "+" : ""}
                {performanceData[performanceData.length - 1]?.saldo || 0}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Qualitative Report per Squad */}
      <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 12, marginTop: 28, fontFamily: "'DM Sans',sans-serif" }}>
        Report Semanal · {squadName}
      </div>
      <div style={{ ...chartCardStyle, marginBottom: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {REPORT_FIELDS.map(({ key, n, label, ph }) => (
            <div key={key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>{n}</span>
                <span style={{ fontSize: 13, color: "#111827", fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{label}</span>
              </div>
              <textarea
                value={report[key]}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={ph}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical" as const,
                  background: "#f9fafb",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => saveReport()}
          disabled={saving}
          style={{
            width: "100%", padding: "12px", marginTop: 16,
            background: saving ? "#9ca3af" : "#6366f1",
            color: "#fff", border: "none", borderRadius: 8,
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13, fontWeight: 600,
            cursor: saving ? "wait" : "pointer",
            transition: "background .2s",
          }}
        >
          {saving ? "Salvando..." : `Salvar report · ${squadName}`}
        </button>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(4px)",
        }} onClick={() => setEditModal(null)}>
          <div style={{
            background: "#fff", padding: "28px", minWidth: 340, borderRadius: 16,
            border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,.15)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 20, fontFamily: "'DM Sans',sans-serif" }}>
              Editar · {editModal.week}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>Entradas</label>
              <input
                type="number"
                value={editModal.entradas}
                onChange={(e) => setEditModal({ ...editModal, entradas: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>Saídas</label>
              <input
                type="number"
                value={editModal.saidas}
                onChange={(e) => setEditModal({ ...editModal, saidas: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                style={{
                  flex: 1, padding: "10px", background: "#6366f1", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {editSaving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setEditModal(null)}
                style={{
                  padding: "10px 20px", background: "#fff", color: "#374151",
                  border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13,
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
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
