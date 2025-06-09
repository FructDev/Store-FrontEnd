// types/user.types.ts
// Asumimos que los roles y permisos son arrays de strings en el frontend
// después de ser procesados desde el backend.

export interface UserMinimal {
  // Para mostrar el nombre del vendedor/creador
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string; // Útil para mostrar
}

// La interfaz User completa que usas en tu auth.store.ts
// podría estar aquí o seguir en auth.store.ts y UserMinimal importarla
export interface User extends UserMinimal {
  roles: string[];
  storeId: string | null;
  storeName?: string | null;
  permissions: string[];
  isActive: boolean;
  // createdAt?: string | Date;
  // updatedAt?: string | Date;
}
