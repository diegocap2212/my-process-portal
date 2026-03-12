

## Diagnóstico

Identifiquei **dois problemas** no portal:

### 1. Inputs travando / perdendo foco ao digitar
Este é o bug principal. As abas (`Framework`, `Hoje`, `Cadencias`, `Papel`, `Padroes`) estão definidas como **componentes arrow function dentro do `WoW`**. A cada keystroke, o React recria essas funções, trata como componentes novos, desmonta e remonta tudo — os inputs perdem o foco imediatamente.

### 2. Firebase 403 (PERMISSION_DENIED)
As requisições ao Firestore estão retornando `PERMISSION_DENIED` com `projects/SEU_PROJETO`. Isso indica que o build anterior (com placeholder) pode estar em cache, ou as regras de segurança do Firestore não permitem leitura/escrita. Precisa verificar as regras no console Firebase.

---

## Plano de Correção

### Tarefa 1 — Corrigir perda de foco nos inputs
Converter `Framework`, `Hoje`, `Cadencias`, `Papel`, `Padroes` de componentes internos para **JSX inline** (variáveis que retornam JSX, não componentes React). Em vez de `<Hoje />`, usar `{hojeContent}` diretamente.

Mudança no padrão:
```text
ANTES:  const Hoje = () => (<div>...</div>);
        {tab === "hoje" && <Hoje />}

DEPOIS: const hojeContent = (<div>...</div>);
        {tab === "hoje" && hojeContent}
```

Isso evita que React trate como componente novo a cada render.

### Tarefa 2 — Remover warning de ref no CK
O componente `CK` está definido como function component dentro do render. Mantê-lo como função helper mas garantir que não receba refs.

### Tarefa 3 — Verificar Firebase
O arquivo `firebase.ts` já tem as credenciais corretas (`torre-lm`). Se o erro persistir após o rebuild, orientar o usuário a verificar as **Firestore Security Rules** no console Firebase para permitir leitura/escrita na collection `reports`.

---

## Arquivos modificados
- `src/components/WoW.tsx` — converter 5 componentes internos para JSX inline

