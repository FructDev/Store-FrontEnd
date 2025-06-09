// app/(dashboard)/inventory/bundles/page.tsx
"use client";

import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssembleBundleForm } from "@/components/inventory/bundles/assemble-bundle-form";
import { DisassembleBundleForm } from "@/components/inventory/bundles/disassemble-bundle-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BundleOperationsPage() {
  return (
    <>
      <PageHeader
        title="Gestión de Bundles/Kits"
        description="Ensambla nuevos kits a partir de componentes o desensambla kits existentes."
      />
      <Tabs defaultValue="assemble-bundle" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="assemble-bundle">Ensamblar Bundle</TabsTrigger>
          <TabsTrigger value="disassemble-bundle">
            Desensamblar Bundle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assemble-bundle">
          <Card>
            <CardHeader>
              <CardTitle>Ensamblar Nuevo Bundle/Kit</CardTitle>
              <CardDescription>
                Selecciona un producto tipo Bundle y los componentes se
                descontarán del stock para crear el kit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AssembleBundleForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disassemble-bundle">
          <Card>
            <CardHeader>
              <CardTitle>Desensamblar Bundle/Kit Existente</CardTitle>
              <CardDescription>
                Selecciona un kit en stock para desarmarlo y devolver sus
                componentes al inventario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <DisassembleBundleForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
