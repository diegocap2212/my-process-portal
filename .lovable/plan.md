

## Problema

Dois problemas identificados:

1. **Variáveis de ambiente não configuradas no Lovable** — as requests mostram `projects/undefined`, ou seja, `VITE_FIREBASE_PROJECT_ID` está `undefined`. O Firebase não consegue conectar e o `submitReport` nunca resolve (ou falha silenciosamente), deixando o botão preso em "Salvando...".

2. **O botão fica travado em "Salvando..."** — se o Firebase falhar, o `catch` no `useReports` retorna `false`, mas o fluxo funciona. O problema real é que com `projectId: undefined`, o Firebase entra em retry infinito sem lançar erro.

## Plano

### 1. Restaurar valores hardcoded com fallback para env vars (`src/firebase.ts`)
Usar os valores originais como fallback para que funcione tanto no Lovable (sem env vars) quanto na Vercel (com env vars):

```ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyClC8dBIf10iktFmMtgmJQHQDzGkHvCLh8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "torre-lm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "torre-lm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "torre-lm.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "286848825985",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:286848825985:web:b1cf31b41bef4130442b80",
};
```

### 2. Adicionar timeout no submit (`src/hooks/useReports.ts`)
Adicionar um timeout de 15s no `submitReport` para que, se o Firebase não responder, o botão destrave e mostre erro:

```ts
const submitReport = useCallback(async (input: ReportInput): Promise<boolean> => {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );
    await Promise.race([
      addDoc(collection(db, "reports"), { ...input, /* trimming */ createdAt: serverTimestamp() }),
      timeout,
    ]);
    toast.success("Report salvo com sucesso!");
    return true;
  } catch (e) {
    console.error("Submit error:", e);
    toast.error("Erro ao salvar report. Verifique sua conexão.");
    return false;
  }
}, []);
```

Isso resolve ambos os problemas: o Firebase funciona no preview do Lovable e o botão nunca fica preso indefinidamente.

