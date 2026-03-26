import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fontSerif, fontMono } from "@/styles/constants";
import FrameworkTab from "@/components/tabs/FrameworkTab";
import CadenciasTab from "@/components/tabs/CadenciasTab";
import PapelTab from "@/components/tabs/PapelTab";
import PadroesTab from "@/components/tabs/PadroesTab";

const SUB_TABS = [
  { id: "framework", label: "Framework", icon: "◯" },
  { id: "cadencias", label: "Cadências", icon: "↻" },
  { id: "papel", label: "Papel", icon: "◎" },
  { id: "padroes", label: "Padrões", icon: "◆" },
];

const PAGE_META: Record<string, { title: string; desc: string }> = {
  framework: { title: "Ciclo de Cadência", desc: "Visualização do ciclo completo de cadências da torre" },
  cadencias: { title: "Cadências", desc: "Todas as cadências do SM e SDM em detalhe" },
  papel: { title: "Papel & Regras", desc: "O que o SM faz, não faz, anti-padrões e a tríade" },
  padroes: { title: "Padrões & Métricas", desc: "DoR, DoD, métricas obrigatórias e proteção baseada em fatos" },
};

export default function WoWV2() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("framework");
  const [exp, setExp] = useState<string | null>(null);

  const meta = PAGE_META[tab] || PAGE_META.framework;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      {/* Navbar */}
      <div style={{
        background: "#fff", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 16 }}>
          <div style={{ ...fontSerif, fontSize: 20, color: "#111827", cursor: "pointer" }} onClick={() => { setTab("framework"); }}>
            Ways of Working <span style={{ color: "#6366f1", fontWeight: 700 }}>Venice</span>
          </div>
          <div style={{ flex: 1 }} />
          <div
            onClick={() => navigate("/reports")}
            style={{
              fontSize: 13, fontWeight: 500, padding: "6px 16px",
              background: "#6366f1", color: "#fff", borderRadius: 8,
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              transition: "background .2s",
            }}
          >
            📊 Reports
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
          {SUB_TABS.map((t) => (
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

        {tab === "framework" && <FrameworkTab setTab={setTab} setExp={setExp} />}
        {tab === "cadencias" && <CadenciasTab exp={exp} setExp={setExp} />}
        {tab === "papel" && <PapelTab />}
        {tab === "padroes" && <PadroesTab />}
      </div>
    </div>
  );
}
