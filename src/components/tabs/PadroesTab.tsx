import React from "react";
import { labelStyle } from "@/styles/constants";
import { DOR, DOD, METRICAS_OBR } from "@/data/padroes";
import ItemList from "@/components/shared/ItemList";

const PadroesTab: React.FC = () => (
  <div style={{ animation: "fadeIn .3s ease" }}>
    <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}>
        <span>✅</span><b style={{ fontSize: 13 }}>DoR — Definition of Ready</b>
      </div>
      <ItemList items={DOR} color="#2A6B50" numbered />
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}>
        <span>🏁</span><b style={{ fontSize: 13 }}>DoD — Definition of Done</b>
      </div>
      {DOD.map((ph, i) => (
        <div key={i} style={{ padding: "8px 16px", borderBottom: "1px solid #f0ece7" }}>
          <div style={{ ...labelStyle, color: "#1A3A8F", marginBottom: 4 }}>{ph.phase}</div>
          {ph.items.map((it, j) => (
            <div key={j} style={{ fontSize: 12, color: "#4a4540", marginBottom: 2, paddingLeft: 10, borderLeft: "2px solid #1A3A8F20" }}>{it}</div>
          ))}
        </div>
      ))}
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}>
        <span>📐</span><b style={{ fontSize: 13 }}>4 Métricas Obrigatórias</b>
      </div>
      <ItemList items={METRICAS_OBR} color="#7B5EA7" numbered />
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8e4df" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", background: "#9E3D2B06", display: "flex", alignItems: "center", gap: 6 }}>
        <span>🛡️</span><b style={{ fontSize: 13 }}>Proteção Baseada em Fatos</b>
      </div>
      {[
        { n: "1", l: "Consultar reports" },
        { n: "2", l: "Listar entregas + métricas" },
        { n: "3", l: "Traduzir pra negócio" },
        { n: "4", l: "Montar fatos + números" },
        { n: "5", l: "Validar com G" },
      ].map((s, i) => (
        <div key={i} style={{ padding: "8px 16px", borderBottom: "1px solid #f0ece7", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", background: "#fdf0ee",
            color: "#9E3D2B", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700,
          }}>{s.n}</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{s.l}</div>
        </div>
      ))}
      <div style={{ padding: "12px 16px", background: "#0f1729" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontStyle: "italic", lineHeight: 1.6 }}>
          A Venice é dona dos seus SMs. Quando a LM questionar, o SDM responde com dados. Nunca opinião — sempre fatos.
        </div>
      </div>
    </div>
  </div>
);

export default React.memo(PadroesTab);
