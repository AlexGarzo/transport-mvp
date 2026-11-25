import type { TipoSolicitud } from '@/shared/types/domain.types'

interface PrioridadInput {
  tipo: TipoSolicitud
  fecha_gestion: string // ISO date string 'YYYY-MM-DD'
}

/**
 * Calcula una prioridad sugerida del 1 (más urgente) al 10 (menos urgente).
 * Basada en el tipo de solicitud y los días restantes hasta la fecha de gestión.
 */
export function calcularPrioridadSugerida({ tipo, fecha_gestion }: PrioridadInput): number {
  const ahora = new Date()
  ahora.setHours(0, 0, 0, 0)
  const fechaGestion = new Date(fecha_gestion + 'T00:00:00')
  const diasRestantes = Math.ceil(
    (fechaGestion.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Puntaje base por tipo (1 = más urgente)
  const baseScore: Record<TipoSolicitud, number> = {
    CARGA_BIOLOGICA: 1,
    MOVILIZACION_PERSONAL: 4,
    DEVOLUCION_ACTIVOS: 6,
    TRANSPORTE_GENERAL: 7,
  }

  let score = baseScore[tipo]

  // Ajuste por urgencia temporal
  if (diasRestantes <= 0) score = Math.max(1, score - 3)       // Hoy o vencida
  else if (diasRestantes === 1) score = Math.max(1, score - 2) // Mañana
  else if (diasRestantes <= 3) score = Math.max(1, score - 1)  // Esta semana
  else if (diasRestantes > 7) score = Math.min(10, score + 2)  // Más de 1 semana

  return score
}

/** Retorna el color de badge según la prioridad. */
export function getPrioridadColor(prioridad: number): string {
  if (prioridad <= 2) return 'bg-red-100 text-red-800 border-red-200'
  if (prioridad <= 4) return 'bg-orange-100 text-orange-800 border-orange-200'
  if (prioridad <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-green-100 text-green-800 border-green-200'
}

/** Etiquetas legibles para el tipo de solicitud. */
export const TIPO_LABELS: Record<TipoSolicitud, string> = {
  TRANSPORTE_GENERAL: '📦 Transporte General',
  MOVILIZACION_PERSONAL: '👥 Movilización de Personal',
  CARGA_BIOLOGICA: '🧊 Carga Biológica / Vacunación',
  DEVOLUCION_ACTIVOS: '🔄 Devolución de Activos',
}
