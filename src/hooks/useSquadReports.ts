import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SquadDataOverride {
  week: string;
  field: string;
  value: number;
}

export interface SquadReportData {
  notes: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

const emptyReport: SquadReportData = { notes: "", q1: "", q2: "", q3: "", q4: "" };

export function useSquadReports(sm: string, squad: string, week: string) {
  const [report, setReport] = useState<SquadReportData>(emptyReport);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    supabase
      .from("squad_reports")
      .select("notes, q1, q2, q3, q4")
      .eq("sm", sm)
      .eq("squad", squad)
      .eq("week", week)
      .maybeSingle()
      .then(({ data }) => {
        setReport({
          notes: data?.notes || "",
          q1: data?.q1 || "",
          q2: data?.q2 || "",
          q3: data?.q3 || "",
          q4: data?.q4 || "",
        });
        setLoaded(true);
      });
  }, [sm, squad, week]);

  const updateField = useCallback((field: keyof SquadReportData, value: string) => {
    setReport((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveReport = useCallback(async (data?: Partial<SquadReportData>) => {
    setSaving(true);
    const toSave = data ? { ...report, ...data } : report;
    const { error } = await supabase
      .from("squad_reports")
      .upsert({ sm, squad, week, ...toSave }, { onConflict: "sm,squad,week" });
    setSaving(false);
    return !error;
  }, [sm, squad, week, report]);

  return { report, updateField, saveReport, saving, loaded };
}

export function useSquadOverrides(sm: string, squad: string) {
  const [overrides, setOverrides] = useState<SquadDataOverride[]>([]);

  useEffect(() => {
    supabase
      .from("squad_data_overrides")
      .select("week, field, value")
      .eq("sm", sm)
      .eq("squad", squad)
      .then(({ data }) => {
        if (data) setOverrides(data);
      });
  }, [sm, squad]);

  const saveOverride = useCallback(async (week: string, field: string, value: number) => {
    const { error } = await supabase
      .from("squad_data_overrides")
      .upsert({ sm, squad, week, field, value }, { onConflict: "sm,squad,week,field" });
    if (!error) {
      setOverrides((prev) => {
        const filtered = prev.filter((o) => !(o.week === week && o.field === field));
        return [...filtered, { week, field, value }];
      });
    }
    return !error;
  }, [sm, squad]);

  return { overrides, saveOverride };
}
