import React, { useState, useRef, useEffect, useCallback } from "react";
import { useReports } from "@/hooks/useReports";
import Navbar from "@/components/layout/Navbar";
import FrameworkTab from "@/components/tabs/FrameworkTab";
import HojeTab from "@/components/tabs/HojeTab";
import CadenciasTab from "@/components/tabs/CadenciasTab";
import PapelTab from "@/components/tabs/PapelTab";
import PadroesTab from "@/components/tabs/PadroesTab";

export default function WoW() {
  const [tab, setTab] = useState("framework");
  const [exp, setExp] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { reports, loading, submitReport, deleteReport } = useReports();
  const stableSetTab = useCallback((t: string) => setTab(t), []);
  const stableSetExp = useCallback((id: string | null) => setExp(id), []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar tab={tab} setTab={setTab} onTabChange={() => setExp(null)} />
      <div ref={contentRef} style={{ maxWidth: 1060, margin: "0 auto", padding: "16px 18px 50px" }}>
        {tab === "framework" && <FrameworkTab setTab={setTab} setExp={setExp} />}
        {tab === "hoje" && (
          <HojeTab
            reports={reports}
            loading={loading}
            onSubmit={submitReport}
            onDelete={deleteReport}
            setTab={setTab}
            setExp={setExp}
          />
        )}
        {tab === "cadencias" && <CadenciasTab exp={exp} setExp={setExp} />}
        {tab === "papel" && <PapelTab />}
        {tab === "padroes" && <PadroesTab />}
      </div>
    </div>
  );
}
