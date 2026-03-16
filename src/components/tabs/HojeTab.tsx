import React, { useState, useRef } from "react";
import { labelStyle, fontMono, inputStyle, selectStyle, compress, DAY_NAMES } from "@/styles/constants";
import { fontSerif } from "@/styles/constants";
import { CAD_SM, CAD_SDM } from "@/data/cadencias";
import { LINKS } from "@/data/links";
import { SM_SQUADS, SM_NAMES, smColors } from "@/data/squads";
import CadenciaCard from "@/components/shared/CadenciaCard";
import Checkpoint from "@/components/report/Checkpoint";
import type { Report } from "@/types/report";

interface HojeTabProps {
  reports: Report[];
  loading: boolean;
  onSubmit: (input: any) => Promise<boolean>;
  onDelete: (id: string) => void;
  setTab: (t: string) => void;
  setExp: (id: string | null) => void;
}

const HojeTab: React.FC<HojeTabProps> = ({ reports, loading, onSubmit, onDelete, setTab, setExp }) => {
  const dow = new Date().getDay();

  // Form state
  const [rSm, setRSm] = useState("");
  const [rSq, setRSq] = useState("");
  const [rDt, setRDt] = useState(new Date().toISOString().slice(0, 10));
  const [rCone, setRCone] = useState<boolean | null>(null);
  const [rConeTx, setRConeTx] = useState("");
  const [rPdti, setRPdti] = useState<boolean | null>(null);
  const [rPdtiTx, setRPdtiTx] = useState("");
  const [rParado, setRParado] = useState<boolean | null>(null);
  const [rParadoTx, setRParadoTx] = useState("");
  const [rWipE, setRWipE] = useState<boolean | null>(null);
  const [rWipETx, setRWipETx] = useState("");
  const [rWipU, setRWipU] = useState<boolean | null>(null);
  const [rWipUTx, setRWipUTx] = useState("");
  const [rOque, setROque] = useState("");
  const [rProb, setRProb] = useState("");
  const [rAcoes, setRAcoes] = useState("");
  const [rImgs, setRImgs] = useState<{ data: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const fRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setROque(""); setRProb(""); setRAcoes("");
    setRCone(null); setRConeTx(""); setRPdti(null); setRPdtiTx("");
    setRParado(null); setRParadoTx(""); setRWipE(null); setRWipETx("");
    setRWipU(null); setRWipUTx(""); setRImgs([]);
  };

  const submit = async () => {
    if (!rSm || !rSq) return;
    setSaving(true);
    const ok = await onSubmit({
      sm: rSm, squad: rSq, date: rDt,
      cone: rCone, coneText: rConeTx,
      pdti: rPdti, pdtiText: rPdtiTx,
      parado: rParado, paradoText: rParadoTx,
      wipEpic: rWipE, wipEpicText: rWipETx,
      wipUs: rWipU, wipUsText: rWipUTx,
      oQue: rOque, problemas: rProb, acoes: rAcoes,
      images: rImgs,
    });
    if (ok) reset();
    setSaving(false);
  };

  const onImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 2 - rImgs.length);
    for (const f of files) {
      const data = await compress(f);
      setRImgs((p) => [...p.slice(0, 1), { data }]);
    }
    if (fRef.current) fRef.current.value = "";
  };


  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ background: "#0f1729", padding: "20px 18px", marginBottom: 16 }}>
        <div style={{ ...labelStyle, color: "rgba(255,255,255,.3)", marginBottom: 4 }}>Hoje</div>
        <div style={{ ...fontSerif, fontSize: 22, color: "#fff" }}>{DAY_NAMES[dow]}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>
          {reports.length} reports no banco · Report diário + cadências
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* LEFT */}
        <div style={{ flex: "1 1 320px", minWidth: 260 }}>
          <CadenciaCard cadencia={CAD_SM[0]} isOpen alwaysOpen />
          {dow === 1 && <CadenciaCard cadencia={CAD_SM[1]} isOpen alwaysOpen />}
          <div style={{ ...labelStyle, color: "#8a8580", marginTop: 14, marginBottom: 6 }}>Outras cadências</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {[...CAD_SM, ...CAD_SDM]
              .filter((c) => c.id !== "diario" && !(dow === 1 && c.id === "sync"))
              .map((c) => (
                <div key={c.id}
                  onClick={() => { setTab("cadencias"); setTimeout(() => setExp(c.id), 100); }}
                  style={{
                    padding: "5px 9px", cursor: "pointer", border: "1px solid #e8e4df",
                    background: "#fff", fontSize: 10, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                  <span style={{ fontSize: 11 }}>{c.emoji}</span>{c.label}
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT — REPORT */}
        <div style={{ flex: "1 1 360px", minWidth: 280, maxWidth: 420 }}>
          <div style={{ background: "#fff", border: "1px solid #e0dcd7", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ borderBottom: "1px solid #e0dcd7" }}>
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>📋</span>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Report Diário</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 8, color: "#2A6B50", ...fontMono, fontWeight: 600 }}>● FIREBASE</div>
              </div>
            </div>

            <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...labelStyle, color: "#8a8580", marginBottom: 2, fontSize: 8 }}>SM</div>
                    <select value={rSm} onChange={(e) => { setRSm(e.target.value); setRSq(""); }} style={selectStyle}>
                      <option value="">—</option>
                      {SM_NAMES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...labelStyle, color: "#8a8580", marginBottom: 2, fontSize: 8 }}>Squad</div>
                    <select value={rSq} onChange={(e) => setRSq(e.target.value)} style={selectStyle} disabled={!rSm}>
                      <option value="">—</option>
                      {rSm && SM_SQUADS[rSm].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ width: 100 }}>
                    <div style={{ ...labelStyle, color: "#8a8580", marginBottom: 2, fontSize: 8 }}>Data</div>
                    <input type="date" value={rDt} onChange={(e) => setRDt(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ ...labelStyle, color: "#7B5EA7", marginBottom: 5, marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 1, background: "#7B5EA7" }} />Checkpoints
                </div>
                <Checkpoint label="Cone atualizado e analisado?" link={LINKS.cone} val={rCone} setVal={setRCone} tx={rConeTx} setTx={setRConeTx} ph="Análise do cone..." />
                <Checkpoint label="PDTI atualizado e consistente?" link={LINKS.pdti} val={rPdti} setVal={setRPdti} tx={rPdtiTx} setTx={setRPdtiTx} ph="Observações PDTI..." />
                <Checkpoint label="Item parado >2 dias?" val={rParado} setVal={setRParado} tx={rParadoTx} setTx={setRParadoTx} ph="Quais? O que está fazendo?" />
                <Checkpoint label="WIP Épicos sob controle?" val={rWipE} setVal={setRWipE} tx={rWipETx} setTx={setRWipETx} ph="Quais épicos? Progresso?" />
                <Checkpoint label="WIP USs/Tasks — começando e terminando?" val={rWipU} setVal={setRWipU} tx={rWipUTx} setTx={setRWipUTx} ph="Fluxo ok?" />

                <div style={{ padding: "8px 10px", background: "#f9f8f6", border: "1px solid #e8e4df", marginBottom: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#6B3A8A", ...fontMono, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Painéis Lançamento</div>
                  {[{ l: "O4R1", u: LINKS.dashO4R1 }, { l: "O4R2", u: LINKS.dashO4R2 }, { l: "O4R1×O4R2", u: LINKS.dashO4R1xR2 }].map((d, i) => (
                    <a key={i} href={d.u} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#1A3A8F", textDecoration: "none", display: "block", padding: "1px 0" }}>📊 {d.l} →</a>
                  ))}
                </div>

                <div style={{ ...labelStyle, color: "#2A6B50", marginBottom: 5, marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 1, background: "#2A6B50" }} />Contexto
                </div>
                <textarea value={rOque} onChange={(e) => setROque(e.target.value)} placeholder="O que aconteceu hoje?" rows={2} style={{ ...inputStyle, marginBottom: 5, resize: "vertical" as const }} />
                <textarea value={rProb} onChange={(e) => setRProb(e.target.value)} placeholder="Problemas / impedimentos..." rows={2} style={{ ...inputStyle, marginBottom: 5, resize: "vertical" as const }} />
                <textarea value={rAcoes} onChange={(e) => setRAcoes(e.target.value)} placeholder="Soluções / próximos passos..." rows={2} style={{ ...inputStyle, marginBottom: 5, resize: "vertical" as const }} />

                <div style={{ ...labelStyle, color: "#9A7B10", marginBottom: 5, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 1, background: "#9A7B10" }} />Evidência (max 2)
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {rImgs.map((img, i) => (
                    <div key={i} style={{ position: "relative", width: 65, height: 45, border: "1px solid #e0dcd7", overflow: "hidden" }}>
                      <img src={img.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div onClick={() => setRImgs((p) => p.filter((_, j) => j !== i))} style={{
                        position: "absolute", top: 1, right: 1, width: 14, height: 14,
                        borderRadius: "50%", background: "rgba(0,0,0,.6)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, cursor: "pointer",
                      }}>×</div>
                    </div>
                  ))}
                  {rImgs.length < 2 && (
                    <div onClick={() => fRef.current?.click()} style={{
                      width: 65, height: 45, border: "1px dashed #ccc",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 16, color: "#ccc",
                    }}>+</div>
                  )}
                  <input ref={fRef} type="file" accept="image/*" multiple onChange={onImg} style={{ display: "none" }} />
                </div>

                <button onClick={submit} disabled={!rSm || !rSq || saving} style={{
                  width: "100%", padding: "10px",
                  background: !rSm || !rSq ? "#ddd" : "#0f1729",
                  color: !rSm || !rSq ? "#aaa" : "#fff",
                  border: "none", fontSize: 12, fontWeight: 600,
                  cursor: !rSm || !rSq ? "not-allowed" : "pointer",
                }}>
                  {saving ? "Salvando..." : "Registrar report"}
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HojeTab);
