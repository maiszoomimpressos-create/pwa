import React from "react";
import Header from "./Header";
import { MadeWithDyad } from "./made-with-dyad";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8 pt-16 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default AppLayout;