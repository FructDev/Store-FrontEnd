// types/settings.types.ts

// Importar o redefinir el enum PaymentMethod tal como está en tu schema.prisma
// Si ya lo tienes en 'types/prisma-enums.ts', podrías importarlo desde allí.
// Por ahora, lo definimos aquí para que este archivo sea autocontenido.
export enum PaymentMethod {
  CASH = "CASH",
  CARD_CREDIT = "CARD_CREDIT",
  CARD_DEBIT = "CARD_DEBIT",
  TRANSFER = "TRANSFER",
  MOBILE_WALLET = "MOBILE_WALLET",
  STORE_CREDIT = "STORE_CREDIT",
  OTHER = "OTHER",
}

// Interfaz para la información básica de una ubicación que se vincula
export interface InventoryLocationSetting {
  id: string;
  name: string | null;
}

// Interfaz para la información del contador de la tienda relevante para settings
export interface StoreCounter {
  saleNumberPrefix: string;
  saleNumberPadding: number;
  lastSaleNumber: number;
  repairNumberPrefix: string;
  repairNumberPadding: number;
  lastRepairNumber: number;
  poNumberPrefix: string;
  poNumberPadding: number;
  lastPoNumber: number;
  stockCountNumberPrefix: string;
  stockCountNumberPadding: number;
  lastStockCountNumber: number;
  // updatedAt no es necesaria aquí para el formulario
}

// Interfaz principal para los datos de configuración de la tienda
// Esto refleja la respuesta esperada de GET /stores/settings
export interface StoreSettings {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email?: string | null;
  defaultTaxRate: number | string | null; // Prisma Decimal viene como string o number
  contactEmail: string | null;
  website: string | null;
  currencySymbol: string | null;
  quoteTerms: string | null;
  repairTerms: string | null;
  defaultRepairWarrantyDays: number | null;

  acceptedPaymentMethods: PaymentMethod[];

  rnc?: string | null; // <--- ADDED
  logoUrl?: string | null; // <--- ADDED
  receiptFooterNotes?: string | null;

  defaultReturnLocationId: string | null;
  defaultReturnLocation: InventoryLocationSetting | null;

  defaultPoReceiveLocationId: string | null;
  defaultPoReceiveLocation: InventoryLocationSetting | null;

  counter: StoreCounter | null;

  // Otros campos escalares de Store que devuelva el endpoint
  createdAt: string; // O Date
  updatedAt: string; // O Date
}

// Tipo para los datos del formulario, que puede ser ligeramente diferente
// al DTO de respuesta, especialmente con los números y Prisma.Decimal
// Este tipo es el que se infiere de tu Zod schema
export interface StoreSettingsFormValues {
  name?: string;
  address?: string | null;
  phone?: string | null;
  defaultTaxRate?: number | null; // Zod coerce.number lo convierte
  contactEmail?: string | null;
  website?: string | null;
  currencySymbol?: string | null;
  quoteTerms?: string | null;
  repairTerms?: string | null;
  defaultRepairWarrantyDays?: number | null;

  saleNumberPrefix?: string;
  saleNumberPadding?: number;
  lastSaleNumber?: number;

  repairNumberPrefix?: string;
  repairNumberPadding?: number;
  lastRepairNumber?: number;

  poNumberPrefix?: string;
  poNumberPadding?: number;
  lastPoNumber?: number;

  stockCountNumberPrefix?: string;
  stockCountNumberPadding?: number;
  lastStockCountNumber?: number;

  acceptedPaymentMethods?: PaymentMethod[];
  defaultReturnLocationId?: string | null;
  defaultPoReceiveLocationId?: string | null;
}

// Tipo para los items de ubicación en los dropdowns
export interface InventoryLocationBasic {
  id: string;
  name: string;
  // Puedes añadir más campos si los necesitas para el Select
}
