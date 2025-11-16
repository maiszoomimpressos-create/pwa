import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
                  link_text: "Já tem uma conta? Entrar",
                },
                forgotten_password: {
                  link_text: "Esqueceu sua senha?",
                },
                sign_up: {
                  link_text: "Não tem uma conta? Cadastre-se",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;