

## Diagnóstico do Freeze

O `onSnapshot` do Firestore dispara snapshots (cached + server), cada um atualizando `reports` state no `useReports` → WoW re-renderiza → cria novas referências de `submitReport`/`deleteReport` → passa para HojeTab → cascata de re-renders pesados.

## Correções

### 1. Estabilizar referências no `useReports.ts`
- Usar `useCallback` para `submitReport` e `deleteReport` para que as referências não mudem entre renders

### 2. Memoizar HojeTab
- Envolver `HojeTab` com `React.memo` para evitar re-renders quando as props não mudaram de valor real

### 3. Memoizar outros tabs
- Aplicar `React.memo` em `FrameworkTab`, `CadenciasTab`, `PapelTab`, `PadroesTab` também

### 4. Estabilizar props no WoW
- Usar `useCallback` para as funções `setTab` e `setExp` passadas como props (se necessário)
- Considerar memoizar `reports` array com referência estável quando o conteúdo não muda

## Arquivos modificados
- `src/hooks/useReports.ts` — useCallback em submitReport e deleteReport
- `src/components/tabs/HojeTab.tsx` — React.memo
- `src/components/tabs/FrameworkTab.tsx` — React.memo
- `src/components/tabs/CadenciasTab.tsx` — React.memo
- `src/components/tabs/PapelTab.tsx` — React.memo
- `src/components/tabs/PadroesTab.tsx` — React.memo

