import React, { useState } from "react";
import { fontSerif, fontMono } from "@/styles/constants";
import { CAD_SM, CAD_SDM } from "@/data/cadencias";
import type { Cadencia } from "@/types/report";

interface FrameworkTabProps {
  setTab: (t: string) => void;
  setExp: (id: string | null) => void;
}

const FrameworkTab: React.FC<FrameworkTabProps> = ({ setTab, setExp }) => {
  const [hover, setHover] = useState<number | null>(null);

  const allN: (Cadencia & { angle: number })[] = [...CAD_SM, ...CAD_SDM].map((c, i, arr) => ({
    ...c,
    angle: -90 + (i * 360) / arr.length,
  }));

  const cx = 50, cy = 50, r = 36;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ ...fontSerif, fontSize: 28, fontWeight: 400 }}>
          Ciclo de <em style={{ fontStyle: "italic", color: "#1A3A8F" }}>Cadência</em>
        </div>
        <p style={{ fontSize: 12, color: "#8a8580", marginTop: 6 }}>
          Um material, todas as cadências. Clique em qualquer nó.
        </p>
      </div>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", display: "block" }}>
          <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#7B5EA7" strokeWidth=".1" strokeDasharray="1 2" opacity=".2" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A3A8F" strokeWidth=".2" strokeDasharray="1.5 2" opacity=".12" />
          {allN.map((n, i) => {
            const nx2 = allN[(i + 1) % allN.length];
            const g = 360 / allN.length;
            const a1 = ((n.angle + g * 0.15) * Math.PI) / 180;
            const a2 = ((nx2.angle - g * 0.15) * Math.PI) / 180;
            return (
              <g key={`a${i}`}>
                <defs>
                  <marker id={`fw${i}`} markerWidth="3" markerHeight="2.5" refX="2.8" refY="1.25" orient="auto">
                    <polygon points="0 0,3 1.25,0 2.5" fill={nx2.tagColor} opacity=".35" />
                  </marker>
                </defs>
                <path
                  d={`M${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}A${r} ${r} 0 0 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}`}
                  fill="none" stroke={nx2.tagColor} strokeWidth=".3" strokeDasharray="1 1" opacity=".2"
                  markerEnd={`url(#fw${i})`}
                />
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r="9" fill="#0f1729" />
          <text x={cx} y={cy - 1} textAnchor="middle" fill="#fff" fontSize="4" fontWeight="700" style={fontSerif}>SDM</text>
          <text x={cx} y={cy + 2} textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="1.5" style={fontMono} letterSpacing=".05em">CONSOLIDA</text>
          {allN.map((n, i) => {
            const a = (n.angle * Math.PI) / 180;
            const nx = cx + r * Math.cos(a);
            const ny = cy + r * Math.sin(a);
            const h = hover === i;
            const nr = h ? 6 : 5;
            const sdm = CAD_SDM.some((c) => c.id === n.id);
            return (
              <g key={n.id} style={{ cursor: "pointer" }}
                onClick={() => { setTab("cadencias"); setTimeout(() => setExp(n.id), 100); }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {h && <circle cx={nx} cy={ny} r={nr + 2} fill={n.tagColor} opacity=".08" />}
                <circle cx={nx} cy={ny} r={nr} fill={h ? n.tagColor + "15" : "#fff"} stroke={h ? n.tagColor : "#e0ded8"} strokeWidth={h ? ".35" : ".2"} />
                {sdm && <circle cx={nx} cy={ny} r={nr} fill="none" stroke={n.tagColor} strokeWidth=".15" strokeDasharray=".5 .5" opacity=".4" />}
                <text x={nx} y={ny + 1.2} textAnchor="middle" fontSize="3.6" style={{ pointerEvents: "none" }}>{n.emoji}</text>
                <text x={nx} y={ny + nr + 2.4} textAnchor="middle" fill="#1a1d23" fontSize="1.7" fontWeight="600" style={{ pointerEvents: "none" }}>{n.label.length > 20 ? n.label.slice(0, 18) + "…" : n.label}</text>
                <text x={nx} y={ny + nr + 4.2} textAnchor="middle" fill={n.tagColor} fontSize="1.1" fontWeight="600" style={{ pointerEvents: "none", ...fontMono }}>{sdm ? "SDM" : "SM"}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8a8580" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid #888" }} /> SM faz
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8a8580" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px dashed #888" }} /> SDM faz
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 6 }}>
        {[
          { icon: "🎯", l: "Papel do SM", c: "#1A3A8F", t: "papel" },
          { icon: "⚠️", l: "Anti-Padrões", c: "#9E3D2B", t: "papel" },
          { icon: "🔺", l: "Tríade Ativa", c: "#2A6B50", t: "papel" },
          { icon: "📐", l: "Padrões & Métricas", c: "#7B5EA7", t: "padroes" },
          { icon: "🛡️", l: "Proteção", c: "#9E3D2B", t: "padroes" },
        ].map((p, i) => (
          <div key={i} onClick={() => setTab(p.t)} style={{
            background: "#fff", border: "1px solid #e8e4df", padding: "12px",
            cursor: "pointer", borderBottom: `3px solid ${p.c}15`, transition: "all .15s",
          }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderBottomColor = p.c)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderBottomColor = p.c + "15")}
          >
            <span style={{ fontSize: 18, display: "block", marginBottom: 4 }}>{p.icon}</span>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{p.l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#0f1729" }}>
        <div style={{ ...fontSerif, fontSize: 13, fontWeight: 300, lineHeight: 1.6, color: "rgba(255,255,255,.65)", fontStyle: "italic" }}>
          O report diário do SM alimenta tudo: sync, report pro G, apresentação à LM, munição pro Promotor. Um preenchimento por dia.
        </div>
      </div>
    </div>
  );
};

export default FrameworkTab;
