// app/(dashboard)/inventory/catalog/products/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  Product,
  PaginatedProductsResponse,
  Category,
} from "@/types/inventory.types"; // Asume que Category está en inventory.types.ts
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit3,
  Search,
  CheckSquare,
  XSquare,
  Loader2,
  Layers,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
// TODO: Importar AlertDialog para eliminar
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
import { useDebounce } from "@/hooks/use-debounce"; // Asumiendo que tienes este hook
import { ProductType as PrismaProductType } from "@/types/prisma-enums"; // Para el filtro de tipo de producto
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFormDialog } from "@/components/inventory/catalog/product-form-dialog";
import { ProductStockDetailsDialog } from "@/components/inventory/stock/product-stock-details-dialog";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Mapeo para mostrar nombres de ProductType más amigables
const productTypeLabels: Record<PrismaProductType, string> = {
  GENERAL: "General",
  NEW: "Nuevo (Serializado)", // Etiqueta más descriptiva
  USED: "Usado (Serializado)",
  REFURBISHED: "Reacondicionado (Serializado)",
  ACCESSORY: "Accesorio",
  SPARE_PART: "Repuesto",
  SERVICE: "Servicio",
  BUNDLE: "Bundle/Kit",
  OTHER: "Otro",
};

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProductType, setFilterProductType] = useState<string>("all"); // 'all' o un valor de PrismaProductType
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [filterIsActive, setFilterIsActive] = useState<string>("all"); // "all", "true", "false"

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productToAction, setProductToAction] = useState<Product | null>(null);
  const [isDeactivateActivateDialogOpen, setIsDeactivateActivateDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isStockDetailsOpen, setIsStockDetailsOpen] = useState(false);
  const [selectedProductIdForStock, setSelectedProductIdForStock] = useState<
    string | null
  >(null);

  const {
    data: paginatedProducts,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedProductsResponse, Error>({
    queryKey: [
      "inventoryProducts",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
      filterProductType,
      filterCategoryId,
      filterIsActive,
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: limitPerPage,
        sortBy: "name",
        sortOrder: "asc",
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterProductType !== "all") params.productType = filterProductType;
      if (filterCategoryId !== "all") params.categoryId = filterCategoryId;
      if (filterIsActive !== "all") params.isActive = filterIsActive === "true";

      const response = await apiClient.get("/inventory/products", { params });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  // Fetch para categorías (usado en el filtro y potencialmente en el form de producto)
  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["allCategoriesForFilter"],
    queryFn: async () => {
      const response = await apiClient.get("/inventory/categories"); // Obtener todas para el filtro
      return response.data.data || response.data; // Ajustar según la estructura de tu API
    },
  });

  // En ProductsPage
  const updateProductStatusMutation = useMutation<
    Product, // El backend devuelve el producto actualizado
    Error,
    { productId: string; isActive: boolean }
  >({
    mutationFn: ({ productId, isActive }) =>
      apiClient.patch(`/inventory/products/${productId}`, { isActive }),
    onSuccess: (updatedProduct) => {
      toast.success(
        `Producto "${updatedProduct.name}" ha sido ${
          updatedProduct.isActive ? "activado" : "desactivado"
        }.`
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryProducts"] });
      setIsDeactivateActivateDialogOpen(false);
      setProductToAction(null);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al actualizar el estado del cliente."
      );
      toast.error(errorMessage || "Error al actualizar estado del producto.");
      setIsDeactivateActivateDialogOpen(false);
      setProductToAction(null);
    },
  });

  // En ProductsPage
  const deleteProductMutation = useMutation<void, Error, string>({
    mutationFn: (productId: string) =>
      apiClient.delete(`/inventory/products/${productId}`), // Backend hace soft delete
    onSuccess: () => {
      toast.success(
        `Producto "${
          productToAction?.name || ""
        }" marcado como inactivo (eliminado).`
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryProducts"] });
      setIsDeleteDialogOpen(false);
      setProductToAction(null);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al actualizar el estado del cliente."
      );
      toast.error(errorMessage);
      setIsDeleteDialogOpen(false);
      setProductToAction(null);
    },
  });

  const handleOpenCreateDialog = () => {
    console.log("Open Dialog");
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleOpenDeactivateActivateDialog = (product: Product) => {
    setProductToAction(product);
    setIsDeactivateActivateDialogOpen(true);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setProductToAction(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmProductStatusChange = () => {
    if (productToAction) {
      updateProductStatusMutation.mutate({
        productId: productToAction.id,
        isActive: !productToAction.isActive, // Invertir estado actual
      });
    }
  };

  const confirmDeleteProduct = () => {
    if (productToAction) {
      deleteProductMutation.mutate(productToAction.id);
    }
  };

  const handleOpenStockDetails = (productId: string) => {
    setSelectedProductIdForStock(productId);
    setIsStockDetailsOpen(true);
  };

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedProducts && currentPage < paginatedProducts.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    filterProductType,
    filterCategoryId,
    filterIsActive,
  ]);

  // Función para formatear moneda (si la necesitas para precios)
  const formatCurrency = (
    amount: string | number | null | undefined,
    currencySymbol = "RD$"
  ) => {
    if (amount === null || amount === undefined) return "-";
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return `${currencySymbol} ${numericAmount.toFixed(2)}`;
  };

  return (
    <>
      <PageHeader
        title="Catálogo de Productos"
        description="Gestiona todos los productos, servicios y repuestos de tu tienda."
        actionButton={
          <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto
          </Button>
        }
      />

      {/* Controles de Filtro */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterProductType}
              onValueChange={setFilterProductType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                {Object.entries(productTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterCategoryId}
              onValueChange={setFilterCategoryId}
              disabled={isLoadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {isLoadingCategories && (
                  <SelectItem value="loading" disabled>
                    Cargando...
                  </SelectItem>
                )}
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterIsActive} onValueChange={setFilterIsActive}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos (Activo/Inactivo)</SelectItem>
                <SelectItem value="true">Solo Activos</SelectItem>
                <SelectItem value="false">Solo Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Nombre</TableHead>
                <TableHead className="w-[15%]">SKU</TableHead>
                <TableHead className="w-[15%]">Tipo</TableHead>
                <TableHead className="w-[10%] text-right">
                  Precio Venta
                </TableHead>
                <TableHead className="w-[10%] text-right">Costo</TableHead>
                <TableHead className="w-[10%] text-center">
                  Serializado
                </TableHead>
                <TableHead className="w-[10%] text-center">Activo</TableHead>
                <TableHead className="w-[5%] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && !paginatedProducts?.data) ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-prod-${i}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
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
                    colSpan={8}
                    className="text-center text-red-500 py-10"
                  >
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedProducts?.data?.length ? (
                paginatedProducts.data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.sku || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {productTypeLabels[
                          product.productType as PrismaProductType
                        ] || product.productType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.sellingPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.costPrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.tracksImei ? (
                        <CheckSquare className="h-5 w-5 text-blue-600 mx-auto" />
                      ) : (
                        <XSquare className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={product.isActive ? "default" : "destructive"}
                        className={
                          product.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:text-green-300 dark:bg-green-700/30"
                            : ""
                        }
                      >
                        {product.isActive ? "Sí" : "No"}
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
                            onClick={() => handleOpenStockDetails(product.id)}
                          >
                            <Layers className="mr-2 h-4 w-4" /> Ver Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditDialog(product)}
                          >
                            {" "}
                            {/* handleOpenEditDialog ya lo tienes */}
                            <Edit3 className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOpenDeactivateActivateDialog(product)
                            } // <-- NUEVA LLAMADA
                            className={
                              product.isActive
                                ? "text-yellow-600 focus:text-yellow-700"
                                : "text-green-600 focus:text-green-700"
                            }
                          >
                            {product.isActive ? (
                              <XSquare className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckSquare className="mr-2 h-4 w-4" />
                            )}
                            {product.isActive ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenDeleteDialog(product)} // <-- NUEVA LLAMADA
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No se encontraron productos que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedProducts &&
        paginatedProducts.data &&
        paginatedProducts.totalPages > 0 && (
          <DataTablePagination
            page={paginatedProducts.page}
            totalPages={paginatedProducts.totalPages}
            totalRecords={paginatedProducts.total}
            limit={paginatedProducts.limit}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            isFetching={isFetching}
          />
        )}

      <ProductFormDialog
        product={editingProduct}
        isOpen={isProductFormOpen}
        onOpenChange={setIsProductFormOpen}
        // categories={categories || []} // Pasar categorías para el Select
        // suppliers={suppliers || []} // Pasar proveedores para el Select
      />
      {/* Diálogo de Confirmación para Activar/Desactivar */}
      {productToAction && (
        <AlertDialog
          open={isDeactivateActivateDialogOpen}
          onOpenChange={setIsDeactivateActivateDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás seguro de que quieres{" "}
                {productToAction.isActive ? "desactivar" : "activar"} el
                producto {productToAction.name} ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {productToAction.isActive
                  ? "El producto ya no estará disponible para nuevas ventas o uso en reparaciones/bundles."
                  : "El producto volverá a estar disponible."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToAction(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmProductStatusChange}
                disabled={updateProductStatusMutation.isPending}
                className={
                  productToAction.isActive
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                    : "bg-green-600 hover:bg-green-700"
                }
              >
                {updateProductStatusMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {productToAction.isActive ? "Sí, Desactivar" : "Sí, Activar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Diálogo de Confirmación para Eliminar (Soft Delete) */}
      {productToAction && ( // Reutilizar productToAction o crear uno específico como productToDelete
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás seguro de eliminar (marcar como inactivo) el producto
                {productToAction.name} ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción marcará el producto como inactivo. No se eliminará
                permanentemente de la base de datos, pero no estará disponible
                para nuevas operaciones.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToAction(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProduct}
                disabled={deleteProductMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteProductMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sí, Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <ProductStockDetailsDialog
        productId={selectedProductIdForStock}
        isOpen={isStockDetailsOpen}
        onOpenChange={setIsStockDetailsOpen}
      />
    </>
  );
}
