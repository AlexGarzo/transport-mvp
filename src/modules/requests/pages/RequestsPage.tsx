import { useState } from 'react'
import { AppLayout } from '@/shared/components/AppLayout'
import { RequestForm } from '../components/RequestForm'
import { useMisSolicitudes } from '../hooks/useMisSolicitudes'
import { 
  ClipboardList, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Calendar,
  XCircle,
  Eye
} from 'lucide-react'
import { TIPO_LABELS, getPrioridadColor } from '@/shared/utils/prioridad'
import type { EstadoSolicitud, Solicitud } from '@/shared/types/domain.types'

export function RequestsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Solicitud | null>(null)
  const { solicitudes, loading } = useMisSolicitudes()

  const getStatusBadge = (estado: EstadoSolicitud) => {
    switch (estado) {
      case 'RECIBIDO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3" /> Recibido
          </span>
        )
      case 'EN_PROCESO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3" /> En Proceso
          </span>
        )
      case 'EN_CAMINO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Truck className="w-3 h-3" /> En Camino
          </span>
        )
      case 'COMPLETADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completado
          </span>
        )
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        )
    }

  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header con botón para nueva solicitud */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              Mis Solicitudes de Transporte
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Portal del Solicitante: registra tus requerimientos y haz seguimiento en tiempo real
            </p>
          </div>
          
          <button
            onClick={() => window.location.assign('/nueva-solicitud')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Solicitud
          </button>
        </div>

        {/* Lista de Solicitudes */}
        <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
                <Truck className="w-8 h-8 text-blue-500 animate-bounce mx-auto mb-2" />
                <p className="text-sm">Cargando tus solicitudes en tiempo real...</p>
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Aún no tienes solicitudes registradas</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
                  Crea tu primer requerimiento de transporte institucional haciendo clic en el botón de arriba.
                </p>
                <button
                  onClick={() => window.location.assign('/nueva-solicitud')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Crear mi primera solicitud
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {solicitudes.map((sol) => (
                  <div
                    key={sol.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(sol.estado)}
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {TIPO_LABELS[sol.tipo] || sol.tipo}
                        </span>
                        {sol.prioridad_manual && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getPrioridadColor(sol.prioridad_manual)}`}>
                            Prioridad: {sol.prioridad_manual}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1 text-gray-800 font-medium">
                          <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span>{sol.origen}</span>
                          <span className="text-gray-400">→</span>
                          <span>{sol.destino}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Gestión: {sol.fecha_gestion}</span>
                        </div>
                      </div>

                      {sol.insumos && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          <strong>Insumos:</strong> {sol.insumos}
                        </p>
                      )}

                      {sol.vehiculos && (
                        <p className="text-xs text-blue-700 font-medium">
                          🚗 Vehículo Asignado: {sol.vehiculos.tipo.toUpperCase()} ({sol.vehiculos.placa})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => setSelectedTicket(sol)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Modal de Detalle de Solicitud */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">Detalle de Solicitud</h3>
                  {getStatusBadge(selectedTicket.estado)}
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Categoría</span>
                  <p className="font-medium text-gray-800">{TIPO_LABELS[selectedTicket.tipo]}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-semibold">Origen</span>
                    <p className="font-medium text-gray-800">{selectedTicket.origen}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-semibold">Destino</span>
                    <p className="font-medium text-gray-800">{selectedTicket.destino}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-semibold">Fecha Requerida</span>
                    <p className="font-medium text-gray-800">{selectedTicket.fecha_gestion}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-semibold">Prioridad Asignada</span>
                    <p className="font-bold text-blue-600">{selectedTicket.prioridad_manual ?? 'Pendiente'}/10</p>
                  </div>
                </div>

                {/* Detalles Condicionales si aplican */}
                {selectedTicket.tipo === 'MOVILIZACION_PERSONAL' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs space-y-1">
                    <p className="font-semibold text-amber-900">Datos del Pasajero:</p>
                    <p><strong>Nombre:</strong> {selectedTicket.pasajero_nombre}</p>
                    <p><strong>Celular:</strong> {selectedTicket.pasajero_celular}</p>
                    <p><strong>Motivo:</strong> {selectedTicket.pasajero_motivo}</p>
                    {selectedTicket.pasajero_centro_costos && (
                      <p><strong>Centro de Costos:</strong> {selectedTicket.pasajero_centro_costos}</p>
                    )}
                  </div>
                )}

                {selectedTicket.tipo === 'CARGA_BIOLOGICA' && (
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs space-y-1">
                    <p className="font-semibold text-sky-900">Cadena de Frío:</p>
                    <p><strong>Hora en Sede:</strong> {selectedTicket.hora_en_sede}</p>
                    <p><strong>Hora en Cava:</strong> {selectedTicket.hora_en_cava}</p>
                  </div>
                )}

                {selectedTicket.observaciones_solicitante && (
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-semibold">Observaciones del Solicitante</span>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs mt-1">
                      {selectedTicket.observaciones_solicitante}
                    </p>
                  </div>
                )}

                {selectedTicket.notas_logistica && (
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-semibold">Notas Operativas de Logística</span>
                    <p className="text-blue-900 bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs mt-1">
                      {selectedTicket.notas_logistica}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 text-right">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export function NewRequestPage() {
  const returnToList = () => window.location.assign('/solicitudes')

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">
            Formulario Unificado de Solicitud
          </h1>
          <button
            type="button"
            onClick={returnToList}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Volver a la lista
          </button>
        </div>
        <RequestForm
          onSuccess={returnToList}
          onCancel={returnToList}
        />
      </div>
    </AppLayout>
  )
}
