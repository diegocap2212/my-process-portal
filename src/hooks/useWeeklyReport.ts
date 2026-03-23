import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WeeklyReport {
  id: string;
  sm: string;
  week: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  created_at: string;
}

export interface WeeklyReportInput {
  sm: string;
  week: string;
  q1: string;
  q2: string;
  q3: string;
}

function getCurrentWeek(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  const weekNum = Math.ceil((diff / oneWeek) + start.getDay() / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function useWeeklyReports() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const { data, error } = await supabase
      .from("weekly_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Weekly reports error:", error);
      toast.error("Erro ao carregar reports semanais.");
    } else {
      setReports(data as WeeklyReport[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel("weekly_reports_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_reports" }, () => {
        fetchReports();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchReports]);

  const submitWeeklyReport = useCallback(async (input: WeeklyReportInput): Promise<boolean> => {
    try {
      const { error } = await supabase.from("weekly_reports").insert({
        sm: input.sm,
        week: input.week,
        q1: input.q1.trim(),
        q2: input.q2.trim(),
        q3: input.q3.trim(),
      });

      if (error) throw error;
      toast.success("Report semanal salvo!");
      return true;
    } catch (e) {
      console.error("Submit weekly error:", e);
      toast.error("Erro ao salvar report semanal.");
      return false;
    }
  }, []);

  return { reports, loading, submitWeeklyReport, getCurrentWeek };
}

export { getCurrentWeek };
