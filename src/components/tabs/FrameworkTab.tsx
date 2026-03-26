import React, { useState, useCallback } from "react";
import { fontSerif, fontMono } from "@/styles/constants";
import { CAD_SM, CAD_SDM } from "@/data/cadencias";
import type { Cadencia } from "@/types/report";

interface FrameworkTabProps {
  setTab: (t: string) => void;
  setExp: (id: string | null) => void;
}

const ALL_CADENCIAS: (Cadencia & { role: "SM" | "SDM" })[] = [
  ...CAD_SM.map((c) => ({ ...c, role: "SM" as const })),
  ...CAD_SDM.map((c) => ({ ...c, role: "SDM" as const })),
];

const PILLARS = [
  { icon: "🎯", label: "Papel do SM", desc: "O que faz, não faz, anti-padrões", color: "#1A3A8F", tab: "papel" },
  { icon: "📐", label: "Padrões & Métricas", desc: "DoR, DoD, métricas obrigatórias", color: "#7B5EA7", tab: "padroes" },
  { icon: "🔺", label: "Tríade Ativa", desc: "SM + PO + Tech Lead em sincronia", color: "#2A6B50", tab: "papel" },
  { icon: "🛡️", label: "Proteção Baseada em Fatos", desc: "Dados blindam decisões da torre", color: "#9E3D2B", tab: "padroes" },
];

const FrameworkTab: React.FC<FrameworkTabProps> = ({ setTab, setExp }) => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);

  const handleCadenciaClick = useCallback((id: string) => {
    setTab("cadencias");
    setTimeout(() => setExp(id), 100);
  }, [setTab, setExp]);

  const cx = 50, cy = 50, r = 36;
  const nodes = ALL_CADENCIAS.map((c, i) => {
    const angle = (-90 + (i * 360) / ALL_CADENCIAS.length) * Math.PI / 180;
    return { ...c, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle };
  });

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* Hero header */}
      <div style={{ 
        background: "#0f1729", padding: "32px 28px 28px", marginBottom: 24,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          background: "radial-gradient(circle, rgba(201,168,76,.06) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ ...fontMono, fontSize: 9, fontWeight: 600, letterSpacing: ".14em", color: "#c9a84c", marginBottom: 8, textTransform: "uppercase" }}>
            Framework operacional
          </div>
          <div style={{ ...fontSerif, fontSize: 26, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>
            Ciclo de <em style={{ fontStyle: "italic", color: "#c9a84c" }}>Cadência</em>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.6, maxWidth: 480 }}>
            Um report alimenta tudo. O SM preenche uma vez por semana — o sistema distribui para sync, report para Lucas, apresentação à LM e apresentação para CTO.
          </div>
        </div>
      </div>

      {/* Cycle visualization */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 24, marginBottom: 28 }}>
        <div style={{ background: "#fff", border: "1px solid #e8e4df", padding: 20 }}>
          <div style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "#7B5EA7", marginBottom: 14, textTransform: "uppercase" }}>
            Engrenagem do ciclo
          </div>
          <svg viewBox="0 0 100 100" style={{ width: "100%", maxWidth: 420, display: "block", margin: "0 auto" }}>
            {/* Outer orbit ring */}
            <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="#e8e4df" strokeWidth=".15" strokeDasharray="2 3" />
            {/* Main orbit */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d4d0cb" strokeWidth=".2" />

            {/* Arc arrows between nodes */}
            {nodes.map((n, i) => {
              const next = nodes[(i + 1) % nodes.length];
              const gap = 360 / nodes.length;
              const a1 = ((-90 + (i * gap) + gap * 0.2) * Math.PI) / 180;
              const a2 = ((-90 + ((i + 1) * gap) - gap * 0.2) * Math.PI) / 180;
              return (
                <g key={`arc-${i}`}>
                  <defs>
                    <marker id={`arrow-${i}`} markerWidth="3" markerHeight="2.5" refX="2.8" refY="1.25" orient="auto">
                      <polygon points="0 0,3 1.25,0 2.5" fill={next.tagColor} opacity=".3" />
                    </marker>
                  </defs>
                  <path
                    d={`M${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}A${r} ${r} 0 0 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}`}
                    fill="none" stroke={next.tagColor} strokeWidth=".25" opacity=".15"
                    markerEnd={`url(#arrow-${i})`}
                  />
                </g>
              );
            })}

            {/* Center hub */}
            <circle cx={cx} cy={cy} r="10" fill="#0f1729" />
            <circle cx={cx} cy={cy} r="10" fill="none" stroke="#c9a84c" strokeWidth=".2" opacity=".3" />
            <text x={cx} y={cy - 1.5} textAnchor="middle" fill="#c9a84c" fontSize="3.5" fontWeight="700" style={fontSerif}>SDM</text>
            <text x={cx} y={cy + 1.5} textAnchor="middle" fill="rgba(255,255,255,.35)" fontSize="1.3" style={fontMono} letterSpacing=".06em">CONSOLIDA</text>
            <text x={cx} y={cy + 3.5} textAnchor="middle" fill="rgba(255,255,255,.2)" fontSize="1.1" style={fontMono}>& DISTRIBUI</text>

            {/* Nodes */}
            {nodes.map((n, i) => {
              const isHovered = hoveredNode === i;
              const isSdm = n.role === "SDM";
              const nodeR = isHovered ? 6.5 : 5.5;
              return (
                <g
                  key={n.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCadenciaClick(n.id)}
                  onMouseEnter={() => setHoveredNode(i)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Hover glow */}
                  {isHovered && (
                    <circle cx={n.x} cy={n.y} r={nodeR + 3} fill={n.tagColor} opacity=".06" />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={n.x} cy={n.y} r={nodeR}
                    fill={isHovered ? `${n.tagColor}08` : "#fff"}
                    stroke={isHovered ? n.tagColor : "#d4d0cb"}
                    strokeWidth={isHovered ? ".4" : ".2"}
                  />
                  {/* SDM dashed ring */}
                  {isSdm && (
                    <circle cx={n.x} cy={n.y} r={nodeR} fill="none"
                      stroke={n.tagColor} strokeWidth=".15" strokeDasharray=".6 .6" opacity=".5" />
                  )}
                  {/* Emoji */}
                  <text x={n.x} y={n.y + 1.2} textAnchor="middle" fontSize="3.8" style={{ pointerEvents: "none" }}>
                    {n.emoji}
                  </text>
                  {/* Label */}
                  <text
                    x={n.x} y={n.y + nodeR + 2.8}
                    textAnchor="middle" fill="#1a1d23" fontSize="1.6" fontWeight="600"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.label.length > 22 ? n.label.slice(0, 20) + "…" : n.label}
                  </text>
                  {/* Role badge */}
                  <text
                    x={n.x} y={n.y + nodeR + 4.6}
                    textAnchor="middle" fill={n.tagColor} fontSize="1" fontWeight="700"
                    style={{ pointerEvents: "none", ...fontMono }}
                    letterSpacing=".08em"
                  >
                    {isSdm ? "SDM" : "SM"} · {n.freq?.split("·")[0]?.trim()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#8a8580" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid #d4d0cb" }} />
              <span>SM executa</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#8a8580" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px dashed #8a8580" }} />
              <span>SDM consolida</span>
            </div>
          </div>
        </div>

        {/* Right column: cadencia list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "#1A3A8F", textTransform: "uppercase", marginBottom: 2 }}>
            Cadências do SM
          </div>
          {CAD_SM.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCadenciaClick(c.id)}
              style={{
                background: "#fff", border: "1px solid #e8e4df", padding: "10px 12px",
                cursor: "pointer", borderLeft: `3px solid ${c.tagColor}`,
                transition: "all .15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderLeftWidth = "5px"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderLeftWidth = "3px"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 14 }}>{c.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 10, color: "#8a8580", ...fontMono }}>{c.freq}</div>
            </div>
          ))}

          <div style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "#6B3A8A", textTransform: "uppercase", marginTop: 8, marginBottom: 2 }}>
            SDM consolida
          </div>
          {CAD_SDM.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCadenciaClick(c.id)}
              style={{
                background: "#fff", border: "1px solid #e8e4df", padding: "10px 12px",
                cursor: "pointer", borderLeft: `3px dashed ${c.tagColor}`,
                transition: "all .15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderLeftWidth = "5px"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderLeftWidth = "3px"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 14 }}>{c.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 10, color: "#8a8580", ...fontMono }}>{c.freq}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pillars grid */}
      <div style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "#9E3D2B", textTransform: "uppercase", marginBottom: 8 }}>
        Pilares de sustentação
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
        {PILLARS.map((p, i) => (
          <div
            key={i}
            onClick={() => setTab(p.tab)}
            onMouseEnter={() => setHoveredPillar(i)}
            onMouseLeave={() => setHoveredPillar(null)}
            style={{
              background: "#fff", border: "1px solid #e8e4df", padding: "16px 14px",
              cursor: "pointer",
              borderBottom: `3px solid ${hoveredPillar === i ? p.color : p.color + "20"}`,
              transition: "all .15s ease",
            }}
          >
            <span style={{ fontSize: 20, display: "block", marginBottom: 6 }}>{p.icon}</span>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1d23", marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 10, color: "#8a8580", lineHeight: 1.4 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Bottom quote */}
      <div style={{ background: "#0f1729", padding: "18px 24px", position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, width: 3, height: "100%",
          background: "linear-gradient(to bottom, #c9a84c, transparent)"
        }} />
        <div style={{ ...fontSerif, fontSize: 13, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,.6)", fontStyle: "italic", paddingLeft: 12 }}>
          "O report semanal do SM alimenta tudo: sync, report para Lucas, apresentação à LM, apresentação para CTO. Um preenchimento por semana — o sistema distribui."
        </div>
      </div>
    </div>
  );
};

export default React.memo(FrameworkTab);
