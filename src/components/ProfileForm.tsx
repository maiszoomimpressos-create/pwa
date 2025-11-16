import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useProfile, Profile } from "@/hooks/useProfile";

const formSchema = z.object({
  first_name: z.string().min(1, "Nome é obrigatório.").max(50).optional(),
  last_name: z.string().min(1, "Sobrenome é obrigatório.").max(50).optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

const ProfileForm: React.FC = () => {
  const { profile, isLoading, isUpdating, updateProfile } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    values: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    if (!profile) return;

    updateProfile(
      {
        id: profile.id,
        first_name: data.first_name,
        last_name: data.last_name,
        // Removemos o campo phone
      },
      {
        onSuccess: () => {
          showSuccess("Perfil atualizado com sucesso!");
        },
        onError: (error) => {
          showError("Erro ao atualizar perfil: " + error.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
      <div className="space-y-2">
        <Label htmlFor="first_name">Nome</Label>
        <Input
          id="first_name"
          type="text"
          placeholder="Seu nome"
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

      <Button type="submit" className="w-full" disabled={isUpdating || !form.formState.isDirty}>
        {isUpdating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Salvar Alterações"
        )}
      </Button>
    </form>
  );
};

export default ProfileForm;