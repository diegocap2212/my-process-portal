import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase";
import {
  collection, addDoc, deleteDoc, doc, query,
  orderBy, onSnapshot, serverTimestamp,
} from "firebase/firestore";
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

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
        toast.error("Erro ao conectar ao Firebase. Verifique as regras de segurança.");
      }
    );
    return unsub;
  }, []);

  const submitReport = useCallback(async (input: ReportInput): Promise<boolean> => {
    try {
      await addDoc(collection(db, "reports"), {
        ...input,
        coneText: input.coneText.trim(),
        pdtiText: input.pdtiText.trim(),
        paradoText: input.paradoText.trim(),
        wipEpicText: input.wipEpicText.trim(),
        wipUsText: input.wipUsText.trim(),
        oQue: input.oQue.trim(),
        problemas: input.problemas.trim(),
        acoes: input.acoes.trim(),
        createdAt: serverTimestamp(),
      });
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
      await deleteDoc(doc(db, "reports", id));
      toast.success("Report removido.");
    } catch (e) {
      console.error("Delete error:", e);
      toast.error("Erro ao remover report.");
    }
  };

  return { reports, loading, error, submitReport, deleteReport };
}
