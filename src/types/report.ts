import { Timestamp } from "firebase/firestore";

export interface Report {
  id: string;
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
  createdAt: Timestamp;
}

export interface Cadencia {
  id: string;
  emoji: string;
  label: string;
  freq: string;
  tagColor: string;
  summary: string;
  items: string[];
  rules?: string[];
}

export interface PapelItem {
  t: string;
  d: string;
}

export interface DodPhase {
  phase: string;
  items: string[];
}

export interface MetricaItem {
  name: string;
  desc: string;
}
