// types/repairs.types.ts
import { RepairStatus as PrismaRepairStatus } from "./prisma-enums";
import { Customer } from "./customer.types"; // Asumiendo que ya lo tienes
import { UserMinimal } from "./user.types"; // Asumiendo que ya lo tienes
import { InventoryItem, ProductBasic } from "./inventory.types"; // Para repuestos
import { SaleFromAPI } from "./sales.types";

export interface RepairLineItem {
  // Línea de servicio o repuesto
  id: string;
  repairOrderId: string;
  productId?: string | null;
  product?: Partial<ProductBasic> | null;
  miscDescription?: string | null;
  quantity: number;
  inventoryItem?: Partial<InventoryItem> | null;
  inventoryItemId?: string | null;
  unitPrice: number; // Ya parseado a número para el frontend
  unitCost?: number | null; // Ya parseado
  lineTotal?: number; // Calculado: quantity * unitPrice
  isService?: boolean; // Para diferenciar servicios de repuestos
  // createdAt, updatedAt
}

export interface NewCustomerData {
  firstName?: string | null; // <-- CAMBIO: Añadido '?' y '| null' para hacerlo opcional
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  rnc?: string | null; // RNC o cédula
  address?: string | null; // Dirección
}

export interface RepairOrder {
  id: string;
  repairNumber: string; // Generado por el backend
  storeId: string;

  customerId: string | null;
  customer?: Customer | null;

  technicianId?: string | null;
  technician?: UserMinimal | null; // Usuario técnico asignado

  deviceBrand: string;
  deviceModel: string;
  deviceColor?: string | null;
  deviceImei?: string | null; // Serial o IMEI
  devicePassword?: string | null;
  accessoriesReceived?: string | null;

  reportedIssue: string; // Problema reportado por el cliente
  intakeNotes?: string | null; // Notas al recibir
  intakeChecklist?: JSON | null; // Prisma.JsonValue (JSON)

  postRepairChecklist?: Record<string, boolean> | null;

  diagnosticNotes?: string | null; // Diagnóstico del técnico

  quotedAmount?: number | null; // Monto cotizado (parseado)
  quoteApproved?: boolean | null; // null = pendiente, true = aprobado, false = rechazado
  quoteStatusDate?: string | Date | null; // Fecha de decisión sobre la cotización

  status: PrismaRepairStatus;

  estimatedCompletionDate?: string | Date | null;
  completedAt?: string | Date | null; // Fecha de finalización real
  completionNotes?: string | null; // Notas al finalizar

  warrantyPeriodDays?: number | null; // Días de garantía para esta reparación

  // Totales calculados por el backend para la reparación (servicios + repuestos)
  // Estos se usarán para generar la venta si se factura.
  totalServiceAmount?: number | null; // Suma de líneas de servicio
  totalPartsAmount?: number | null; // Suma de líneas de repuestos
  totalRepairAmount?: number | null; // totalServiceAmount + totalPartsAmount

  saleId?: string | null; // Si la reparación ya fue facturada en una venta
  sale?: Partial<SaleFromAPI> | null;

  receivedAt: string | Date; // Fecha de recepción del dispositivo
  createdAt: string | Date;
  updatedAt: string | Date;

  lines?: RepairLineItem[]; // Para la vista de detalle
  _count?: {
    // Para la vista de listado
    lines: number;
  };
}

// Para la respuesta paginada del backend GET /repairs
export interface PaginatedRepairsResponse {
  data: RepairOrder[]; // RepairOrder ya incluye _count y relaciones básicas
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateRepairOrderPayload {
  customerId?: string | null;
  newCustomer?: NewCustomerData;
  deviceBrand: string;
  deviceModel: string;
  deviceColor?: string | null;
  deviceImei?: string | null;
  devicePassword?: string | null;
  accessoriesReceived?: string | null;
  reportedIssue: string;
  intakeNotes?: string | null;
  // Para un checklist de objetos con llaves string y valores booleanos
  intakeChecklist?: Record<string, boolean> | null;
}
