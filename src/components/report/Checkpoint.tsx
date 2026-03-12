import React from "react";
import { inputStyle, fontMono } from "@/styles/constants";

interface CheckpointProps {
  label: string;
  link?: string;
  val: boolean | null;
  setVal: (v: boolean) => void;
  tx: string;
  setTx: (v: string) => void;
  ph?: string;
}

const Checkpoint: React.FC<CheckpointProps> = ({ label, link, val, setVal, tx, setTx, ph }) => (
  <div style={{
    marginBottom: 8, padding: "10px 12px",
    background: val === false ? "#fdf0ee" : val === true ? "#ebf5f0" : "#f9f8f6",
    border: "1px solid " + (val === false ? "#9E3D2B30" : val === true ? "#2A6B5030" : "#e8e4df"),
    transition: "all .2s",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: val !== null ? 6 : 0 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 9, color: "#1A3A8F", textDecoration: "none", ...fontMono }}>
            Abrir →
          </a>
        )}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {[true, false].map((v) => (
          <div key={String(v)} onClick={() => setVal(v)} style={{
            padding: "4px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer",
            background: val === v ? (v ? "#2A6B50" : "#9E3D2B") : "transparent",
            color: val === v ? "#fff" : "#aaa",
            border: "1px solid " + (val === v ? (v ? "#2A6B50" : "#9E3D2B") : "#ddd"),
          }}>
            {v ? "Sim" : "Não"}
          </div>
        ))}
      </div>
    </div>
    {val !== null && (
      <textarea
        value={tx}
        onChange={(e) => setTx(e.target.value)}
        placeholder={ph || (val ? "Considerações..." : "Por quê não?")}
        rows={2}
        style={{
          ...inputStyle, fontSize: 11, marginTop: 4,
          resize: "vertical" as const,
          background: val ? "#f9fdf9" : "#fefafa",
        }}
      />
    )}
  </div>
);

export default Checkpoint;
