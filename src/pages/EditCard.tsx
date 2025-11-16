import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IconCard } from "@/hooks/useIconCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import CardEditForm from "@/components/CardEditForm";
import { Button } from "@/components/ui/button";

const fetchCardById = async (cardId: string): Promise<IconCard> => {
  // Nota: O RLS garante que o usuário só pode buscar cards que ele possui ou que foram compartilhados com ele.
  const { data, error } = await supabase
    .from("icon_cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const EditCardPage: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();

  const { data: card, isLoading, error } = useQuery<IconCard, Error>({
    queryKey: ["iconCard", cardId],
    queryFn: () => fetchCardById(cardId!),
    enabled: !!cardId,
  });

  const handleUpdateSuccess = () => {
    // Após o sucesso, redireciona de volta para o dashboard
    navigate("/dashboard");
  };

  if (!cardId) {
    return <div className="text-center text-destructive">ID do Card não fornecido.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive">Erro ao carregar o card: {error.message}</div>;
  }
  
  if (!card) {
    return <div className="text-center text-muted-foreground">Card não encontrado ou acesso negado.</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Card: {card.name || card.icon_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardEditForm card={card} onUpdateSuccess={handleUpdateSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCardPage;