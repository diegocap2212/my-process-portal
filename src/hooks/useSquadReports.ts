import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SquadDataOverride {
  week: string;
  field: string;
  value: number;
}

export function useSquadReports(sm: string, squad: string, week: string) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load existing notes
  useEffect(() => {
    setLoaded(false);
    supabase
      .from("squad_reports")
      .select("notes")
      .eq("sm", sm)
      .eq("squad", squad)
      .eq("week", week)
      .maybeSingle()
      .then(({ data }) => {
        setNotes(data?.notes || "");
        setLoaded(true);
      });
  }, [sm, squad, week]);

  const saveNotes = useCallback(async (value: string) => {
    setSaving(true);
    // upsert
    const { error } = await supabase
      .from("squad_reports")
      .upsert({ sm, squad, week, notes: value }, { onConflict: "sm,squad,week" });
    setSaving(false);
    return !error;
  }, [sm, squad, week]);

  return { notes, setNotes, saveNotes, saving, loaded };
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
