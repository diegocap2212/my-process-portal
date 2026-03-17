import React from "react";
import { useNavigate } from "react-router-dom";
import { fontSerif, fontMono } from "@/styles/constants";

interface NavbarProps {
  tab: string;
  setTab: (t: string) => void;
  onTabChange?: () => void;
}

const TABS = [
  { id: "framework", l: "Framework", ic: "◯" },
  { id: "hoje", l: "Hoje", ic: "◉" },
  { id: "cadencias", l: "Cadências", ic: "↻" },
  { id: "papel", l: "Papel & Regras", ic: "◎" },
  { id: "padroes", l: "Padrões", ic: "◆" },
];

const Navbar: React.FC<NavbarProps> = ({ tab, setTab, onTabChange }) => (
  <div style={{ background: "#0f1729", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center", height: 44, gap: 10 }}>
      <div style={{ ...fontSerif, fontSize: 17, color: "#fff" }}>
        Torre <span style={{ color: "#c9a84c", fontWeight: 600 }}>LM</span>
      </div>
      <div style={{ width: 1, height: 14, background: "rgba(255,255,255,.1)" }} />
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", ...fontMono }}>WoW</div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", background: "rgba(42,107,80,.15)", border: "1px solid rgba(42,107,80,.2)", color: "#2A6B50", ...fontMono }}>● FIREBASE</div>
    </div>
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px", display: "flex", overflowX: "auto" }}>
      {TABS.map((t) => (
        <div
          key={t.id}
          onClick={() => { setTab(t.id); onTabChange?.(); }}
          style={{
            padding: "7px 12px", fontSize: 11,
            fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? "#fff" : "rgba(255,255,255,.35)",
            cursor: "pointer",
            borderBottom: tab === t.id ? "2px solid #c9a84c" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 9, opacity: tab === t.id ? 1 : 0.4 }}>{t.ic}</span>{t.l}
        </div>
      ))}
    </div>
  </div>
);

export default Navbar;
