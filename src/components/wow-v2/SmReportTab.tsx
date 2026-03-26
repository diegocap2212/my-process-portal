import React, { useState } from "react";
import { fontMono } from "@/styles/constants";
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
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {SM_NAMES.map((sm) => (
          <div
            key={sm}
            onClick={() => setSelectedSm(sm)}
            style={{
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: selectedSm === sm ? 600 : 400,
              color: selectedSm === sm ? "#fff" : "#6b7280",
              background: selectedSm === sm ? "#6366f1" : "#fff",
              border: `1px solid ${selectedSm === sm ? "#6366f1" : "#e5e7eb"}`,
              borderRadius: 8,
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
        display: "flex", alignItems: "center", marginBottom: 20,
        padding: "8px 14px", background: "#f9fafb", borderRadius: 8,
        border: "1px solid #e5e7eb",
      }}>
        <div style={{
          fontSize: 12, color: "#6b7280",
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "'DM Sans',sans-serif",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isLive ? "#059669" : "#d97706",
          }} />
          Semana {week} {isLive ? "· Dados reais" : "· Mock"}
        </div>
      </div>

      {/* Squads */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {Object.entries(smData).map(([squad, data]) => (
          <div key={squad} style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,.04)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans',sans-serif" }}>{squad}</span>
                {SM_SQUAD_DETAILS[selectedSm]?.find(s => s.name === squad)?.description && (
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    {SM_SQUAD_DETAILS[selectedSm].find(s => s.name === squad)!.description}
                  </span>
                )}
              </div>
              <ConeStatus status={data.cone} />
            </div>
            <div style={{ padding: "20px" }}>
              <SquadDashboard rawItems={rawItems} squadName={squad} sm={selectedSm} accent={smColors[selectedSm]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmReportTab;
