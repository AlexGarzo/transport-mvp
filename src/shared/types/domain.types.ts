// ─────────────────────────────────────────────────────────────────────────────
// Tipos globales del dominio — Sistema de Transporte Corporativo
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'solicitante' | 'coordinador' | 'conductor' | 'admin'

export type EstadoSolicitud =
  | 'RECIBIDO'
  | 'EN_PROCESO'
  | 'EN_CAMINO'
  | 'COMPLETADO'
  | 'CANCELADO'

export type TipoSolicitud =
  | 'TRANSPORTE_GENERAL'
  | 'MOVILIZACION_PERSONAL'
  | 'CARGA_BIOLOGICA'
  | 'DEVOLUCION_ACTIVOS'

export interface Sede {
  id: string
  nombre: string
  activa: boolean
  created_at: string
}

export interface Dependencia {
  id: string
  nombre: string
  sede_id: string
  activa: boolean
}

export interface Vehiculo {
  id: string
  placa: string
  tipo: string
  disponible: boolean
}

export interface Solicitud {
  id: string
  solicitante_id: string
  solicitante_nombre: string
  solicitante_cargo: string
  solicitante_email: string
  sede_id: string
  dependencia_id: string
  tipo: TipoSolicitud
  insumos?: string
  origen: string
  destino: string
  fecha_gestion: string
  observaciones_solicitante?: string

  // Módulo: Pasajeros
  pasajero_nombre?: string
  pasajero_celular?: string
  pasajero_motivo?: string
  pasajero_centro_costos?: string

  // Módulo: Cadena de frío
  hora_en_sede?: string
  hora_en_cava?: string

  // Módulo: Colaborador retirado
  retirado_nombre?: string
  retirado_area?: string
  retirado_cargo?: string

  // Gestión Logística
  vehiculo_id?: string
  conductor_id?: string
  estado: EstadoSolicitud
  prioridad_sugerida?: number
  prioridad_manual?: number
  notas_logistica?: string

  // Auditoría
  created_at: string
  updated_at: string

  // Relaciones (joins)
  sedes?: Sede
  dependencias?: Dependencia
  vehiculos?: Vehiculo
}

export interface Adjunto {
  id: string
  solicitud_id: string
  url: string
  tipo: 'imagen' | 'acta'
  subido_por: string
  created_at: string
}

export interface AuditoriaEntry {
  id: string
  solicitud_id: string
  usuario_id: string
  estado_anterior?: EstadoSolicitud
  estado_nuevo: EstadoSolicitud
  nota?: string
  created_at: string
}
