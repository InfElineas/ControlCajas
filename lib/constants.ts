// Constantes de la aplicación
export const ROLES = {
  CHOFER: "chofer",
  ALMACENERO: "almacenero",
  EXPEDIDOR: "expedidor",
  INFORMATICO: "informatico",
} as const;

export const TIPOS_EVENTO = {
  EXPEDICION: "Expedicion",
  ENTREGA: "Entrega",
  DEVOLUCION: "Devolucion",
  RECOGIDA: "Recogida",
} as const;

export const ROLES_ARRAY = Object.values(ROLES);

export const COLECCIONES = {
  ALMACEN: "Almacen",
  CENTRO_DISTRIBUCION: "CentroDistribucion",
  USUARIO: "Usuario",
  VEHICULO: "Vehiculo",
  EXPEDICION: "Expedicion",
  ENTREGA: "Entrega",
  DEVOLUCION: "Devolucion",
  RECOGIDA: "Recogida",
  CIERRE: "Cierre",
} as const;

export const COLORES_CAJAS = {
  BLANCAS: "blancas",
  NEGRAS: "negras",
  VERDES: "verdes",
} as const;

export const ERRORES = {
  NO_AUTENTICADO: "No autenticado",
  SIN_PERMISO: "Sin permiso",
  DATOS_INCOMPLETOS: "Datos incompletos",
  ERROR_BD: "Error al acceder a la base de datos",
};

export interface Usuario {
  _id: string;
  nombre: string;
  rol: (typeof ROLES)[keyof typeof ROLES];
  habilitado?: boolean;
  ajuste?: string;
}

export interface Almacen {
  _id: string;
  nombre: string;
  stock: Cajas;
  ajuste?: string;
}

export interface CentroDistribucion {
  _id: string;
  nombre: string;
  deuda: Cajas;
  rotacion: number;
  ajuste?: string;
}

export interface Vehiculo {
  _id: string;
  categoria: string;
  chapa: string;
  marca?: string;
  modelo?: string;
  ajuste?: string;
}

export interface Cajas {
  blancas: number;
  negras: number;
  verdes: number;
}

export interface Ajuste {
  cajas: Cajas;
  cajas_rotas: Cajas;
  tapas_rotas: Cajas;
  nombre?: string;
}
export interface Expedicion {
  _id?: string;
  centro_distribucion: string;
  almacen: string;
  fecha: string;
  nombre: string;
  cajas: Cajas;
  ajuste?: string;
}

export interface Entrega {
  _id?: string;
  centro_distribucion: string;
  fecha: string;
  nombre: string;
  chapa: string;
  cajas: Cajas;
  ajuste?: string;
}

export interface Recogida {
  _id?: string;
  centro_distribucion: string;
  fecha: string;
  nombre: string;
  chapa: string;
  cajas: Cajas;
  cajas_rotas: Cajas;
  ajuste?: string;
}

export interface Devolucion {
  _id?: string;
  centro_distribucion: string;
  almacen: string;
  fecha: string;
  nombre: string;
  cajas: Cajas;
  cajas_rotas: Cajas;
  ajuste?: string;
}

export interface Cierre {
  fecha: string;
  cierre_cd: {
    centro_distribucion: string;
    ajuste_deuda: Cajas;
    cajas_rotas: Cajas;
    tapas_rotas: Cajas;
  }[];
  cierre_almacen: {
    almacen: string;
    ajuste_stock: Cajas;
  }[];
}
