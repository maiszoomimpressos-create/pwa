import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconCard } from "@/hooks/useIconCards";
import ShareCardForm from "./ShareCardForm";

interface ShareIconCardDialogProps {
  card: IconCard;
  children: React.ReactNode;
  onShared: () => void;
}

const ShareIconCardDialog: React.FC<ShareIconCardDialogProps> = ({ card, children, onShared }) => {
  const [open, setOpen] = useState(false);

  const handleShared = () => {
    onShared();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Compartilhar Card: {card.name || card.icon_name}</DialogTitle>
          <DialogDescription>
            Insira o email do usuário com quem você deseja compartilhar este item.
          </DialogDescription>
        </DialogHeader>
        <ShareCardForm card={card} onShared={handleShared} />
      </DialogContent>
    </Dialog>
  );
};

export default ShareIconCardDialog;