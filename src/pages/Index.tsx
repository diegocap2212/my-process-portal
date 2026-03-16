import { useAuth } from "@/hooks/useAuth";
import LoginScreen from "@/components/auth/LoginScreen";
import WoW from "@/components/WoW";

const Index = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1729", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  return <WoW user={user} onSignOut={signOut} />;
};

export default Index;
