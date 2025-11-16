import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ForgotPassword = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
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
            view="forgotten_password"
            localization={{
              variables: {
                forgotten_password: {
                  email_label: "Endereço de Email",
                  email_input_placeholder: "Seu email",
                  button_label: "Enviar instruções de recuperação",
                  link_text: "Esqueceu sua senha?",
                },
                sign_in: {
                  link_text: "Voltar para o login",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;