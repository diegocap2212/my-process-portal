import React from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  accent?: string;
  icon?: string;
  small?: boolean;
}

const ICON_COLORS: Record<string, { bg: string; fg: string }> = {
  "escopo": { bg: "#ede9fe", fg: "#7c3aed" },
  "entregas": { bg: "#d1fae5", fg: "#059669" },
  "wip": { bg: "#fef3c7", fg: "#d97706" },
  "lead": { bg: "#e0e7ff", fg: "#4f46e5" },
};

const getIconStyle = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes("escopo")) return ICON_COLORS.escopo;
  if (key.includes("entrega")) return ICON_COLORS.entregas;
  if (key.includes("wip") || key.includes("fazer")) return ICON_COLORS.wip;
  return ICON_COLORS.lead;
};

const ICONS: Record<string, string> = {
  "escopo": "👥",
  "entregas": "✅",
  "wip": "📊",
  "lead": "⏱",
};

const getIcon = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes("escopo")) return ICONS.escopo;
  if (key.includes("entrega")) return ICONS.entregas;
  if (key.includes("wip") || key.includes("fazer")) return ICONS.wip;
  return ICONS.lead;
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, accent, icon, small }) => {
  const iconStyle = getIconStyle(label);
  const iconEmoji = icon || getIcon(label);

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: small ? "14px 16px" : "20px 24px",
      flex: 1,
      minWidth: small ? 100 : 140,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          fontSize: small ? 11 : 12,
          fontWeight: 600,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: ".04em",
          fontFamily: "'DM Sans',sans-serif",
        }}>
          {label}
        </div>
        <div style={{
          width: small ? 28 : 36,
          height: small ? 28 : 36,
          borderRadius: 10,
          background: iconStyle.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: small ? 14 : 18,
        }}>
          {iconEmoji}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{
          fontSize: small ? 28 : 36,
          fontWeight: 700,
          color: "#111827",
          fontFamily: "'DM Sans',sans-serif",
          lineHeight: 1,
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'DM Sans',sans-serif", marginLeft: 2 }}>
            {unit}
          </span>
        )}
      </div>
      <div style={{
        fontSize: 11,
        color: "#9ca3af",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        {label.toLowerCase().includes("escopo") && "Items na release atuante"}
        {label.toLowerCase().includes("entrega") && "Produtividade liquidada"}
        {(label.toLowerCase().includes("wip") || label.toLowerCase().includes("fazer")) && "Sendo desenvolvidos"}
        {label.toLowerCase().includes("lead") && "Tempo médio de ciclo"}
      </div>
    </div>
  );
};

export default MetricCard;
