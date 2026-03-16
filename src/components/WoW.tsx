import React, { useState, useRef, useEffect, useCallback } from "react";
import { useReports } from "@/hooks/useReports";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import Navbar from "@/components/layout/Navbar";
import FrameworkTab from "@/components/tabs/FrameworkTab";
import HojeTab from "@/components/tabs/HojeTab";
import CadenciasTab from "@/components/tabs/CadenciasTab";
import PapelTab from "@/components/tabs/PapelTab";
import PadroesTab from "@/components/tabs/PadroesTab";
import type { User } from "firebase/auth";

interface WoWProps {
  user: User;
  onSignOut: () => void;
}

export default function WoW({ user, onSignOut }: WoWProps) {
  const [tab, setTab] = useState("framework");
  const [exp, setExp] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { reports, loading, submitReport, deleteReport } = useReports();
  const { canViewHistory } = useUserPermissions(user);
  const stableSetTab = useCallback((t: string) => setTab(t), []);
  const stableSetExp = useCallback((id: string | null) => setExp(id), []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar tab={tab} setTab={stableSetTab} onTabChange={() => setExp(null)} onSignOut={onSignOut} userEmail={user.email} />
      <div ref={contentRef} style={{ maxWidth: 1060, margin: "0 auto", padding: "16px 18px 50px" }}>
        {tab === "framework" && <FrameworkTab setTab={stableSetTab} setExp={stableSetExp} />}
        {tab === "hoje" && (
          <HojeTab
            reports={reports}
            loading={loading}
            onSubmit={submitReport}
            onDelete={deleteReport}
            setTab={stableSetTab}
            setExp={stableSetExp}
            canViewHistory={canViewHistory}
          />
        )}
        {tab === "cadencias" && <CadenciasTab exp={exp} setExp={stableSetExp} />}
        {tab === "papel" && <PapelTab />}
        {tab === "padroes" && <PadroesTab />}
      </div>
    </div>
  );
}
