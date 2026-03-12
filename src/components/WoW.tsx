import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, deleteDoc, doc, query,
  orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";

/* ════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════ */
const CAD_SM = [
  {
    id: "diario", emoji: "📈", label: "Rotina Diária + Report", freq: "Todo dia · ~10 min", tagColor: "#7B5EA7",
    summary: "O SM é o guardião do board. Antes da daily, garante que o Jira reflete a realidade. Depois, preenche o report diário — isso alimenta TODO o ciclo do SDM. Um único preenchimento, todos os relatórios.",
    items: ["Verificar cards com status atualizado", "Identificar itens parados >2 dias → agir no mesmo dia", "Garantir que o board reflete a realidade", "Preencher o report diário (checkpoints + contexto + evidência)"],
    rules: ["SM faz isso ANTES da daily do time", "O report diário É o artefato — não existe outro doc", "Se leva mais de 10 min, o board tem problemas estruturais"],
  },
  {
    id: "sync", emoji: "🔄", label: "Sync Semanal", freq: "Segunda · 30 min", tagColor: "#1A3A8F",
    summary: "4 SMs + SDM. Cada SM apresenta em 5 min usando os reports diários da semana. SDM cruza padrões nos 10 min finais.",
    items: ["5 min por SM: tração, travamentos, métricas, evidências", "SM usa os próprios reports como base — sem preparação extra", "10 min finais: SDM cruza padrões e decide ações"],
    rules: ["SDM não fala nos primeiros 20 min", "Se SM preencheu o diário durante a semana, está preparado"],
  },
  {
    id: "checkin", emoji: "💬", label: "Check-in Individual", freq: "Quinzenal · 30 min", tagColor: "#2A6B50",
    summary: "1:1 com o SDM. Suporte, não fiscalização. SDM já tem os reports e foca em profundidade.",
    items: ["SDM conduz com base nos reports — SM não prepara nada extra", "Foco: métricas com tendência, papel (faz/não faz), tríade ativa", "Espaço para o SM pedir ajuda ou escalar"],
    rules: ["Tom de suporte — não avaliação", "Se SM absorve papel de PO ou PM, apontar com clareza"],
  },
];

const CAD_SDM = [
  { id: "report-g", emoji: "📊", label: "Report para G (Lucas)", freq: "Quinzenal", tagColor: "#2A6B50", summary: "SDM compila reports diários em narrativa comercial. SM não faz nada aqui.", items: ["Compilar reports → extrair entregas + métricas", "Traduzir pra linguagem de negócio", "1 página máximo"] },
  { id: "apresentacao-lm", emoji: "🏢", label: "Apresentação à LM", freq: "Quinzenal (alterna c/ W Brain)", tagColor: "#6B3A8A", summary: "SDM apresenta resultados padronizados à LM.", items: ["Métricas por squad + diagnósticos proativos + ROI", "Artefatos padronizados", "NUNCA expor SM individualmente"] },
  { id: "municao", emoji: "🎯", label: "Munição para o Promotor", freq: "Mensal · 1 página", tagColor: "#9E3D2B", summary: "Destilação do mês. Gerente Promotor usa direto com a CTO.", items: ["Headline + painel + 3 entregas + 1 risco + ROI", "Se o Promotor não entender em 2 min, está longo demais"] },
];

const PAPEL_FAZ = [
  { t: "Facilita ritos e cria ambiente seguro", d: "Habilitador do time. Não é secretário, não é cobrador." },
  { t: "Entrega diagnósticos proativos", d: "PRINCIPAL COBRANÇA: medir, analisar, identificar e agir ANTES de alguém cobrar." },
  { t: "Coleta e analisa métricas", d: "Lead time, throughput, previsibilidade. Jira + artefatos padronizados." },
  { t: "Atua com o cone da incerteza", d: "Dados pro PO tomar decisões de release. Ferramenta de DECISÃO." },
  { t: "Remove impedimentos", d: "Identifica bloqueios e age. Se é de outro nível, escala." },
  { t: "Agente de mudança", d: "Propõe experimentos, questiona processos. Mais solução, menos problema." },
  { t: "Usa artefatos existentes", d: "PDTI, Jira, DoR, DoD. Não inventa processos paralelos." },
];

const PAPEL_NAOFAZ = [
  { t: "NÃO determina o que entregar", d: "Backlog e priorização são do PO." },
  { t: "NÃO gerencia pessoas", d: "Não faz avaliação individual." },
  { t: "NÃO centraliza decisões técnicas", d: "Respeita expertise do time e TL." },
  { t: "NÃO cobra entregas", d: "SM cuida do fluxo, não do output." },
  { t: "NÃO agenda Review e Homol", d: "Isso é do PO. SM facilita, não puxa." },
  { t: "NÃO cobre gaps de PM ou TL", d: "Foca no seu papel primeiro." },
];

const ANTIPADROES = [
  { t: "Review chamando Gestor de TI", d: "Review é para NEGÓCIO." },
  { t: "Cone como mural de status", d: "Cone é pra tratar demandas em risco." },
  { t: "WIP alto — começa e não termina", d: "1 de cada vez quando possível." },
  { t: "Visibilidade com desespero", d: "Escalar COM hipótese de solução." },
  { t: "Cobrir gaps de outros papéis", d: "Foco no arroz e feijão." },
  { t: "PDTI centralizado em outra pessoa", d: "SM é o responsável." },
];

const TRIADE = [
  { t: "TL + PO + SM = núcleo de decisão", d: "Se falar diariamente, decidir juntos." },
  { t: "SM facilita, PO prioriza, TL decide técnico", d: "Cada um na sua faixa." },
  { t: "Review e Homol são do PO", d: "SM apoia, não substitui." },
  { t: "SM alimenta com dados", d: "Métricas, cone, vazão → decisões melhores." },
];

const DOR = [
  { t: "Problema e Valor Claros", d: "Todos entendem o porquê." },
  { t: "Critérios de Aceite Testáveis", d: "Condições escritas." },
  { t: "Escopo cabe na Sprint", d: "Se grande, fatiado." },
  { t: "Dependências Mapeadas", d: "Identificadas com plano." },
  { t: "Esforço Estimado", d: "Time confirmou." },
];

const DOD = [
  { phase: "Construção Técnica", items: ["Código revisado", "Testes passando", "Branch principal"] },
  { phase: "Validação Funcional", items: ["Critérios atendidos", "Aprovado QA"] },
  { phase: "Aceite", items: ["Doc atualizada", "PO aceitou"] },
];

const METRICAS_OBR = [
  { name: "Vazão (Throughput)", desc: "Itens por sprint · Capacidade real" },
  { name: "Cycle Time", desc: "Início → Done · Previsibilidade" },
  { name: "Lead Time P85%", desc: "Criação → entrega · Compromissos" },
  { name: "Cone da Incerteza", desc: "Refinamento de escopo · DECISÃO" },
];

const SM_SQUADS: Record<string, string[]> = {
  Edmilson: ["Contratos", "Plataforma", "Scania", "Jetta"],
  Elizabeth: ["Salesforce", "Pricing", "Locavia"],
  Gabriela: ["Esteira de Crédito", "Canal Indireto", "Portal Vendas Assistidas"],
  Rafael: ["Optimus", "Nivus", "Scania", "Gol"],
};

const SM_NAMES = Object.keys(SM_SQUADS);
const smC: Record<string, string> = { Edmilson: "#1A3A8F", Elizabeth: "#B8872A", Gabriela: "#2A6B50", Rafael: "#9E3D2B" };

const LINKS = {
  cone: "https://docs.google.com/spreadsheets/d/CONE_ID_AQUI",
  pdti: "https://docs.google.com/spreadsheets/d/PDTI_ID_AQUI",
  dashO4R1: "https://grupolm.atlassian.net/jira/dashboards/12546",
  dashO4R2: "https://grupolm.atlassian.net/jira/dashboards/12513",
  dashO4R1xR2: "https://grupolm.atlassian.net/jira/dashboards/12547",
};

/* ════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════ */
const dn = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const dow = new Date().getDay();

const L: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'IBM Plex Mono',monospace", marginBottom: 10 };
const S: React.CSSProperties = { fontFamily: "'Newsreader',Georgia,serif" };
const M: React.CSSProperties = { fontFamily: "'IBM Plex Mono',monospace" };
const I: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid #e0dcd7", fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: "#1a1d23", background: "#fff", outline: "none" };
const SEL: React.CSSProperties = { ...I, appearance: "none" as const, cursor: "pointer", paddingRight: 28 };

function compress(file: File): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const ratio = Math.min(800 / img.width, 1);
        c.width = img.width * ratio;
        c.height = img.height * ratio;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.5));
      };
      img.src = e.target!.result as string;
    };
    r.readAsDataURL(file);
  });
}

/* ── Checkpoint component (outside WoW to avoid re-creation) ── */
const CK = ({ label, link, val, setVal, tx, setTx, ph }: {
  label: string; link?: string; val: boolean | null; setVal: (v: boolean) => void;
  tx: string; setTx: (v: string) => void; ph?: string;
}) => (
  <div style={{ marginBottom: 8, padding: "10px 12px", background: val === false ? "#fdf0ee" : val === true ? "#ebf5f0" : "#f9f8f6", border: "1px solid " + (val === false ? "#9E3D2B30" : val === true ? "#2A6B5030" : "#e8e4df"), transition: "all .2s" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: val !== null ? 6 : 0 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
        {link && <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: "#1A3A8F", textDecoration: "none", ...M }}>Abrir →</a>}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {[true, false].map((v) => (
          <div key={String(v)} onClick={() => setVal(v)} style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer", background: val === v ? (v ? "#2A6B50" : "#9E3D2B") : "transparent", color: val === v ? "#fff" : "#aaa", border: "1px solid " + (val === v ? (v ? "#2A6B50" : "#9E3D2B") : "#ddd") }}>{v ? "Sim" : "Não"}</div>
        ))}
      </div>
    </div>
    {val !== null && <textarea value={tx} onChange={(e) => setTx(e.target.value)} placeholder={ph || (val ? "Considerações..." : "Por quê não?")} rows={2} style={{ ...I, fontSize: 11, marginTop: 4, resize: "vertical" as const, background: val ? "#f9fdf9" : "#fefafa" }} />}
  </div>
);

/* ════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════ */
export default function WoW() {
  const [tab, setTab] = useState("framework");
  const [exp, setExp] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  /* Firebase */
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  /* Form */
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
  const [filterSm, setFilterSm] = useState("");
  const [viewMode, setViewMode] = useState("form");
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
    try {
      await addDoc(collection(db, "reports"), {
        sm: rSm, squad: rSq, date: rDt,
        cone: rCone, coneText: rConeTx.trim(),
        pdti: rPdti, pdtiText: rPdtiTx.trim(),
        parado: rParado, paradoText: rParadoTx.trim(),
        wipEpic: rWipE, wipEpicText: rWipETx.trim(),
        wipUs: rWipU, wipUsText: rWipUTx.trim(),
        oQue: rOque.trim(), problemas: rProb.trim(), acoes: rAcoes.trim(),
        images: rImgs, createdAt: serverTimestamp(),
      });
      reset();
    } catch (e) { console.error(e); alert("Erro ao salvar!"); }
    setSaving(false);
  };

  const del = async (id: string) => {
    try { await deleteDoc(doc(db, "reports", id)); } catch (e) { console.error(e); }
  };

  const onImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 2 - rImgs.length);
    for (const f of files) {
      const data = await compress(f);
      setRImgs((p) => [...p.slice(0, 1), { data }]);
    }
    if (fRef.current) fRef.current.value = "";
  };

  const filtered = filterSm ? reports.filter((r) => r.sm === filterSm) : reports;

  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [tab]);

  const tog = (id: string) => setExp((p) => (p === id ? null : id));

  /* ── Cadência renderer ── */
  const renderCad = (c: any, open = false) => {
    const isOpen = open || exp === c.id;
    return (
      <div key={c.id} style={{ marginBottom: 6 }}>
        <div onClick={() => !open && tog(c.id)} style={{ background: isOpen ? "#fff" : "rgba(255,255,255,.6)", border: "1px solid " + (isOpen ? c.tagColor + "40" : "#e8e4df"), cursor: open ? "default" : "pointer" }}>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{c.label}</div>
              <div style={{ fontSize: 10, color: "#8a8580", marginTop: 2, ...M }}>{c.freq}</div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.tagColor, opacity: .6 }} />
            {!open && <span style={{ fontSize: 14, color: "#ccc", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>⌄</span>}
          </div>
          {isOpen && (
            <div style={{ padding: "0 16px 14px", borderTop: "1px solid #f0ece7" }}>
              <p style={{ fontSize: 12, color: "#4a4540", lineHeight: 1.6, margin: "10px 0" }}>{c.summary}</p>
              {c.items.map((it: string, i: number) => (
                <div key={i} style={{ fontSize: 12, color: "#3d3a35", lineHeight: 1.6, marginBottom: 3, paddingLeft: 12, borderLeft: `2px solid ${c.tagColor}25` }}>{it}</div>
              ))}
              {c.rules && <div style={{ marginTop: 10 }}>{c.rules.map((r: string, i: number) => (
                <div key={i} style={{ fontSize: 11, color: "#6b6560", lineHeight: 1.5, marginBottom: 3, paddingLeft: 12, position: "relative" as const }}>
                  <span style={{ position: "absolute" as const, left: 0, fontWeight: 700, color: c.tagColor }}>→</span>{r}
                </div>
              ))}</div>}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── Item list renderer ── */
  const renderItems = (items: any[], color: string, num: boolean) => items.map((it, i) => (
    <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid #f0ece7", display: "flex", gap: 10, alignItems: "flex-start" }}>
      {num && <div style={{ width: 20, height: 20, borderRadius: "50%", background: color + "12", color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{it.t || it.name}</div>
        <div style={{ fontSize: 11, color: "#6b6560", lineHeight: 1.5, marginTop: 1 }}>{it.d || it.desc}</div>
      </div>
    </div>
  ));

  /* ══════════════════════════════════════════
     TABS
  ══════════════════════════════════════════ */

  /* FRAMEWORK */
  const allN = [...CAD_SM, ...CAD_SDM];
  const fwN = allN.map((c, i) => ({ ...c, angle: -90 + (i * 360) / allN.length }));

  const fwCx = 50, fwCy = 50, fwR = 36;
  const frameworkContent = (
      <div style={{ animation: "fadeIn .3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ ...S, fontSize: 28, fontWeight: 400 }}>Ciclo de <em style={{ fontStyle: "italic", color: "#1A3A8F" }}>Cadência</em></div>
          <p style={{ fontSize: 12, color: "#8a8580", marginTop: 6 }}>Um material, todas as cadências. Clique em qualquer nó.</p>
        </div>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <svg viewBox="0 0 100 100" style={{ width: "100%", display: "block" }}>
            <circle cx={fwCx} cy={fwCy} r={fwR + 6} fill="none" stroke="#7B5EA7" strokeWidth=".1" strokeDasharray="1 2" opacity=".2" />
            <circle cx={fwCx} cy={fwCy} r={fwR} fill="none" stroke="#1A3A8F" strokeWidth=".2" strokeDasharray="1.5 2" opacity=".12" />
            {fwN.map((n, i) => {
              const nx2 = fwN[(i + 1) % fwN.length];
              const g = 360 / fwN.length;
              const a1 = ((n.angle + g * .15) * Math.PI) / 180, a2 = ((nx2.angle - g * .15) * Math.PI) / 180;
              return (<g key={`a${i}`}><defs><marker id={`fw${i}`} markerWidth="3" markerHeight="2.5" refX="2.8" refY="1.25" orient="auto"><polygon points="0 0,3 1.25,0 2.5" fill={nx2.tagColor} opacity=".35" /></marker></defs><path d={`M${fwCx + fwR * Math.cos(a1)} ${fwCy + fwR * Math.sin(a1)}A${fwR} ${fwR} 0 0 1 ${fwCx + fwR * Math.cos(a2)} ${fwCy + fwR * Math.sin(a2)}`} fill="none" stroke={nx2.tagColor} strokeWidth=".3" strokeDasharray="1 1" opacity=".2" markerEnd={`url(#fw${i})`} /></g>);
            })}
            <circle cx={fwCx} cy={fwCy} r="9" fill="#0f1729" />
            <text x={fwCx} y={fwCy - 1} textAnchor="middle" fill="#fff" fontSize="4" fontWeight="700" style={S}>SDM</text>
            <text x={fwCx} y={fwCy + 2} textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="1.5" style={M} letterSpacing=".05em">CONSOLIDA</text>
            {fwN.map((n, i) => {
              const a = (n.angle * Math.PI) / 180, nx = fwCx + fwR * Math.cos(a), ny = fwCy + fwR * Math.sin(a);
              const h = hover === i, nr = h ? 6 : 5;
              const sdm = CAD_SDM.some((c) => c.id === n.id);
              return (
                <g key={n.id} style={{ cursor: "pointer" }} onClick={() => { setTab("cadencias"); setTimeout(() => setExp(n.id), 100); }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  {h && <circle cx={nx} cy={ny} r={nr + 2} fill={n.tagColor} opacity=".08" />}
                  <circle cx={nx} cy={ny} r={nr} fill={h ? n.tagColor + "15" : "#fff"} stroke={h ? n.tagColor : "#e0ded8"} strokeWidth={h ? ".35" : ".2"} />
                  {sdm && <circle cx={nx} cy={ny} r={nr} fill="none" stroke={n.tagColor} strokeWidth=".15" strokeDasharray=".5 .5" opacity=".4" />}
                  <text x={nx} y={ny + 1.2} textAnchor="middle" fontSize="3.6" style={{ pointerEvents: "none" }}>{n.emoji}</text>
                  <text x={nx} y={ny + nr + 2.4} textAnchor="middle" fill="#1a1d23" fontSize="1.7" fontWeight="600" style={{ pointerEvents: "none" }}>{n.label.length > 20 ? n.label.slice(0, 18) + "…" : n.label}</text>
                  <text x={nx} y={ny + nr + 4.2} textAnchor="middle" fill={n.tagColor} fontSize="1.1" fontWeight="600" style={{ pointerEvents: "none", ...M }}>{sdm ? "SDM" : "SM"}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8a8580" }}><div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid #888" }} /> SM faz</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8a8580" }}><div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px dashed #888" }} /> SDM faz</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 6 }}>
          {[
            { icon: "🎯", l: "Papel do SM", c: "#1A3A8F", t: "papel" },
            { icon: "⚠️", l: "Anti-Padrões", c: "#9E3D2B", t: "papel" },
            { icon: "🔺", l: "Tríade Ativa", c: "#2A6B50", t: "papel" },
            { icon: "📐", l: "Padrões & Métricas", c: "#7B5EA7", t: "padroes" },
            { icon: "🛡️", l: "Proteção", c: "#9E3D2B", t: "padroes" },
          ].map((p, i) => (
            <div key={i} onClick={() => setTab(p.t)} style={{ background: "#fff", border: "1px solid #e8e4df", padding: "12px", cursor: "pointer", borderBottom: `3px solid ${p.c}15`, transition: "all .15s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderBottomColor = p.c)} onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderBottomColor = p.c + "15")}>
              <span style={{ fontSize: 18, display: "block", marginBottom: 4 }}>{p.icon}</span>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{p.l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: "14px 18px", background: "#0f1729" }}>
          <div style={{ ...S, fontSize: 13, fontWeight: 300, lineHeight: 1.6, color: "rgba(255,255,255,.65)", fontStyle: "italic" }}>O report diário do SM alimenta tudo: sync, report pro G, apresentação à LM, munição pro Promotor. Um preenchimento por dia.</div>
        </div>
      </div>
  );

  /* HOJE */
  const hojeContent = (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ background: "#0f1729", padding: "20px 18px", marginBottom: 16 }}>
        <div style={{ ...L, color: "rgba(255,255,255,.3)", marginBottom: 4 }}>Hoje</div>
        <div style={{ ...S, fontSize: 22, color: "#fff" }}>{dn[dow]}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>{reports.length} reports no banco · Report diário + cadências</div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* LEFT */}
        <div style={{ flex: "1 1 320px", minWidth: 260 }}>
          {renderCad(CAD_SM[0], true)}
          {dow === 1 && renderCad(CAD_SM[1], true)}
          <div style={{ ...L, color: "#8a8580", marginTop: 14, marginBottom: 6 }}>Outras cadências</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {[...CAD_SM, ...CAD_SDM].filter((c) => c.id !== "diario" && !(dow === 1 && c.id === "sync")).map((c) => (
              <div key={c.id} onClick={() => { setTab("cadencias"); setTimeout(() => setExp(c.id), 100); }} style={{ padding: "5px 9px", cursor: "pointer", border: "1px solid #e8e4df", background: "#fff", fontSize: 10, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 11 }}>{c.emoji}</span>{c.label}</div>
            ))}
          </div>
        </div>
        {/* RIGHT — REPORT */}
        <div style={{ flex: "1 1 360px", minWidth: 280, maxWidth: 420 }}>
          <div style={{ background: "#fff", border: "1px solid #e0dcd7", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ borderBottom: "1px solid #e0dcd7" }}>
              <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>📋</span>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Report Diário</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 8, color: "#2A6B50", ...M, fontWeight: 600 }}>● FIREBASE</div>
              </div>
              <div style={{ display: "flex", padding: "0 14px", marginTop: 6 }}>
                {[{ id: "form", l: "Registrar" }, { id: "history", l: `Histórico (${reports.length})` }].map((m) => (
                  <div key={m.id} onClick={() => setViewMode(m.id)} style={{ padding: "6px 10px", fontSize: 11, fontWeight: viewMode === m.id ? 600 : 400, color: viewMode === m.id ? "#1A3A8F" : "#8a8580", borderBottom: viewMode === m.id ? "2px solid #1A3A8F" : "2px solid transparent", cursor: "pointer" }}>{m.l}</div>
                ))}
              </div>
            </div>
            {/* FORM */}
            {viewMode === "form" && (
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}><div style={{ ...L, color: "#8a8580", marginBottom: 2, fontSize: 8 }}>SM</div><select value={rSm} onChange={(e) => { setRSm(e.target.value); setRSq(""); }} style={SEL}><option value="">—</option>{SM_NAMES.map((s) => <option key={s}>{s}</option>)}</select></div>
                  <div style={{ flex: 1 }}><div style={{ ...L, color: "#8a8580", marginBottom: 2, fontSize: 8 }}>Squad</div><select value={rSq} onChange={(e) => setRSq(e.target.value)} style={SEL} disabled={!rSm}><option value="">—</option>{rSm && SM_SQUADS[rSm].map((s) => <option key={s}>{s}</option>)}</select></div>
                  <div style={{ width: 100 }}><div style={{ ...L, color: "#8a8580", marginBottom: 2, fontSize: 8 }}>Data</div><input type="date" value={rDt} onChange={(e) => setRDt(e.target.value)} style={I} /></div>
                </div>
                <div style={{ ...L, color: "#7B5EA7", marginBottom: 5, marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 1, background: "#7B5EA7" }} />Checkpoints</div>
                <CK label="Cone atualizado e analisado?" link={LINKS.cone} val={rCone} setVal={setRCone} tx={rConeTx} setTx={setRConeTx} ph="Análise do cone..." />
                <CK label="PDTI atualizado e consistente?" link={LINKS.pdti} val={rPdti} setVal={setRPdti} tx={rPdtiTx} setTx={setRPdtiTx} ph="Observações PDTI..." />
                <CK label="Item parado >2 dias?" val={rParado} setVal={setRParado} tx={rParadoTx} setTx={setRParadoTx} ph="Quais? O que está fazendo?" />
                <CK label="WIP Épicos sob controle?" val={rWipE} setVal={setRWipE} tx={rWipETx} setTx={setRWipETx} ph="Quais épicos? Progresso?" />
                <CK label="WIP USs/Tasks — começando e terminando?" val={rWipU} setVal={setRWipU} tx={rWipUTx} setTx={setRWipUTx} ph="Fluxo ok?" />
                <div style={{ padding: "8px 10px", background: "#f9f8f6", border: "1px solid #e8e4df", marginBottom: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#6B3A8A", ...M, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Painéis Lançamento</div>
                  {[{ l: "O4R1", u: LINKS.dashO4R1 }, { l: "O4R2", u: LINKS.dashO4R2 }, { l: "O4R1×O4R2", u: LINKS.dashO4R1xR2 }].map((d, i) => (
                    <a key={i} href={d.u} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#1A3A8F", textDecoration: "none", display: "block", padding: "1px 0" }}>📊 {d.l} →</a>
                  ))}
                </div>
                <div style={{ ...L, color: "#2A6B50", marginBottom: 5, marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 1, background: "#2A6B50" }} />Contexto</div>
                <textarea value={rOque} onChange={(e) => setROque(e.target.value)} placeholder="O que aconteceu hoje?" rows={2} style={{ ...I, marginBottom: 5, resize: "vertical" as const }} />
                <textarea value={rProb} onChange={(e) => setRProb(e.target.value)} placeholder="Problemas / impedimentos..." rows={2} style={{ ...I, marginBottom: 5, resize: "vertical" as const }} />
                <textarea value={rAcoes} onChange={(e) => setRAcoes(e.target.value)} placeholder="Soluções / próximos passos..." rows={2} style={{ ...I, marginBottom: 5, resize: "vertical" as const }} />
                <div style={{ ...L, color: "#9A7B10", marginBottom: 5, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 1, background: "#9A7B10" }} />Evidência (max 2)</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {rImgs.map((img, i) => (
                    <div key={i} style={{ position: "relative", width: 65, height: 45, border: "1px solid #e0dcd7", overflow: "hidden" }}>
                      <img src={img.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div onClick={() => setRImgs((p) => p.filter((_, j) => j !== i))} style={{ position: "absolute", top: 1, right: 1, width: 14, height: 14, borderRadius: "50%", background: "rgba(0,0,0,.6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, cursor: "pointer" }}>×</div>
                    </div>
                  ))}
                  {rImgs.length < 2 && <div onClick={() => fRef.current?.click()} style={{ width: 65, height: 45, border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#ccc" }}>+</div>}
                  <input ref={fRef} type="file" accept="image/*" multiple onChange={onImg} style={{ display: "none" }} />
                </div>
                <button onClick={submit} disabled={!rSm || !rSq || saving} style={{ width: "100%", padding: "10px", background: !rSm || !rSq ? "#ddd" : "#0f1729", color: !rSm || !rSq ? "#aaa" : "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: !rSm || !rSq ? "not-allowed" : "pointer" }}>
                  {saving ? "Salvando..." : "Registrar report"}
                </button>
              </div>
            )}
            {/* HISTORY */}
            {viewMode === "history" && (
              <div>
                <div style={{ padding: "8px 14px", borderBottom: "1px solid #f0ece7", display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <div onClick={() => setFilterSm("")} style={{ padding: "2px 7px", fontSize: 9, fontWeight: filterSm === "" ? 600 : 400, background: filterSm === "" ? "#0f1729" : "transparent", color: filterSm === "" ? "#fff" : "#8a8580", border: "1px solid " + (filterSm === "" ? "#0f1729" : "#e0dcd7"), cursor: "pointer" }}>Todos</div>
                  {SM_NAMES.map((s) => (
                    <div key={s} onClick={() => setFilterSm(s)} style={{ padding: "2px 7px", fontSize: 9, fontWeight: filterSm === s ? 600 : 400, background: filterSm === s ? smC[s] : "transparent", color: filterSm === s ? "#fff" : "#8a8580", border: "1px solid " + (filterSm === s ? smC[s] : "#e0dcd7"), cursor: "pointer" }}>{s}</div>
                  ))}
                </div>
                <div style={{ maxHeight: 460, overflowY: "auto" }}>
                  {loading ? <div style={{ padding: 16, textAlign: "center", color: "#aaa", fontSize: 11 }}>Carregando...</div>
                    : filtered.length === 0 ? <div style={{ padding: 16, textAlign: "center", color: "#aaa", fontSize: 11 }}>Nenhum report.</div>
                    : filtered.map((r) => (
                      <div key={r.id} style={{ padding: "10px 14px", borderBottom: "1px solid #f0ece7" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: smC[r.sm] || "#888" }} />
                          <b style={{ fontSize: 11 }}>{r.sm}</b>
                          <span style={{ fontSize: 8, fontWeight: 600, padding: "1px 4px", background: (smC[r.sm] || "#888") + "12", color: smC[r.sm], ...M }}>{r.squad}</span>
                          <span style={{ marginLeft: "auto", fontSize: 9, color: "#aaa", ...M }}>{r.date}</span>
                          <span onClick={() => del(r.id)} style={{ fontSize: 12, color: "#ccc", cursor: "pointer" }}>×</span>
                        </div>
                        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 4 }}>
                          {[{ l: "Cone", v: r.cone }, { l: "PDTI", v: r.pdti }, { l: "Parado", v: r.parado }, { l: "WIP É", v: r.wipEpic }, { l: "WIP U", v: r.wipUs }].map((ck, i) => ck.v != null ? <span key={i} style={{ fontSize: 8, fontWeight: 600, padding: "1px 4px", background: ck.v ? (ck.l === "Parado" ? "#9E3D2B15" : "#2A6B5015") : "#9E3D2B15", color: ck.v ? (ck.l === "Parado" ? "#9E3D2B" : "#2A6B50") : "#9E3D2B", ...M }}>{ck.l}: {ck.l === "Parado" ? (ck.v ? "⚠" : "✓") : ck.v ? "✓" : "✗"}</span> : null)}
                        </div>
                        {r.oQue && <div style={{ fontSize: 11, color: "#3d3a35", lineHeight: 1.5 }}>{r.oQue}</div>}
                        {r.problemas && <div style={{ fontSize: 10, color: "#9E3D2B", marginTop: 3, paddingLeft: 7, borderLeft: "2px solid #9E3D2B30" }}>{r.problemas}</div>}
                        {r.acoes && <div style={{ fontSize: 10, color: "#2A6B50", marginTop: 2, paddingLeft: 7, borderLeft: "2px solid #2A6B5030" }}>{r.acoes}</div>}
                        {r.coneText && <div style={{ fontSize: 10, color: "#7B5EA7", marginTop: 2, paddingLeft: 7, borderLeft: "2px solid #7B5EA730" }}>Cone: {r.coneText}</div>}
                        {r.pdtiText && <div style={{ fontSize: 10, color: "#7B5EA7", marginTop: 2, paddingLeft: 7, borderLeft: "2px solid #7B5EA730" }}>PDTI: {r.pdtiText}</div>}
                        {r.wipEpicText && <div style={{ fontSize: 10, color: "#6B3A8A", marginTop: 2, paddingLeft: 7, borderLeft: "2px solid #6B3A8A30" }}>Épicos: {r.wipEpicText}</div>}
                        {r.wipUsText && <div style={{ fontSize: 10, color: "#6B3A8A", marginTop: 2, paddingLeft: 7, borderLeft: "2px solid #6B3A8A30" }}>US: {r.wipUsText}</div>}
                        {r.images?.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 5 }}>{r.images.map((img: any, i: number) => <img key={i} src={img.data} alt="" style={{ width: 60, height: 42, objectFit: "cover", border: "1px solid #e0dcd7", cursor: "pointer" }} onClick={() => window.open(img.data, "_blank")} />)}</div>}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* CADÊNCIAS */
  const cadenciasContent = (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ ...L, color: "#1A3A8F", marginBottom: 6 }}>O que o SM faz</div>
      {CAD_SM.map((c) => renderCad(c))}
      <div style={{ ...L, color: "#6B3A8A", marginTop: 18, marginBottom: 6 }}>O que o SDM faz com os dados</div>
      <div style={{ fontSize: 11, color: "#8a8580", marginBottom: 8 }}>Reports diários alimentam tudo abaixo. SM não faz nada extra.</div>
      {CAD_SDM.map((c) => renderCad(c))}
    </div>
  );

  /* PAPEL */
  const papelContent = (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ background: "#0f1729", padding: "14px 16px", marginBottom: 12, borderLeft: "4px solid #1a6b5a" }}>
        <div style={{ ...L, color: "rgba(255,255,255,.3)", marginBottom: 2 }}>Modelo de Gestão · CTO</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>A LM não gerencia mais os SMs diretamente. A Venice é responsável. O SDM garante resultados. Cobrança: diagnósticos proativos, ações corretivas e métricas padronizadas.</div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}><span>✅</span><b style={{ fontSize: 13 }}>O que o SM FAZ</b></div>
        {renderItems(PAPEL_FAZ, "#1a6b5a", true)}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}><span>🚫</span><b style={{ fontSize: 13 }}>O que o SM NÃO FAZ</b></div>
        {renderItems(PAPEL_NAOFAZ, "#9E3D2B", true)}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", background: "#9E3D2B06", display: "flex", alignItems: "center", gap: 6 }}><span>⚠️</span><b style={{ fontSize: 13 }}>Anti-Padrões</b></div>
        {renderItems(ANTIPADROES, "#9E3D2B", false)}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e4df" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}><span>🔺</span><b style={{ fontSize: 13 }}>Tríade — TL + PO + SM</b></div>
        {renderItems(TRIADE, "#2A6B50", true)}
      </div>
    </div>
  );

  /* PADRÕES */
  const padroesContent = (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}><span>✅</span><b style={{ fontSize: 13 }}>DoR — Definition of Ready</b></div>
        {renderItems(DOR, "#2A6B50", true)}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}><span>🏁</span><b style={{ fontSize: 13 }}>DoD — Definition of Done</b></div>
        {DOD.map((ph, i) => (<div key={i} style={{ padding: "8px 16px", borderBottom: "1px solid #f0ece7" }}><div style={{ ...L, color: "#1A3A8F", marginBottom: 4 }}>{ph.phase}</div>{ph.items.map((it, j) => <div key={j} style={{ fontSize: 12, color: "#4a4540", marginBottom: 2, paddingLeft: 10, borderLeft: "2px solid #1A3A8F20" }}>{it}</div>)}</div>))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e4df", marginBottom: 10 }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", display: "flex", alignItems: "center", gap: 6 }}><span>📐</span><b style={{ fontSize: 13 }}>4 Métricas Obrigatórias</b></div>
        {renderItems(METRICAS_OBR, "#7B5EA7", true)}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e4df" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e8e4df", background: "#9E3D2B06", display: "flex", alignItems: "center", gap: 6 }}><span>🛡️</span><b style={{ fontSize: 13 }}>Proteção Baseada em Fatos</b></div>
        {[{ n: "1", l: "Consultar reports" }, { n: "2", l: "Listar entregas + métricas" }, { n: "3", l: "Traduzir pra negócio" }, { n: "4", l: "Montar fatos + números" }, { n: "5", l: "Validar com G" }].map((s, i) => (
          <div key={i} style={{ padding: "8px 16px", borderBottom: "1px solid #f0ece7", display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fdf0ee", color: "#9E3D2B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{s.n}</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
        <div style={{ padding: "12px 16px", background: "#0f1729" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontStyle: "italic", lineHeight: 1.6 }}>A Venice é dona dos seus SMs. Quando a LM questionar, o SDM responde com dados. Nunca opinião — sempre fatos.</div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════ RENDER ══════════════════ */
  const TABS = [
    { id: "framework", l: "Framework", ic: "◯" },
    { id: "hoje", l: "Hoje", ic: "◉" },
    { id: "cadencias", l: "Cadências", ic: "↻" },
    { id: "papel", l: "Papel & Regras", ic: "◎" },
    { id: "padroes", l: "Padrões", ic: "◆" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* NAV */}
      <div style={{ background: "#0f1729", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center", height: 44, gap: 10 }}>
          <div style={{ ...S, fontSize: 17, color: "#fff" }}>Torre <span style={{ color: "#c9a84c", fontWeight: 600 }}>LM</span></div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,.1)" }} />
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", ...M }}>WoW</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", background: "rgba(42,107,80,.15)", border: "1px solid rgba(42,107,80,.2)", color: "#2A6B50", ...M }}>● FIREBASE</div>
        </div>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px", display: "flex", overflowX: "auto" }}>
          {TABS.map((t) => (
            <div key={t.id} onClick={() => { setTab(t.id); setExp(null); }} style={{ padding: "7px 12px", fontSize: 11, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? "#fff" : "rgba(255,255,255,.35)", cursor: "pointer", borderBottom: tab === t.id ? "2px solid #c9a84c" : "2px solid transparent", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 9, opacity: tab === t.id ? 1 : .4 }}>{t.ic}</span>{t.l}
            </div>
          ))}
        </div>
      </div>
      {/* CONTENT */}
      <div ref={ref} style={{ maxWidth: 1060, margin: "0 auto", padding: "16px 18px 50px" }}>
        {tab === "framework" && frameworkContent}
        {tab === "hoje" && hojeContent}
        {tab === "cadencias" && cadenciasContent}
        {tab === "papel" && papelContent}
        {tab === "padroes" && padroesContent}
      </div>
    </div>
  );
}
