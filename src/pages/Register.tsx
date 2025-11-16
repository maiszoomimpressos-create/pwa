import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import RegisterForm from "@/components/RegisterForm";
import { Button } from "@/components/ui/button";

const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Cadastrar</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          
          <div className="mt-4 text-center space-y-2">
            <Link to="/login" className="text-sm text-primary hover:underline block">
              Já tem uma conta? Entrar
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

export default Register;