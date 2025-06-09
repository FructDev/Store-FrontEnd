// app/(dashboard)/users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { User } from "@/stores/auth.store"; // Usamos el tipo User del auth.store
import { CreateUserDialog } from "@/components/users/create-user-dialog"; // Importamos el diálogo
import { EditUserDialog } from "@/components/users/edit-user-dialog"; // Importamos el diálogo de edición
import { DataTablePagination } from "@/components/common/data-table-pagination"; // Componente de paginación

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"; // Para búsqueda
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Para filtros
import { Loader2, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/use-debounce"; // Hook simple para debounce (crear este hook)
import { Card, CardContent } from "@/components/ui/card";

interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Roles que se pueden asignar (para el filtro)
const assignableRoles = [
  { value: "SALESPERSON", label: "Vendedor" },
  { value: "TECHNICIAN", label: "Técnico" },
  // No incluimos STORE_ADMIN porque usualmente no se asigna así
];

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIsActive, setFilterIsActive] = useState<string>("all"); // "all", "true", "false"
  const [filterRoleName, setFilterRoleName] = useState<string>("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Hook de debounce

  const queryClient = useQueryClient();

  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(
    null
  );

  const [isConfirmStatusDialogOpen, setIsConfirmStatusDialogOpen] =
    useState(false);
  const [userForStatusChange, setUserForStatusChange] = useState<User | null>(
    null
  );

  const {
    data: paginatedUsers,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedUsersResponse, Error>({
    queryKey: [
      "storeUsers",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
      filterIsActive,
      filterRoleName,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: limitPerPage,
        sortBy: "createdAt", // Opcional: hacer configurable
        sortOrder: "desc", // Opcional: hacer configurable
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterIsActive !== "all") params.isActive = filterIsActive === "true";
      if (filterRoleName !== "all") params.roleName = filterRoleName;

      const response = await apiClient.get("/users", { params });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  // Mutación para activar/desactivar usuario
  const updateUserStatusMutation = useMutation<
    User,
    Error,
    { userId: string; isActive: boolean }
  >({
    mutationFn: ({ userId, isActive }) =>
      apiClient.patch(`/users/${userId}`, { isActive }),
    onSuccess: (updatedUser) => {
      toast.success(`Estado del usuario ${updatedUser.firstName} actualizado.`);
      queryClient.invalidateQueries({ queryKey: ["storeUsers"] });
      setIsConfirmStatusDialogOpen(false);
      setUserForStatusChange(null);
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "Error al actualizar estado del usuario.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
      setIsConfirmStatusDialogOpen(false);
      setUserForStatusChange(null);
    },
  });

  const handleOpenEditDialog = (user: User) => {
    setSelectedUserForEdit(user);
    setIsEditUserDialogOpen(true);
  };

  const handleOpenConfirmStatusDialog = (user: User) => {
    setUserForStatusChange(user);
    setIsConfirmStatusDialogOpen(true);
  };

  const confirmUserStatusChange = () => {
    if (userForStatusChange) {
      updateUserStatusMutation.mutate({
        userId: userForStatusChange.id,
        isActive: !userForStatusChange.isActive,
      });
    }
  };

  // Funciones de Paginación
  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedUsers && currentPage < paginatedUsers.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Resetear página a 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterIsActive, filterRoleName]);

  return (
    <>
      <PageHeader
        title="Gestión de Usuarios"
        description="Añade, edita y gestiona los usuarios de tu tienda."
        actionButton={<CreateUserDialog />}
      />

      {/* Controles de Filtro */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Buscar por nombre, apellido, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-1"
        />
        <Select value={filterIsActive} onValueChange={setFilterIsActive}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            <SelectItem value="true">Activo</SelectItem>
            <SelectItem value="false">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRoleName} onValueChange={setFilterRoleName}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Roles</SelectItem>
            {assignableRoles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-16 mx-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-red-500 py-10"
                  >
                    Error cargando usuarios: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedUsers?.data?.length ? (
                paginatedUsers.data.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell>
                      {userItem.firstName} {userItem.lastName}
                    </TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      {userItem.roles?.map(
                        (
                          roleObj // Ahora 'roleObj' es { id: string, name: string }
                        ) => (
                          <Badge
                            key={roleObj.id}
                            variant="outline"
                            className="mr-1 capitalize"
                          >
                            {roleObj.name.toLowerCase().replace("_", " ")}{" "}
                            {/* Acceder a roleObj.name y formatear */}
                          </Badge>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={userItem.isActive ? "default" : "destructive"}
                        className={
                          userItem.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300"
                            : ""
                        }
                      >
                        {userItem.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditDialog(userItem)}
                          >
                            Editar Usuario
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleOpenConfirmStatusDialog(userItem)
                            }
                            className={
                              userItem.isActive
                                ? "text-red-500 focus:text-red-600"
                                : "text-green-600 focus:text-green-700"
                            }
                          >
                            {userItem.isActive ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedUsers && paginatedUsers.totalPages > 0 && (
        <DataTablePagination
          page={paginatedUsers.page}
          totalPages={paginatedUsers.totalPages}
          totalRecords={paginatedUsers.total}
          limit={paginatedUsers.limit}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          isFetching={isFetching}
        />
      )}

      {/* Diálogo de Edición */}
      <EditUserDialog
        user={selectedUserForEdit}
        isOpen={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      />

      {/* Diálogo de Confirmación para Activar/Desactivar */}
      {userForStatusChange && (
        <AlertDialog
          open={isConfirmStatusDialogOpen}
          onOpenChange={setIsConfirmStatusDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás seguro de que quieres{" "}
                {userForStatusChange.isActive ? "desactivar" : "activar"} a{" "}
                {userForStatusChange.firstName} {userForStatusChange.lastName}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {userForStatusChange.isActive
                  ? "El usuario ya no podrá acceder al sistema."
                  : "El usuario recuperará el acceso al sistema."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserForStatusChange(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmUserStatusChange}
                disabled={updateUserStatusMutation.isPending}
                className={
                  userForStatusChange.isActive
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-green-600 hover:bg-green-700"
                }
              >
                {updateUserStatusMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {userForStatusChange.isActive
                  ? "Sí, Desactivar"
                  : "Sí, Activar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
