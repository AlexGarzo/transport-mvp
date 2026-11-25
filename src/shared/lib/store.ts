import { INITIAL_SOLICITUDES, DEFAULT_SEDES, DEFAULT_DEPENDENCIAS, DEFAULT_VEHICULOS } from './mockData'
import type { Solicitud } from '@/shared/types/domain.types'

const STORAGE_KEY = 'transport_solicitudes_v1'

function esSolicitudDeEstadio(solicitud: Solicitud): boolean {
  const contieneEstadio = (texto?: string) => texto?.toLowerCase().includes('estadio') ?? false

  return solicitud.sede_id === 'sede-3'
    || solicitud.dependencia_id === 'dep-11'
    || solicitud.dependencia_id === 'dep-12'
    || solicitud.sedes?.nombre.toLowerCase() === 'sede estadio'
    || solicitud.dependencias?.sede_id === 'sede-3'
    || contieneEstadio(solicitud.origen)
    || contieneEstadio(solicitud.destino)
}

export const LocalStore = {
  getSolicitudes(): Solicitud[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const solicitudes = JSON.parse(stored) as Solicitud[]
        const solicitudesVigentes = solicitudes.filter((solicitud) => !esSolicitudDeEstadio(solicitud))
        if (solicitudesVigentes.length !== solicitudes.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudesVigentes))
        }
        return solicitudesVigentes
      }
    } catch {
      // fallback
    }
    // Inicializar con datos de ejemplo
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOLICITUDES))
    return INITIAL_SOLICITUDES
  },

  saveSolicitud(nueva: Partial<Solicitud>): Solicitud {
    const list = this.getSolicitudes()
    const sede = DEFAULT_SEDES.find(s => s.id === nueva.sede_id)
    const dep = DEFAULT_DEPENDENCIAS.find(d => d.id === nueva.dependencia_id)
    const veh = DEFAULT_VEHICULOS.find(v => v.id === nueva.vehiculo_id)

    const created: Solicitud = {
      id: `sol-${Date.now().toString().slice(-4)}`,
      solicitante_id: nueva.solicitante_id || 'demo-user',
      solicitante_nombre: nueva.solicitante_nombre || 'Colaborador Institucional',
      solicitante_cargo: nueva.solicitante_cargo || 'Funcionario',
      solicitante_email: nueva.solicitante_email || 'colaborador@organizacion.com',
      sede_id: nueva.sede_id || 'sede-1',
      dependencia_id: nueva.dependencia_id || 'dep-1',
      tipo: nueva.tipo || 'TRANSPORTE_GENERAL',
      insumos: nueva.insumos,
      origen: nueva.origen || '',
      destino: nueva.destino || '',
      fecha_gestion: nueva.fecha_gestion || new Date().toISOString().split('T')[0],
      observaciones_solicitante: nueva.observaciones_solicitante,
      pasajero_nombre: nueva.pasajero_nombre,
      pasajero_celular: nueva.pasajero_celular,
      pasajero_motivo: nueva.pasajero_motivo,
      pasajero_centro_costos: nueva.pasajero_centro_costos,
      hora_en_sede: nueva.hora_en_sede,
      hora_en_cava: nueva.hora_en_cava,
      retirado_nombre: nueva.retirado_nombre,
      retirado_area: nueva.retirado_area,
      retirado_cargo: nueva.retirado_cargo,
      vehiculo_id: nueva.vehiculo_id,
      estado: nueva.estado || 'RECIBIDO',
      prioridad_sugerida: nueva.prioridad_sugerida || 5,
      prioridad_manual: nueva.prioridad_manual || nueva.prioridad_sugerida || 5,
      notas_logistica: nueva.notas_logistica,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sedes: sede,
      dependencias: dep,
      vehiculos: veh
    }

    const updated = [created, ...list]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('solicitudes-updated'))
    return created
  },

  updateSolicitud(id: string, patch: Partial<Solicitud>): Solicitud | null {
    const list = this.getSolicitudes()
    const index = list.findIndex(s => s.id === id)
    if (index === -1) return null

    const veh = patch.vehiculo_id ? DEFAULT_VEHICULOS.find(v => v.id === patch.vehiculo_id) : list[index].vehiculos

    const updatedItem = {
      ...list[index],
      ...patch,
      vehiculos: veh || list[index].vehiculos,
      updated_at: new Date().toISOString()
    }

    list[index] = updatedItem
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event('solicitudes-updated'))
    return updatedItem
  },

  resetDefaults() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOLICITUDES))
    window.dispatchEvent(new Event('solicitudes-updated'))
  }
}
