import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import MaskedInput from "react-text-mask";
import createAutoCorrectedDateMask from 'text-mask-addons/dist/createAutoCorrectedDateMask';

// Máscara de telefone brasileira (10 ou 11 dígitos: (99) 99999-9999 ou (99) 9999-9999)
const phoneMask = [
  '(', /\d/, /\d/, ')', ' ',
  /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/
];

const formSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  phone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof formSchema>;

const RegisterForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    // Remove a máscara do telefone antes de enviar
    const rawPhone = data.phone ? data.phone.replace(/\D/g, '') : undefined;

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          phone: rawPhone,
        },
      },
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Cadastro realizado com sucesso! Verifique seu email para confirmar.");
      // O AuthProvider lida com o redirecionamento após a confirmação.
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Endereço de Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Seu email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Crie uma Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Sua senha"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Número de Telefone (Opcional)</Label>
        <MaskedInput
          mask={phoneMask}
          id="phone"
          placeholder="Ex: (99) 99999-9999"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...form.register("phone")}
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Cadastrando..." : "Cadastrar"}
      </Button>
    </form>
  );
};

export default RegisterForm;