import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { IconCard } from "@/hooks/useIconCards";

interface ShareCardFormProps {
  card: IconCard;
  onShared: () => void;
}

const formSchema = z.object({
  email: z.string().email("Email inválido.").min(1, "O email é obrigatório."),
});

type ShareFormValues = z.infer<typeof formSchema>;

// URLs das Edge Functions (usando o ID do projeto Supabase)
const GET_USER_ID_URL = "https://rqwshksgnnzcdfiensjc.supabase.co/functions/v1/get-user-id-by-email";
const CREATE_NOTIFICATION_URL = "https://rqwshksgnnzcdfiensjc.supabase.co/functions/v1/create-notification";

const ShareCardForm: React.FC<ShareCardFormProps> = ({ card, onShared }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ShareFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ShareFormValues) => {
    setIsLoading(true);

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      showError("Você precisa estar logado para compartilhar.");
      setIsLoading(false);
      return;
    }
    
    const targetEmail = data.email.trim().toLowerCase();

    if (targetEmail === currentUser.email?.toLowerCase()) {
      showError("Você não pode compartilhar um item consigo mesmo.");
      setIsLoading(false);
      return;
    }

    try {
      const session = (await supabase.auth.getSession()).data.session;
      
      if (!session) {
        throw new Error("Sessão não encontrada. Por favor, faça login novamente.");
      }
      
      const token = session.access_token;

      // 1. Chamar a Edge Function para buscar o ID do usuário pelo email
      const userResponse = await fetch(GET_USER_ID_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({ error: 'Erro desconhecido ao buscar usuário.' }));
        if (userResponse.status === 404) {
          throw new Error("Usuário com este email não encontrado.");
        }
        throw new Error(errorData.error || `Erro ao buscar usuário (Status: ${userResponse.status}).`);
      }

      const { user_id: sharedWithUserId } = await userResponse.json();
      
      if (!sharedWithUserId) {
        throw new Error("ID do usuário destinatário não retornado pela função.");
      }

      // 2. Inserir o registro de compartilhamento no banco de dados
      const { error: insertError } = await supabase.from("icon_card_shares").insert({
        card_id: card.id,
        shared_with_user_id: sharedWithUserId,
        shared_by_user_id: currentUser.id,
      });

      if (insertError) {
        if (insertError.code === '23505') { // Código de violação de UNIQUE constraint
          showError("Este card já foi compartilhado com este usuário.");
          return; // Sai sem tentar criar notificação
        } else {
          throw new Error("Erro ao registrar o compartilhamento: " + insertError.message);
        }
      }
      
      // 3. Chamar a Edge Function para criar a notificação (Substitui o Trigger)
      const notificationResponse = await fetch(CREATE_NOTIFICATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Reutiliza o token do usuário
        },
        body: JSON.stringify({
          card_id: card.id,
          card_name: card.name,
          shared_with_user_id: sharedWithUserId,
          shared_by_user_id: currentUser.id,
        }),
      });
      
      if (!notificationResponse.ok) {
        // Logamos o erro, mas não impedimos o sucesso do compartilhamento principal
        console.error("Falha ao criar notificação via Edge Function:", await notificationResponse.json().catch(() => 'Unknown error'));
      }

      showSuccess(`Card compartilhado com sucesso com ${targetEmail}!`);
      form.reset();
      onShared();

    } catch (error) {
      console.error("Erro de compartilhamento:", error);
      showError(error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao compartilhar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email do Destinatário</Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@exemplo.com"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading || !form.formState.isValid}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <>
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </>
        )}
      </Button>
    </form>
  );
};

export default ShareCardForm;