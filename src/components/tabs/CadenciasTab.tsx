import React from "react";
import { labelStyle } from "@/styles/constants";
import { CAD_SM, CAD_SDM } from "@/data/cadencias";
import CadenciaCard from "@/components/shared/CadenciaCard";

interface CadenciasTabProps {
  exp: string | null;
  setExp: (id: string | null) => void;
}

const CadenciasTab: React.FC<CadenciasTabProps> = ({ exp, setExp }) => (
  <div style={{ animation: "fadeIn .3s ease" }}>
    <div style={{ ...labelStyle, color: "#1A3A8F", marginBottom: 6 }}>O que o SM faz</div>
    {CAD_SM.map((c) => (
      <CadenciaCard key={c.id} cadencia={c} isOpen={exp === c.id} onToggle={() => setExp(exp === c.id ? null : c.id)} />
    ))}
    <div style={{ ...labelStyle, color: "#6B3A8A", marginTop: 18, marginBottom: 6 }}>O que o SDM faz com os dados</div>
    <div style={{ fontSize: 11, color: "#8a8580", marginBottom: 8 }}>Reports diários alimentam tudo abaixo. SM não faz nada extra.</div>
    {CAD_SDM.map((c) => (
      <CadenciaCard key={c.id} cadencia={c} isOpen={exp === c.id} onToggle={() => setExp(exp === c.id ? null : c.id)} />
    ))}
  </div>
);

export default CadenciasTab;
