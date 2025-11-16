import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./client";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Redirecionamento inicial baseado na sessão
        if (session && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/')) {
            navigate("/dashboard", { replace: true });
        } else if (!session && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/forgot-password') {
            // Se não estiver logado e não estiver em uma página de auth, redireciona para login
            // Isso é redundante com ProtectedRoute, mas garante a segurança.
            // Não fazemos o redirecionamento aqui para evitar loops, ProtectedRoute lida com isso.
        }
      }
    });

    // 2. Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);

          if (event === "SIGNED_IN") {
            // Redirecionar usuários autenticados para o Dashboard
            navigate("/dashboard", { replace: true });
          } else if (event === "SIGNED_OUT") {
            // Redirecionar usuários desautenticados para o Login
            navigate("/login", { replace: true });
          }
        }
      },
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]); // Adicionamos location.pathname como dependência para o redirecionamento inicial

  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};