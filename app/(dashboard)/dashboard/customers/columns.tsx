// app/(dashboard)/customers/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types/customer.types"; // Tu tipo de cliente para el frontend
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

// La función que se pasará a la columna de acciones para abrir el diálogo de edición/eliminación
// La definiremos aquí y la pasaremos a través de meta
export type CustomerActions = {
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fullName = `${row.original.firstName || ""} ${
        row.original.lastName || ""
      }`.trim();
      return <div className="font-medium">{fullName || "N/A"}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Correo Electrónico",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "rnc",
    header: "RNC/Cédula",
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? "success" : "destructive"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de Registro",
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("createdAt"))}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const customer = row.original;
      const { onEdit, onDelete } = (
        table.options.meta as { actions: CustomerActions }
      ).actions;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(customer.id)}
            >
              Copiar ID Cliente
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(customer)}>
              Editar Cliente
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(customer)}
            >
              {customer.isActive ? "Desactivar Cliente" : "Activar Cliente"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
