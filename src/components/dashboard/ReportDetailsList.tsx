import React, { useState } from "react";
import type { Report } from "@/types/report";
import { smColors } from "@/data/squads";
import { fontSerif, fontMono } from "@/styles/constants";
import ImageModal from "./ImageModal";

interface Props {
  reports: Report[];
}

const CHECKPOINTS = [
  { key: "cone", textKey: "coneText", label: "Cone atualizado" },
  { key: "pdti", textKey: "pdtiText", label: "PDTI consistente" },
  { key: "parado", textKey: "paradoText", label: "Item parado >2d" },
  { key: "wipEpic", textKey: "wipEpicText", label: "WIP Épicos" },
  { key: "wipUs", textKey: "wipUsText", label: "WIP USs/Tasks" },
] as const;

const PAGE_SIZE = 10;

const ReportDetailsList: React.FC<Props> = ({ reports }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalImg, setModalImg] = useState<string | null>(null);

  const sorted = [...reports].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const visible = sorted.slice(0, visibleCount);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (reports.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)", marginBottom: 10 }}>
        DETALHES DOS REPORTS ({reports.length})
      </div>

      {visible.map((r) => {
        const isOpen = expanded.has(r.id);
        const color = smColors[r.sm] || "hsl(215.4 16.3% 46.9%)";

        return (
          <div
            key={r.id}
            style={{
              background: "hsl(0 0% 100%)",
              border: "1px solid hsl(214 31.8% 91.4%)",
              borderRadius: 6,
              marginBottom: 8,
              overflow: "hidden",
            }}
          >
            {/* Header - always visible */}
            <div
              onClick={() => toggle(r.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", cursor: "pointer",
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ ...fontSerif, fontSize: 13, color: "hsl(222.2 84% 4.9%)", flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{r.sm}</span>
                <span style={{ color: "hsl(215.4 16.3% 46.9%)", margin: "0 6px" }}>·</span>
                <span>{r.squad}</span>
              </div>
              <div style={{ fontSize: 11, color: "hsl(215.4 16.3% 46.9%)" }}>{r.date}</div>
              {/* Checkpoint badges */}
              <div style={{ display: "flex", gap: 3 }}>
                {CHECKPOINTS.map(({ key }) => {
                  const val = r[key as keyof Report];
                  return (
                    <div
                      key={key}
                      style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: val === true ? "#22c55e" : val === false ? "#ef4444" : "#d1d5db",
                      }}
                      title={`${key}: ${val === true ? "Sim" : val === false ? "Não" : "N/A"}`}
                    />
                  );
                })}
              </div>
              <div style={{ fontSize: 14, color: "hsl(215.4 16.3% 46.9%)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>
                ▾
              </div>
            </div>

            {/* Expanded content */}
            {isOpen && (
              <div style={{ padding: "0 14px 14px", borderLeft: `3px solid ${color}` }}>
                {/* Checkpoints with text */}
                <div style={{ ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)", marginTop: 8, marginBottom: 6 }}>
                  CHECKPOINTS
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6, marginBottom: 12 }}>
                  {CHECKPOINTS.map(({ key, textKey, label }) => {
                    const val = r[key as keyof Report];
                    const text = r[textKey as keyof Report] as string;
                    return (
                      <div key={key} style={{ padding: "6px 8px", background: "hsl(210 40% 96.1%)", borderRadius: 4, fontSize: 11 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                          <span style={{ color: val === true ? "#22c55e" : val === false ? "#ef4444" : "#9ca3af", fontWeight: 700 }}>
                            {val === true ? "✓" : val === false ? "✗" : "–"}
                          </span>
                          <span style={{ fontWeight: 600, color: "hsl(222.2 84% 4.9%)" }}>{label}</span>
                        </div>
                        {text && <div style={{ color: "hsl(215.4 16.3% 46.9%)", fontSize: 10, lineHeight: 1.4 }}>{text}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Qualitative fields */}
                {[
                  { label: "O que aconteceu", value: r.oQue },
                  { label: "Problemas", value: r.problemas },
                  { label: "Ações", value: r.acoes },
                ].filter(({ value }) => value?.trim()).map(({ label, value }) => (
                  <div key={label} style={{ marginBottom: 8 }}>
                    <div style={{ ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)", marginBottom: 3 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 11, color: "hsl(222.2 84% 4.9%)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {value}
                    </div>
                  </div>
                ))}

                {/* Images */}
                {r.images && r.images.length > 0 && (
                  <div>
                    <div style={{ ...fontMono, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)", marginBottom: 4 }}>
                      IMAGENS ({r.images.length})
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.images.map((img, i) => (
                        <img
                          key={i}
                          src={img.data}
                          alt={`Report ${r.sm} ${r.date} img ${i + 1}`}
                          onClick={() => setModalImg(img.data)}
                          style={{
                            width: 80, height: 60, objectFit: "cover",
                            borderRadius: 4, cursor: "zoom-in",
                            border: "1px solid hsl(214 31.8% 91.4%)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {visibleCount < sorted.length && (
        <div
          onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
          style={{
            textAlign: "center", padding: "10px", fontSize: 11,
            color: "hsl(222.2 84% 4.9%)", cursor: "pointer",
            background: "hsl(0 0% 100%)", border: "1px solid hsl(214 31.8% 91.4%)",
            borderRadius: 6, fontWeight: 600,
          }}
        >
          Carregar mais ({sorted.length - visibleCount} restantes)
        </div>
      )}

      {modalImg && <ImageModal src={modalImg} onClose={() => setModalImg(null)} />}
    </div>
  );
};

export default ReportDetailsList;
