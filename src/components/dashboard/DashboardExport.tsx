import React, { useRef, useState } from "react";
import { fontMono } from "@/styles/constants";

interface Props {
  dashboardRef: React.RefObject<HTMLDivElement>;
  filters: { sm: string; squad: string; startDate: string; endDate: string };
}

const DashboardExport: React.FC<Props> = ({ dashboardRef, filters }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!dashboardRef.current || exporting) return;
    setExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f1f5f9",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const imgWidth = 210; // A4 width mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = 297;

      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 18, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text("Torre LM — Relatório Dashboard", 10, 12);
      pdf.setFontSize(7);
      pdf.setTextColor(180, 180, 180);

      const filterParts: string[] = [];
      if (filters.sm) filterParts.push(`SM: ${filters.sm}`);
      if (filters.squad) filterParts.push(`Squad: ${filters.squad}`);
      if (filters.startDate) filterParts.push(`De: ${filters.startDate}`);
      if (filters.endDate) filterParts.push(`Até: ${filters.endDate}`);
      const filterText = filterParts.length > 0 ? filterParts.join(" | ") : "Sem filtros";
      pdf.text(`${filterText} · Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 10, 16);

      // Content pages
      let yOffset = 0;
      let pageNum = 0;

      while (yOffset < imgHeight) {
        if (pageNum > 0) pdf.addPage();

        const yStart = pageNum === 0 ? 20 : 5;
        const availHeight = pageNum === 0 ? pageHeight - 22 : pageHeight - 10;

        pdf.addImage(imgData, "JPEG", 0, yStart - (yOffset * imgWidth) / canvas.width, imgWidth, imgHeight);

        yOffset += availHeight;
        pageNum++;

        if (pageNum > 20) break; // safety
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      pdf.save(`torre-lm-dashboard-${dateStr}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Erro ao exportar. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      style={{
        ...fontMono, fontSize: 9, fontWeight: 600, letterSpacing: ".06em",
        textTransform: "uppercase",
        padding: "6px 14px", borderRadius: 4,
        border: "1px solid hsl(214 31.8% 91.4%)",
        background: exporting ? "hsl(210 40% 96.1%)" : "hsl(0 0% 100%)",
        color: exporting ? "hsl(215.4 16.3% 46.9%)" : "hsl(222.2 84% 4.9%)",
        cursor: exporting ? "wait" : "pointer",
        display: "flex", alignItems: "center", gap: 6,
        transition: "all .15s ease",
      }}
      onMouseEnter={(e) => {
        if (!exporting) (e.currentTarget.style.background = "hsl(222.2 84% 4.9%)"),
          (e.currentTarget.style.color = "hsl(210 40% 98%)");
      }}
      onMouseLeave={(e) => {
        if (!exporting) (e.currentTarget.style.background = "hsl(0 0% 100%)"),
          (e.currentTarget.style.color = "hsl(222.2 84% 4.9%)");
      }}
    >
      {exporting ? "⏳ Exportando…" : "📄 Exportar PDF"}
    </button>
  );
};

export default DashboardExport;
