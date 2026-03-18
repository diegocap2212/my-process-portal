import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReports } from "@/hooks/useReports";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import DashboardExport from "@/components/dashboard/DashboardExport";
import KPICards from "@/components/dashboard/KPICards";
import BottleneckRadar from "@/components/dashboard/BottleneckRadar";
import CheckpointChart from "@/components/dashboard/CheckpointChart";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";
import SquadHealthTable from "@/components/dashboard/SquadHealthTable";
import ReportDetailsList from "@/components/dashboard/ReportDetailsList";
import { fontSerif, fontMono } from "@/styles/constants";

export default function Dashboard() {
  const navigate = useNavigate();
  const { reports, loading } = useReports();
  const [sm, setSm] = useState("");
  const [squad, setSquad] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const { filtered, totalReports, checkpointStats, squadHealth, weeklyTrends, smFrequency, bottlenecks, smSummaries } =
    useDashboardData(reports, { sm, squad, startDate, endDate });

  return (
    <div style={{ minHeight: "100vh", background: "hsl(210 40% 96.1%)" }}>
      {/* Header */}
      <div style={{
        background: "hsl(222.2 84% 4.9%)", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 18px",
          display: "flex", alignItems: "center", height: 44, gap: 10,
        }}>
          <div
            onClick={() => navigate("/")}
            style={{ ...fontSerif, fontSize: 17, color: "hsl(210 40% 98%)", cursor: "pointer" }}
          >
            Torre <span style={{ color: "hsl(43 52% 54%)", fontWeight: 600 }}>LM</span>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,.1)" }} />
          <div style={{ ...fontMono, fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.5)" }}>
            DASHBOARD
          </div>
          <div style={{ flex: 1 }} />
          <div
            onClick={() => navigate("/")}
            style={{ fontSize: 10, color: "rgba(255,255,255,.4)", cursor: "pointer", padding: "4px 8px" }}
          >
            ← Voltar ao WoW
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 18px 50px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ ...fontSerif, fontSize: 24, color: "hsl(222.2 84% 4.9%)" }}>
            Dashboard de Gestão
          </div>
          {!loading && (
            <DashboardExport
              dashboardRef={contentRef}
              filters={{ sm, squad, startDate, endDate }}
            />
          )}
        </div>
        <div style={{ fontSize: 12, color: "hsl(215.4 16.3% 46.9%)", marginBottom: 16 }}>
          Métricas compiladas dos reports diários dos Scrum Masters
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "hsl(215.4 16.3% 46.9%)" }}>
            Carregando dados do Firebase...
          </div>
        ) : (
          <div ref={contentRef}>
            <DashboardFilters
              sm={sm} setSm={setSm} squad={squad} setSquad={setSquad}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
            />
            <KPICards totalReports={totalReports} checkpointStats={checkpointStats} smFrequency={smFrequency} />
            <BottleneckRadar bottlenecks={bottlenecks} />
            <CheckpointChart data={weeklyTrends} />
            <ExecutiveSummary summaries={smSummaries} />
            <SquadHealthTable data={squadHealth} />
            <ReportDetailsList reports={filtered} />
          </div>
        )}
      </div>
    </div>
  );
}
