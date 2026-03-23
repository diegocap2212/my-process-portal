import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONE_MOCK_DATA, getSmTotals, getTorreTotals } from "@/data/cone-mock";
import type { SquadConeData, ConeStatusType } from "@/data/cone-mock";
import { calculateMetrics, type JiraItem } from "@/services/metricsCalculator";

interface UseConeDataResult {
  data: Record<string, Record<string, SquadConeData>>;
  rawItems: JiraItem[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

export function useConeData(): UseConeDataResult {
  const [data, setData] = useState<Record<string, Record<string, SquadConeData>>>(CONE_MOCK_DATA);
  const [rawItems, setRawItems] = useState<JiraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const { data: response, error: fnError } = await supabase.functions.invoke(
          "read-sharepoint-data"
        );

        if (cancelled) return;

        if (fnError) throw new Error(fnError.message || "Edge function error");
        if (response?.error) throw new Error(response.error);

        const items: JiraItem[] = response?.items || [];
        if (items.length === 0) throw new Error("No data returned");

        const metrics = calculateMetrics(items);
        setData(metrics);
        setRawItems(items);
        setIsLive(true);
        setError(null);
      } catch (err) {
        console.warn("useConeData: falling back to mock data", err);
        if (!cancelled) {
          setData(CONE_MOCK_DATA);
          setIsLive(false);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, rawItems, loading, error, isLive };
}

// Re-export helpers that work with any data shape
export function getSmTotalsFromData(
  data: Record<string, Record<string, SquadConeData>>,
  sm: string
) {
  const squads = data[sm];
  if (!squads) return { vazao: 0, cycleTime: 0, p85: 0, acimP85: 0, worstCone: "green" as ConeStatusType };

  const entries = Object.values(squads);
  const vazao = entries.reduce((s, e) => s + e.vazao, 0);
  const cycleTime = entries.length > 0
    ? +(entries.reduce((s, e) => s + e.cycleTime, 0) / entries.length).toFixed(1) : 0;
  const p85 = entries.length > 0
    ? +(entries.reduce((s, e) => s + e.p85, 0) / entries.length).toFixed(1) : 0;
  const acimP85 = entries.reduce((s, e) => s + e.acimP85, 0);

  const coneOrder: ConeStatusType[] = ["green", "yellow", "red"];
  const worstCone = entries.reduce<ConeStatusType>(
    (worst, e) => (coneOrder.indexOf(e.cone) > coneOrder.indexOf(worst) ? e.cone : worst),
    "green"
  );

  return { vazao, cycleTime, p85, acimP85, worstCone };
}

export function getTorreTotalsFromData(
  data: Record<string, Record<string, SquadConeData>>
) {
  let vazao = 0, cycleSum = 0, acimP85 = 0, count = 0;
  for (const squads of Object.values(data)) {
    for (const d of Object.values(squads)) {
      vazao += d.vazao;
      cycleSum += d.cycleTime;
      acimP85 += d.acimP85;
      count++;
    }
  }
  return {
    vazao,
    cycleTime: count > 0 ? +(cycleSum / count).toFixed(1) : 0,
    acimP85,
    totalSquads: count,
  };
}
