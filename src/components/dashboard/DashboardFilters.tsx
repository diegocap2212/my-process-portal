import React from "react";
import { SM_NAMES, SM_SQUADS } from "@/data/squads";
import { fontMono } from "@/styles/constants";

interface Props {
  sm: string;
  setSm: (v: string) => void;
  squad: string;
  setSquad: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
}

const sel: React.CSSProperties = {
  padding: "6px 10px", fontSize: 11, border: "1px solid hsl(214 31.8% 91.4%)",
  background: "hsl(0 0% 100%)", color: "hsl(222.2 84% 4.9%)", outline: "none",
  fontFamily: "'DM Sans',sans-serif", borderRadius: 4,
};

const DashboardFilters: React.FC<Props> = ({
  sm, setSm, squad, setSquad, startDate, setStartDate, endDate, setEndDate,
}) => {
  const squads = sm ? SM_SQUADS[sm] || [] : Object.values(SM_SQUADS).flat();

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
      padding: "10px 14px", background: "hsl(210 40% 96.1%)", borderRadius: 6, marginBottom: 16,
    }}>
      <span style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)" }}>
        FILTROS
      </span>
      <select value={sm} onChange={(e) => { setSm(e.target.value); setSquad(""); }} style={sel}>
        <option value="">Todos SMs</option>
        {SM_NAMES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select value={squad} onChange={(e) => setSquad(e.target.value)} style={sel}>
        <option value="">Todos Squads</option>
        {squads.map((s) => <option key={s}>{s}</option>)}
      </select>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ ...sel, width: 130 }} />
      <span style={{ fontSize: 11, color: "hsl(215.4 16.3% 46.9%)" }}>até</span>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ ...sel, width: 130 }} />
    </div>
  );
};

export default DashboardFilters;
