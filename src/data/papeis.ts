import type { PapelItem } from "@/types/report";

export const PAPEL_FAZ: PapelItem[] = [
  { t: "Facilita ritos e cria ambiente seguro", d: "Habilitador do time. Não é secretário, não é cobrador." },
  { t: "Entrega diagnósticos proativos", d: "PRINCIPAL COBRANÇA: medir, analisar, identificar e agir ANTES de alguém cobrar." },
  { t: "Coleta e analisa métricas", d: "Lead time, throughput, previsibilidade. Jira + artefatos padronizados." },
  { t: "Atua com o cone da incerteza", d: "Dados pro PO tomar decisões de release. Ferramenta de DECISÃO." },
  { t: "Remove impedimentos", d: "Identifica bloqueios e age. Se é de outro nível, escala." },
  { t: "Agente de mudança", d: "Propõe experimentos, questiona processos. Mais solução, menos problema." },
  { t: "Usa artefatos existentes", d: "PDTI, Jira, DoR, DoD. Não inventa processos paralelos." },
];

export const PAPEL_NAOFAZ: PapelItem[] = [
  { t: "NÃO determina o que entregar", d: "Backlog e priorização são do PO." },
  { t: "NÃO gerencia pessoas", d: "Não faz avaliação individual." },
  { t: "NÃO centraliza decisões técnicas", d: "Respeita expertise do time e TL." },
  { t: "NÃO cobra entregas", d: "SM cuida do fluxo, não do output." },
  { t: "NÃO agenda Review e Homol", d: "Isso é do PO. SM facilita, não puxa." },
  { t: "NÃO cobre gaps de PM ou TL", d: "Foca no seu papel primeiro." },
];

export const ANTIPADROES: PapelItem[] = [
  { t: "Review chamando Gestor de TI", d: "Review é para NEGÓCIO." },
  { t: "Cone como mural de status", d: "Cone é pra tratar demandas em risco." },
  { t: "WIP alto — começa e não termina", d: "1 de cada vez quando possível." },
  { t: "Visibilidade com desespero", d: "Escalar COM hipótese de solução." },
  { t: "Cobrir gaps de outros papéis", d: "Foco no arroz e feijão." },
  { t: "PDTI centralizado em outra pessoa", d: "SM é o responsável." },
];

export const TRIADE: PapelItem[] = [
  { t: "TL + PO + SM = núcleo de decisão", d: "Se falar diariamente, decidir juntos." },
  { t: "SM facilita, PO prioriza, TL decide técnico", d: "Cada um na sua faixa." },
  { t: "Review e Homol são do PO", d: "SM apoia, não substitui." },
  { t: "SM alimenta com dados", d: "Métricas, cone, vazão → decisões melhores." },
];
