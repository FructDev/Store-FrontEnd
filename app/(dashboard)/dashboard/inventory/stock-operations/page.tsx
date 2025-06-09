// app/(dashboard)/inventory/stock-operations/page.tsx
"use client";

import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddNonSerializedStockForm } from "@/components/inventory/stock/add-non-serialized-stock-form";
import { AddSerializedStockForm } from "@/components/inventory/stock/add-serialized-stock-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdjustStockForm } from "@/components/inventory/stock/adjust-stock-form";
import { TransferStockForm } from "@/components/inventory/stock/transfer-stock-form";

export default function StockOperationsPage() {
  return (
    <>
      <PageHeader
        title="Operaciones de Stock"
        description="Gestiona las entradas, salidas y movimientos de tu inventario."
      />
      <Tabs defaultValue="add-non-serialized" className="w-full">
        <TabsList className="grid w-full sm:grid-cols-4 md:w-auto">
          <TabsTrigger value="add-non-serialized">
            Añadir Stock General
          </TabsTrigger>
          <TabsTrigger value="add-serialized">
            Añadir Stock Serializado
          </TabsTrigger>
          <TabsTrigger value="adjust-stock">Ajustar Stock</TabsTrigger>
          <TabsTrigger value="transfer-stock">Transferir Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="add-non-serialized">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Stock General/No Serializado</CardTitle>
              <CardDescription>
                Incrementa la cantidad de un producto existente en una ubicación
                o crea un nuevo lote.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AddNonSerializedStockForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add-serialized">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Stock Serializado</CardTitle>
              <CardDescription>
                Registra ítems individuales con número de serie o IMEI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AddSerializedStockForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="adjust-stock">
          <Card>
            <CardHeader>
              <CardTitle>Ajustar Stock (No Serializado)</CardTitle>
              <CardDescription>
                Incrementa o disminuye la cantidad de un producto no serializado
                en una ubicación específica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AdjustStockForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transfer-stock">
          <Card>
            <CardHeader>
              <CardTitle>Transferir Stock entre Ubicaciones</CardTitle>
              <CardDescription>
                Mueve unidades de un producto de una ubicación a otra dentro de
                tu tienda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <TransferStockForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
