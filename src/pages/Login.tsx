import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(var(--primary))",
                    brandAccent: "hsl(var(--primary-foreground))",
                  },
                },
              },
            }}
            theme="light"
            view="sign_in"
            redirectTo={window.location.origin + "/dashboard"}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Endereço de Email",
                  password_label: "Sua Senha",
                  email_input_placeholder: "Seu email",
                  password_input_placeholder: "Sua senha",
                  button_label: "Entrar",
                  link_text: "Já tem uma conta? Entrar", // Este link não será visível na view sign_in
                },
                forgotten_password: {
                  link_text: "Esqueceu sua senha?",
                },
                // Removemos a seção sign_up para evitar conflito com a navegação manual
              },
            }}
          />
          <div className="mt-4 text-center space-y-2">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary underline block">
              Esqueceu sua senha?
            </Link>
            <Link to="/register" className="text-sm text-primary hover:underline block">
              Não tem uma conta? Cadastre-se
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary underline block">
              Voltar ao Início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;