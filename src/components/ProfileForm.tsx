import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import MaskedInput from "react-text-mask";

// Máscara de telefone brasileira (10 ou 11 dígitos: (99) 99999-9999 ou (99) 9999-9999)
const phoneMask = [
  '(', /\d/, /\d/, ')', ' ',
  /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/
];

const formSchema = z.object({
  first_name: z.string().max(50, "Máximo de 50 caracteres.").optional(),
  last_name: z.string().max(50, "Máximo de 50 caracteres.").optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

const ProfileForm: React.FC = () => {
  const { profile, isLoading, isUpdating, updateProfile } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    values: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Remove a máscara do telefone antes de enviar
    const rawPhone = data.phone ? data.phone.replace(/\D/g, '') : null;
    
    updateProfile({
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      phone: rawPhone,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Primeiro Nome</Label>
          <Input
            id="first_name"
            type="text"
            placeholder="Seu primeiro nome"
            {...form.register("first_name")}
          />
          {form.formState.errors.first_name && (
            <p className="text-sm text-destructive">{form.formState.errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Sobrenome</Label>
          <Input
            id="last_name"
            type="text"
            placeholder="Seu sobrenome"
            {...form.register("last_name")}
          />
          {form.formState.errors.last_name && (
            <p className="text-sm text-destructive">{form.formState.errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Número de Telefone</Label>
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
      
      <Button type="submit" className="w-full" disabled={isUpdating}>
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
          </>
        ) : (
          "Salvar Alterações"
        )}
      </Button>
    </form>
  );
};

export default ProfileForm;