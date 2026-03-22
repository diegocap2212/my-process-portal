import React from "react";
import { fontMono } from "@/styles/constants";
import type { ConeStatusType } from "@/data/cone-mock";

interface ConeStatusProps {
  status: ConeStatusType;
  size?: "sm" | "md";
}

const CONE_CONFIG: Record<ConeStatusType, { color: string; bg: string; border: string; label: string }> = {
  green: { color: "#1a7a4c", bg: "rgba(42,107,80,.08)", border: "rgba(42,107,80,.2)", label: "OK" },
  yellow: { color: "#9a7b2e", bg: "rgba(201,168,76,.08)", border: "rgba(201,168,76,.25)", label: "ATENÇÃO" },
  red: { color: "#9E3D2B", bg: "rgba(158,61,43,.08)", border: "rgba(158,61,43,.2)", label: "CRÍTICO" },
};

const ConeStatus: React.FC<ConeStatusProps> = ({ status, size = "sm" }) => {
  const cfg = CONE_CONFIG[status];
  return (
    <div style={{
      ...fontMono,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: size === "sm" ? 8 : 9,
      fontWeight: 600,
      padding: size === "sm" ? "2px 7px" : "3px 9px",
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      letterSpacing: ".05em",
    }}>
      <span style={{ fontSize: size === "sm" ? 6 : 8 }}>●</span>
      {cfg.label}
    </div>
  );
};

export default ConeStatus;
