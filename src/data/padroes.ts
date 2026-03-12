import type { PapelItem, DodPhase, MetricaItem } from "@/types/report";

export const DOR: PapelItem[] = [
  { t: "Problema e Valor Claros", d: "Todos entendem o porquê." },
  { t: "Critérios de Aceite Testáveis", d: "Condições escritas." },
  { t: "Escopo cabe na Sprint", d: "Se grande, fatiado." },
  { t: "Dependências Mapeadas", d: "Identificadas com plano." },
  { t: "Esforço Estimado", d: "Time confirmou." },
];

export const DOD: DodPhase[] = [
  { phase: "Construção Técnica", items: ["Código revisado", "Testes passando", "Branch principal"] },
  { phase: "Validação Funcional", items: ["Critérios atendidos", "Aprovado QA"] },
  { phase: "Aceite", items: ["Doc atualizada", "PO aceitou"] },
];

export const METRICAS_OBR: MetricaItem[] = [
  { name: "Vazão (Throughput)", desc: "Itens por sprint · Capacidade real" },
  { name: "Cycle Time", desc: "Início → Done · Previsibilidade" },
  { name: "Lead Time P85%", desc: "Criação → entrega · Compromissos" },
  { name: "Cone da Incerteza", desc: "Refinamento de escopo · DECISÃO" },
];
