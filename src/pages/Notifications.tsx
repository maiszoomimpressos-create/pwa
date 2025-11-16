import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center">
        <Bell className="mr-3 h-7 w-7" /> Central de Notificações
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Suas Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-10 text-muted-foreground">
            <p>Nenhuma notificação recente.</p>
            <p className="text-sm mt-2">Aqui você verá alertas sobre compartilhamentos e atividades importantes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;