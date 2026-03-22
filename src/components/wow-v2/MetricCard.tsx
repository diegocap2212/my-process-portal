import React from "react";
import { fontMono } from "@/styles/constants";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  accent?: string;
  small?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, accent = "#0f1729", small }) => (
  <div style={{
    background: "#fff",
    border: "1px solid #e0dcd7",
    padding: small ? "10px 12px" : "14px 16px",
    flex: 1,
    minWidth: small ? 90 : 120,
  }}>
    <div style={{
      ...fontMono,
      fontSize: 8,
      fontWeight: 600,
      letterSpacing: ".1em",
      textTransform: "uppercase",
      color: "rgba(26,29,35,.45)",
      marginBottom: 6,
    }}>
      {label}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{
        fontSize: small ? 22 : 28,
        fontWeight: 700,
        color: accent,
        fontFamily: "'DM Sans',sans-serif",
        lineHeight: 1,
      }}>
        {value}
      </span>
      {unit && (
        <span style={{ ...fontMono, fontSize: 9, color: "rgba(26,29,35,.4)" }}>
          {unit}
        </span>
      )}
    </div>
  </div>
);

export default MetricCard;
