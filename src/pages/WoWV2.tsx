import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fontSerif, fontMono } from "@/styles/constants";
import SmReportTab from "@/components/wow-v2/SmReportTab";
import SdmTab from "@/components/wow-v2/SdmTab";
import HistoricoTab from "@/components/wow-v2/HistoricoTab";
import FrameworkTab from "@/components/tabs/FrameworkTab";
import CadenciasTab from "@/components/tabs/CadenciasTab";
import PapelTab from "@/components/tabs/PapelTab";
import PadroesTab from "@/components/tabs/PadroesTab";

const OPS_TABS = [
  { id: "report", label: "Report SM", icon: "◉" },
  { id: "sdm", label: "Visão SDM", icon: "◎" },
  { id: "historico", label: "Histórico", icon: "↻" },
];

const REF_TABS = [
  { id: "framework", label: "Framework", icon: "◯" },
  { id: "cadencias", label: "Cadências", icon: "↻" },
  { id: "papel", label: "Papel", icon: "◎" },
  { id: "padroes", label: "Padrões", icon: "◆" },
];

export default function WoWV2() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("report");
  const [exp, setExp] = useState<string | null>(null);

  const renderTab = (t: typeof OPS_TABS[0], isRef = false) => (
    <div
      key={t.id}
      onClick={() => setTab(t.id)}
      style={{
        padding: "7px 14px", fontSize: 11,
        fontWeight: tab === t.id ? 600 : 400,
        color: tab === t.id ? "#fff" : isRef ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.35)",
        cursor: "pointer",
        borderBottom: tab === t.id ? `2px solid ${isRef ? "rgba(201,168,76,.5)" : "#c9a84c"}` : "2px solid transparent",
        display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
        fontFamily: "'DM Sans',sans-serif",
        opacity: isRef && tab !== t.id ? 0.7 : 1,
      }}
    >
      <span style={{ fontSize: 9, opacity: tab === t.id ? 1 : 0.4 }}>{t.icon}</span>
      {t.label}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ef" }}>
      {/* Navbar */}
      <div style={{ background: "#0f1729", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center", height: 44, gap: 10 }}>
          <div
            onClick={() => navigate("/")}
            style={{ ...fontSerif, fontSize: 17, color: "#fff", cursor: "pointer" }}
          >
            Torre <span style={{ color: "#c9a84c", fontWeight: 600 }}>LM</span>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,.1)" }} />
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#c9a84c", ...fontMono }}>
            WoW v2
          </div>
          <div style={{ flex: 1 }} />
          <div
            onClick={() => navigate("/")}
            style={{ fontSize: 10, color: "rgba(255,255,255,.35)", cursor: "pointer", padding: "4px 8px", ...fontMono }}
          >
            ← WoW v1
          </div>
          <div
            onClick={() => navigate("/dashboard")}
            style={{
              fontSize: 9, fontWeight: 600, padding: "3px 8px",
              background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.25)",
              color: "#c9a84c", cursor: "pointer", ...fontMono,
            }}
          >
            📊 DASHBOARD
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center" }}>
          {OPS_TABS.map((t) => renderTab(t, false))}
          {/* Separator */}
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,.08)", margin: "0 10px", flexShrink: 0 }} />
          {REF_TABS.map((t) => renderTab(t, true))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 18px 60px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...fontSerif, fontSize: 22, color: "#0f1729", marginBottom: 3 }}>
            {tab === "report" && "Report Semanal"}
            {tab === "sdm" && "Visão Consolidada"}
            {tab === "historico" && "Histórico de Reports"}
            {tab === "framework" && "Ciclo de Cadência"}
            {tab === "cadencias" && "Cadências"}
            {tab === "papel" && "Papel & Regras"}
            {tab === "padroes" && "Padrões & Métricas"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(26,29,35,.4)", fontFamily: "'DM Sans',sans-serif" }}>
            {tab === "report" && "Métricas do cone automáticas + 3 perguntas qualitativas · Preenchimento semanal (sexta)"}
            {tab === "sdm" && "Consolidação da torre para o sync de segunda · Métricas + contexto qualitativo"}
            {tab === "historico" && "Timeline de todos os reports semanais enviados"}
            {tab === "framework" && "Visualização do ciclo completo de cadências da torre"}
            {tab === "cadencias" && "Todas as cadências do SM e SDM em detalhe"}
            {tab === "papel" && "O que o SM faz, não faz, anti-padrões e a tríade"}
            {tab === "padroes" && "DoR, DoD, métricas obrigatórias e proteção baseada em fatos"}
          </div>
        </div>

        {tab === "report" && <SmReportTab />}
        {tab === "sdm" && <SdmTab />}
        {tab === "historico" && <HistoricoTab />}
        {tab === "framework" && <FrameworkTab setTab={setTab} setExp={setExp} />}
        {tab === "cadencias" && <CadenciasTab exp={exp} setExp={setExp} />}
        {tab === "papel" && <PapelTab />}
        {tab === "padroes" && <PadroesTab />}
      </div>
    </div>
  );
}
