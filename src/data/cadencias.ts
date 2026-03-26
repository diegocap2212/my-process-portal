import type { Cadencia } from "@/types/report";

export const CAD_SM: Cadencia[] = [
  {
    id: "diario", emoji: "📈", label: "Rotina Diária + Report", freq: "Todo dia · ~10 min", tagColor: "#7B5EA7",
    summary: "O SM é o guardião do board. Antes da daily, garante que o Jira reflete a realidade. Depois, preenche o report diário — isso alimenta TODO o ciclo do SDM. Um único preenchimento, todos os relatórios.",
    items: ["Verificar cards com status atualizado", "Identificar itens parados >2 dias → agir no mesmo dia", "Garantir que o board reflete a realidade", "Preencher o report diário (checkpoints + contexto + evidência)"],
    rules: ["SM faz isso ANTES da daily do time", "O report diário É o artefato — não existe outro doc", "Se leva mais de 10 min, o board tem problemas estruturais"],
  },
  {
    id: "sync", emoji: "🔄", label: "Sync Semanal", freq: "Segunda · 30 min", tagColor: "#1A3A8F",
    summary: "4 SMs + SDM. Cada SM apresenta em 5 min usando os reports diários da semana. SDM cruza padrões nos 10 min finais.",
    items: ["5 min por SM: tração, travamentos, métricas, evidências", "SM usa os próprios reports como base — sem preparação extra", "10 min finais: SDM cruza padrões e decide ações"],
    rules: ["SDM não fala nos primeiros 20 min", "Se SM preencheu o diário durante a semana, está preparado"],
  },
  {
    id: "checkin", emoji: "💬", label: "Check-in Individual", freq: "Quinzenal · 30 min", tagColor: "#2A6B50",
    summary: "1:1 com o SDM. Suporte, não fiscalização. SDM já tem os reports e foca em profundidade.",
    items: ["SDM conduz com base nos reports — SM não prepara nada extra", "Foco: métricas com tendência, papel (faz/não faz), tríade ativa", "Espaço para o SM pedir ajuda ou escalar"],
    rules: ["Tom de suporte — não avaliação", "Se SM absorve papel de PO ou PM, apontar com clareza"],
  },
];

export const CAD_SDM: Cadencia[] = [
  { id: "report-g", emoji: "📊", label: "Report para Lucas", freq: "Quinzenal", tagColor: "#2A6B50", summary: "SDM compila reports diários em narrativa comercial. SM não faz nada aqui.", items: ["Compilar reports → extrair entregas + métricas", "Traduzir pra linguagem de negócio", "1 página máximo"] },
  { id: "apresentacao-lm", emoji: "🏢", label: "Apresentação à LM", freq: "Quinzenal (alterna c/ W Brain)", tagColor: "#6B3A8A", summary: "SDM apresenta resultados padronizados à LM.", items: ["Métricas por squad + diagnósticos proativos + ROI", "Artefatos padronizados", "NUNCA expor SM individualmente"] },
  { id: "municao", emoji: "🎯", label: "Apresentação para CTO", freq: "Mensal · 1 página", tagColor: "#9E3D2B", summary: "Destilação do mês para apresentação direta à CTO.", items: ["Headline + painel + 3 entregas + 1 risco + ROI", "Se a CTO não entender em 2 min, está longo demais"] },
];
