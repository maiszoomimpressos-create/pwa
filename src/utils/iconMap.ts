import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";
import React from "react";

// Cria um mapa de ícones válidos (nome -> componente)
export const LucideIconMap: Record<string, React.FC<LucideProps>> = Object.entries(LucideIcons)
  .filter(([, component]) => typeof component === 'function')
  .filter(([name]) => name !== 'createReactComponent' && name !== 'Icon' && name !== 'default')
  .reduce((acc, [name, component]) => {
    acc[name] = component as React.FC<LucideProps>;
    return acc;
  }, {} as Record<string, React.FC<LucideProps>>);