// components/common/page-header.tsx
import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode; // Para botones como "Añadir Nuevo"
}

export function PageHeader({
  title,
  description,
  actionButton,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actionButton && (
        <div className="flex items-center space-x-2">{actionButton}</div>
      )}
    </div>
  );
}
