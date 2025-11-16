import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Cadastrar</CardTitle>
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
            view="sign_up"
            redirectTo={window.location.origin + "/dashboard"}
            localization={{
              variables: {
                sign_up: {
                  email_label: "Endereço de Email",
                  password_label: "Crie uma Senha",
                  email_input_placeholder: "Seu email",
                  password_input_placeholder: "Sua senha",
                  button_label: "Cadastrar",
                  link_text: "Não tem uma conta? Cadastre-se",
                },
                sign_in: {
                  link_text: "Já tem uma conta? Entrar",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;