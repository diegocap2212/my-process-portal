import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Report } from "@/types/report";

interface ReportInput {
  sm: string;
  squad: string;
  date: string;
  cone: boolean | null;
  coneText: string;
  pdti: boolean | null;
  pdtiText: string;
  parado: boolean | null;
  paradoText: string;
  wipEpic: boolean | null;
  wipEpicText: string;
  wipUs: boolean | null;
  wipUsText: string;
  oQue: string;
  problemas: string;
  acoes: string;
  images: { data: string }[];
}

function mapDbToReport(row: any): Report {
  return {
    id: row.id,
    sm: row.sm,
    squad: row.squad,
    date: row.date,
    cone: row.cone,
    coneText: row.cone_text,
    pdti: row.pdti,
    pdtiText: row.pdti_text,
    parado: row.parado,
    paradoText: row.parado_text,
    wipEpic: row.wip_epic,
    wipEpicText: row.wip_epic_text,
    wipUs: row.wip_us,
    wipUsText: row.wip_us_text,
    oQue: row.o_que,
    problemas: row.problemas,
    acoes: row.acoes,
    images: row.images || [],
    createdAt: row.created_at,
  };
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      console.error("Reports error:", err);
      setError(err.message);
      toast.error("Erro ao carregar reports.");
    } else {
      setReports((data || []).map(mapDbToReport));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel("reports_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => {
        fetchReports();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchReports]);

  const submitReport = useCallback(async (input: ReportInput): Promise<boolean> => {
    try {
      const { error } = await supabase.from("reports").insert({
        sm: input.sm,
        squad: input.squad,
        date: input.date,
        cone: input.cone,
        cone_text: input.coneText.trim(),
        pdti: input.pdti,
        pdti_text: input.pdtiText.trim(),
        parado: input.parado,
        parado_text: input.paradoText.trim(),
        wip_epic: input.wipEpic,
        wip_epic_text: input.wipEpicText.trim(),
        wip_us: input.wipUs,
        wip_us_text: input.wipUsText.trim(),
        o_que: input.oQue.trim(),
        problemas: input.problemas.trim(),
        acoes: input.acoes.trim(),
        images: input.images,
      });

      if (error) throw error;
      toast.success("Report salvo com sucesso!");
      return true;
    } catch (e) {
      console.error("Submit error:", e);
      toast.error("Erro ao salvar report. Verifique sua conexão.");
      return false;
    }
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
      toast.success("Report removido.");
    } catch (e) {
      console.error("Delete error:", e);
      toast.error("Erro ao remover report.");
    }
  }, []);

  return { reports, loading, error, submitReport, deleteReport };
}
