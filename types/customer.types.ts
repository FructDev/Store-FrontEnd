// types/customer.types.ts

export interface CustomerBasic {
  id: string;
  firstName: string | null; // Prisma puede tenerlos como opcionales
  lastName: string | null;
  phone?: string | null; // Hacer opcional si no siempre lo necesitas
  email?: string | null; // Hacer opcional
  // Puedes añadir otros campos básicos que uses frecuentemente
}

// Podrías tener aquí la interfaz Customer completa si la necesitas en otro lado
export interface Customer extends CustomerBasic {
  address?: string | null;
  rnc?: string | null;
  notes?: string | null;
  storeId: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PaginatedCustomersResponse {
  data: Customer[]; // O CustomerBasic[] si la lista es simplificada
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
