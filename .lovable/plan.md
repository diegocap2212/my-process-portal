

## Migrar Firebase config para variáveis de ambiente

O `firebase.ts` atual tem as credenciais hardcoded. Para funcionar na Vercel, precisa usar `import.meta.env`.

### Alteração

**`src/firebase.ts`** — trocar valores hardcoded por variáveis de ambiente:
```ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

### Na Vercel

Adicione estas variáveis em **Settings → Environment Variables**:

| Nome | Valor |
|------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyClC8dBIf10iktFmMtgmJQHQDzGkHvCLh8` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `torre-lm.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `torre-lm` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `torre-lm.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `286848825985` |
| `VITE_FIREBASE_APP_ID` | `1:286848825985:web:b1cf31b41bef4130442b80` |

Nota: chaves Firebase são **públicas** (publishable keys), então não há problema de segurança em tê-las no código — mas usar env vars é boa prática para gerenciar múltiplos ambientes.

