

## Autenticação Firebase + Controle de Acesso ao Histórico

### Conceito
- Login com Firebase Auth (email/senha)
- Coleção `users` no Firestore para controlar permissões (campo `canViewHistory: boolean`)
- Aba "Hoje" visível para todos, mas o sub-tab **Histórico** só aparece para usuários autorizados
- Formulário de report continua aberto para todos logados

### Arquitetura

```text
Firebase Auth (email/senha)
       │
       ▼
Firestore: /users/{uid}
  ├─ email: string
  ├─ name: string
  └─ canViewHistory: boolean   ← controla acesso
```

### Arquivos novos

1. **`src/hooks/useAuth.ts`** — Hook com `signIn`, `signOut`, `user` state via `onAuthStateChanged`
2. **`src/hooks/useUserPermissions.ts`** — Lê doc `/users/{uid}` e retorna `{ canViewHistory }`
3. **`src/components/auth/LoginScreen.tsx`** — Tela de login simples (email + senha), estilo consistente com o app

### Arquivos modificados

4. **`src/firebase.ts`** — Exportar `getAuth(app)` além do `db`
5. **`src/App.tsx`** — Envolver com AuthProvider; rota `/` exige login
6. **`src/components/layout/Navbar.tsx`** — Botão de logout no canto direito
7. **`src/components/tabs/HojeTab.tsx`** — O sub-tab "Histórico" só renderiza se `canViewHistory === true`; caso contrário mostra mensagem "Sem permissão"

### Fluxo

1. Usuário acessa o app → vê tela de login
2. Loga com email/senha → app carrega normalmente
3. Na aba Hoje: todos veem o formulário de report
4. Sub-tab Histórico: só aparece se o doc `users/{uid}` tiver `canViewHistory: true`
5. Você cadastra os usuários no Firestore manualmente (ou criamos uma tela admin depois)

### Setup no Firebase Console
- Ativar **Authentication → Email/Password** no Firebase Console
- Criar seu usuário via Console ou via app
- Criar doc em `users/{uid}` com `canViewHistory: true` para seu usuário

