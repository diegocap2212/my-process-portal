import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fontSerif, fontMono } from "@/styles/constants";
import SmReportTab from "@/components/wow-v2/SmReportTab";
import SdmTab from "@/components/wow-v2/SdmTab";
import HistoricoTab from "@/components/wow-v2/HistoricoTab";

const TABS = [
  { id: "report", label: "Report SM", icon: "◉" },
  { id: "sdm", label: "Visão SDM", icon: "◎" },
  { id: "historico", label: "Histórico", icon: "↻" },
];

const PAGE_META: Record<string, { title: string; desc: string }> = {
  report: { title: "Report Semanal", desc: "Métricas do cone automáticas + perguntas qualitativas · Preenchimento semanal (sexta)" },
  sdm: { title: "Visão Consolidada", desc: "Consolidação da torre para o sync de segunda · Métricas + contexto qualitativo" },
  historico: { title: "Histórico de Reports", desc: "Timeline de todos os reports semanais enviados" },
};

export default function Reports() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("report");

  const meta = PAGE_META[tab] || PAGE_META.report;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      {/* Navbar */}
      <div style={{
        background: "#fff", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 16 }}>
          <div
            style={{ ...fontSerif, fontSize: 20, color: "#111827", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Ways of Working <span style={{ color: "#6366f1", fontWeight: 700 }}>Venice</span>
          </div>
          <div style={{ flex: 1 }} />
          <div
            onClick={() => navigate("/")}
            style={{
              fontSize: 13, fontWeight: 500, padding: "6px 16px",
              background: "#f3f4f6", color: "#374151", borderRadius: 8,
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              border: "1px solid #e5e7eb",
            }}
          >
            ◯ Framework
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
          {TABS.map((t) => (
            <div
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 16px", fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? "#111827" : "#9ca3af",
                cursor: "pointer",
                borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                fontFamily: "'DM Sans',sans-serif",
                transition: "all .2s",
              }}
            >
              <span style={{ fontSize: 10, opacity: tab === t.id ? 1 : 0.4 }}>{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...fontSerif, fontSize: 28, color: "#111827", marginBottom: 4, fontWeight: 600 }}>
            {meta.title}
          </div>
          <div style={{ fontSize: 14, color: "#9ca3af", fontFamily: "'DM Sans',sans-serif" }}>
            {meta.desc}
          </div>
        </div>

        {tab === "report" && <SmReportTab />}
        {tab === "sdm" && <SdmTab />}
        {tab === "historico" && <HistoricoTab />}
      </div>
    </div>
  );
}
