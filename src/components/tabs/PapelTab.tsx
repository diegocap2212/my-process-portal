import React from "react";
import { labelStyle } from "@/styles/constants";
import { PAPEL_FAZ, PAPEL_NAOFAZ, ANTIPADROES, TRIADE } from "@/data/papeis";
import ItemList from "@/components/shared/ItemList";

const PapelTab: React.FC = () => (
  <div style={{ animation: "fadeIn .3s ease" }}>
    <div style={{ background: "#0f1729", padding: "14px 16px", marginBottom: 12, borderLeft: "4px solid #1a6b5a" }}>
      <div style={{ ...labelStyle, color: "rgba(255,255,255,.3)", marginBottom: 2 }}>Modelo de Gestão · CTO</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>
        A LM não gerencia mais os SMs diretamente. A Venice é responsável. O SDM garante resultados.
        Cobrança: diagnósticos proativos, ações corretivas e métricas padronizadas.
      </div>
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}>
        <span>✅</span><b style={{ fontSize: 13 }}>O que o SM FAZ</b>
      </div>
      <ItemList items={PAPEL_FAZ} color="#1a6b5a" numbered />
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}>
        <span>🚫</span><b style={{ fontSize: 13 }}>O que o SM NÃO FAZ</b>
      </div>
      <ItemList items={PAPEL_NAOFAZ} color="#9E3D2B" numbered />
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", background: "#9E3D2B06", display: "flex", alignItems: "center", gap: 6 }}>
        <span>⚠️</span><b style={{ fontSize: 13 }}>Anti-Padrões</b>
      </div>
      <ItemList items={ANTIPADROES} color="#9E3D2B" numbered={false} />
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8e4df" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}>
        <span>🔺</span><b style={{ fontSize: 13 }}>Tríade — TL + PO + SM</b>
      </div>
      <ItemList items={TRIADE} color="#2A6B50" numbered />
    </div>
  </div>
);

export default PapelTab;
