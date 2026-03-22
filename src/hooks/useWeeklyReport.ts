import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase";
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";

export interface WeeklyReport {
  id: string;
  sm: string;
  week: string; // YYYY-Wnn
  q1: string; // tração
  q2: string; // travado/escalação
  q3: string; // narrativa cliente
  createdAt: any;
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

  useEffect(() => {
    const q = query(collection(db, "weeklyReports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WeeklyReport)));
        setLoading(false);
      },
      (err) => {
        console.error("Weekly reports error:", err);
        setLoading(false);
        toast.error("Erro ao carregar reports semanais.");
      }
    );
    return unsub;
  }, []);

  const submitWeeklyReport = useCallback(async (input: WeeklyReportInput): Promise<boolean> => {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 15000)
      );
      await Promise.race([
        addDoc(collection(db, "weeklyReports"), {
          ...input,
          q1: input.q1.trim(),
          q2: input.q2.trim(),
          q3: input.q3.trim(),
          createdAt: serverTimestamp(),
        }),
        timeout,
      ]);
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
