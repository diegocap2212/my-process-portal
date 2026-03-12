

## Diagnóstico Arquitetural Completo

Analisei todo o codebase. Aqui estao os problemas estruturais que precisam ser resolvidos de uma vez para nao precisar mais de "puxadinhos":

---

### Problema 1: Arquivo monolito (591 linhas)
`WoW.tsx` contém TUDO: dados estáticos, lógica de form, Firebase, helpers, estilos, rendering de 5 abas. Qualquer mudanca futura exige mexer num arquivo gigante.

**Solucao**: Separar em modulos claros:

```text
src/
  data/
    cadencias.ts        # CAD_SM, CAD_SDM
    papeis.ts           # PAPEL_FAZ, PAPEL_NAOFAZ, ANTIPADROES, TRIADE
    padroes.ts          # DOR, DOD, METRICAS_OBR
    squads.ts           # SM_SQUADS, SM_NAMES, smC
    links.ts            # LINKS
  hooks/
    useReports.ts       # Firebase listener + CRUD (addDoc, deleteDoc, onSnapshot)
  components/
    layout/
      Navbar.tsx        # Barra superior sticky
    tabs/
      FrameworkTab.tsx   # SVG ciclo de cadencia
      HojeTab.tsx       # Aba "Hoje" com form + historico
      CadenciasTab.tsx  # Lista de cadencias
      PapelTab.tsx      # Papel & regras
      PadroesTab.tsx    # DoR, DoD, metricas, protecao
    report/
      ReportForm.tsx    # Formulario de report (checkpoints + contexto + imagens)
      ReportHistory.tsx # Lista de reports com filtros
      Checkpoint.tsx    # Componente CK (ja esta fora, mas merece arquivo proprio)
    shared/
      CadenciaCard.tsx  # renderCad extraido
      ItemList.tsx      # renderItems extraido
  styles/
    constants.ts        # L, S, M, I, SEL (estilos reutilizaveis)
    helpers.ts          # compress()
  firebase.ts           # (ja existe, manter)
```

---

### Problema 2: Imagens salvas como base64 no Firestore
Imagens comprimidas sao salvas como strings base64 dentro do documento Firestore. Cada documento tem limite de 1MB. Com 2 imagens, o documento pode estourar rapidamente, e o Firestore cobra por leitura de documento (quanto maior, mais lento e caro).

**Solucao**: Usar **Firebase Storage** para imagens. Salvar apenas a URL no documento Firestore. Isso:
- Remove o limite pratico de tamanho
- Reduz custo de leitura do Firestore
- Permite imagens em resolucao maior no futuro

Mudanca no fluxo:
```text
ANTES:  compress → base64 → salvar no doc Firestore
DEPOIS: compress → upload Storage → pegar URL → salvar URL no doc
```

Requer adicionar `getStorage`, `ref`, `uploadString`, `getDownloadURL` do `firebase/storage`.

---

### Problema 3: Inline styles em tudo (590+ linhas de style={})
Sem classes CSS, sem Tailwind. Cada mudanca visual exige encontrar o style inline correto. Impossivel fazer temas, responsividade adequada, ou hover states reais.

**Solucao**: Migrar para Tailwind (ja esta instalado no projeto). Os estilos inline serao convertidos para classes utilitarias. Isso permite responsividade real, dark mode, e manutenibilidade.

---

### Problema 4: Sem tipagem nos dados do Firebase
`reports` usa `any[]`. Nenhuma validacao no que entra ou sai.

**Solucao**: Criar interface `Report` com todos os campos tipados. Usar no hook e nos componentes.

```typescript
interface Report {
  id: string;
  sm: string;
  squad: string;
  date: string;
  cone: boolean | null;
  coneText: string;
  // ... etc
  images: { url: string }[];
  createdAt: Timestamp;
}
```

---

### Problema 5: Sem tratamento de erro no Firebase
`onSnapshot` nao trata erro de conexao. Se o Firestore negar acesso (403), o usuario nao ve nada. `submit` mostra `alert()` generico.

**Solucao**: Adicionar error handling com toast notifications (Sonner ja esta instalado). Mostrar estado de erro na UI.

---

## Plano de Execucao (ordem)

1. **Criar tipos e dados** - `types/report.ts`, mover dados estaticos para `data/`
2. **Criar hook `useReports`** - Extrair toda logica Firebase (listener, submit, delete, error handling) com tipagem
3. **Extrair componentes compartilhados** - `Checkpoint.tsx`, `CadenciaCard.tsx`, `ItemList.tsx`, `styles/constants.ts`
4. **Criar componentes de tab** - `FrameworkTab`, `HojeTab` (com `ReportForm` + `ReportHistory`), `CadenciasTab`, `PapelTab`, `PadroesTab`
5. **Criar layout** - `Navbar.tsx` + `WoW.tsx` simplificado (so routing entre tabs)
6. **Migrar imagens para Firebase Storage** - Upload para Storage, salvar URL no Firestore
7. **Converter inline styles para Tailwind** - Em cada componente novo ja usar Tailwind

## Arquivos criados/modificados

~20 arquivos novos, `WoW.tsx` reduzido a ~50 linhas (orquestrador de tabs).

