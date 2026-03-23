import React, { useState } from "react";
import { fontSerif, fontMono, labelStyle, inputStyle } from "@/styles/constants";
import { SM_NAMES, SM_SQUAD_DETAILS, smColors } from "@/data/squads";

import ConeStatus from "./ConeStatus";
import SquadDashboard from "./SquadDashboard";
import { getCurrentWeek } from "@/hooks/useWeeklyReport";
import { useConeData } from "@/hooks/useConeData";

const SmReportTab: React.FC = () => {
  const [selectedSm, setSelectedSm] = useState(SM_NAMES[0]);

  const { data: coneData, rawItems, loading: coneLoading, isLive } = useConeData();
  const smData = coneData[selectedSm] || {};
  const week = getCurrentWeek();

  return (
    <div>
      {/* SM Selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {SM_NAMES.map((sm) => (
          <div
            key={sm}
            onClick={() => setSelectedSm(sm)}
            style={{
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: selectedSm === sm ? 600 : 400,
              color: selectedSm === sm ? "#fff" : "rgba(26,29,35,.5)",
              background: selectedSm === sm ? smColors[sm] : "transparent",
              border: `1px solid ${selectedSm === sm ? smColors[sm] : "#e0dcd7"}`,
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              transition: "all .2s",
            }}
          >
            {sm}
          </div>
        ))}
      </div>

      {/* Week indicator */}
      <div style={{
        display: "flex", alignItems: "center", marginBottom: 16,
      }}>
        <div style={{
          ...fontMono, fontSize: 9, color: "rgba(26,29,35,.4)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: isLive ? "#2A6B50" : "#c9a84c" }} />
          SEMANA {week} {isLive ? "· DADOS REAIS" : "· MOCK"}
        </div>
      </div>

      {/* Métricas do Cone por Squad */}
      <div style={{ ...labelStyle, color: "#7B5EA7", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 12, height: 1, background: "#7B5EA7" }} />Métricas do Cone · Automático
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        {Object.entries(smData).map(([squad, data]) => (
          <div key={squad} style={{ background: "#fff", border: "1px solid #e0dcd7" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderBottom: "1px solid #e0dcd7", background: "#faf9f7",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23", fontFamily: "'DM Sans',sans-serif" }}>{squad}</span>
                {SM_SQUAD_DETAILS[selectedSm]?.find(s => s.name === squad)?.description && (
                  <span style={{ ...fontMono, fontSize: 8, color: "rgba(26,29,35,.35)" }}>
                    {SM_SQUAD_DETAILS[selectedSm].find(s => s.name === squad)!.description}
                  </span>
                )}
              </div>
              <ConeStatus status={data.cone} />
            </div>
            <div style={{ padding: "12px" }}>
              <SquadDashboard rawItems={rawItems} squadName={squad} sm={selectedSm} accent={smColors[selectedSm]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmReportTab;
