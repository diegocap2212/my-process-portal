import React from "react";
import { fontMono } from "@/styles/constants";
import type { Cadencia } from "@/types/report";

interface CadenciaCardProps {
  cadencia: Cadencia;
  isOpen: boolean;
  onToggle?: () => void;
  alwaysOpen?: boolean;
}

const CadenciaCard: React.FC<CadenciaCardProps> = ({ cadencia: c, isOpen, onToggle, alwaysOpen }) => (
  <div style={{ marginBottom: 6 }}>
    <div
      onClick={() => !alwaysOpen && onToggle?.()}
      style={{
        background: isOpen ? "#fff" : "rgba(255,255,255,.6)",
        border: "1px solid " + (isOpen ? c.tagColor + "40" : "#e8e4df"),
        cursor: alwaysOpen ? "default" : "pointer",
      }}
    >
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>{c.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{c.label}</div>
          <div style={{ fontSize: 10, color: "#8a8580", marginTop: 2, ...fontMono }}>{c.freq}</div>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.tagColor, opacity: 0.6 }} />
        {!alwaysOpen && (
          <span style={{
            fontSize: 14, color: "#ccc",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}>
            ⌄
          </span>
        )}
      </div>
      {isOpen && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid #f0ece7" }}>
          <p style={{ fontSize: 12, color: "#4a4540", lineHeight: 1.6, margin: "10px 0" }}>{c.summary}</p>
          {c.items.map((it, i) => (
            <div key={i} style={{
              fontSize: 12, color: "#3d3a35", lineHeight: 1.6, marginBottom: 3,
              paddingLeft: 12, borderLeft: `2px solid ${c.tagColor}25`,
            }}>
              {it}
            </div>
          ))}
          {c.rules && (
            <div style={{ marginTop: 10 }}>
              {c.rules.map((r, i) => (
                <div key={i} style={{
                  fontSize: 11, color: "#6b6560", lineHeight: 1.5, marginBottom: 3,
                  paddingLeft: 12, position: "relative" as const,
                }}>
                  <span style={{ position: "absolute" as const, left: 0, fontWeight: 700, color: c.tagColor }}>→</span>
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default CadenciaCard;
