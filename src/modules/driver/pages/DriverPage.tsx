import { useState } from 'react'
import { AppLayout } from '@/shared/components/AppLayout'
import { useDriverAssignments } from '../hooks/useDriverAssignments'
import { supabase } from '@/shared/lib/supabase'
import { LocalStore } from '@/shared/lib/store'
import { toast } from 'sonner'
import { 
  Car, 
  MapPin, 
  CheckCircle, 
  Navigation, 
  Phone, 
  User, 
  Thermometer
} from 'lucide-react'
import { TIPO_LABELS, getPrioridadColor } from '@/shared/utils/prioridad'
import type { Solicitud } from '@/shared/types/domain.types'

export function DriverPage() {
  const { asignaciones, loading, refetch } = useDriverAssignments()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleConfirmarRecogida = async (sol: Solicitud) => {
    setProcessingId(sol.id)
    try {
      LocalStore.updateSolicitud(sol.id, { estado: 'EN_CAMINO' })
      await supabase
        .from('solicitudes')
        .update({
          estado: 'EN_CAMINO',
          updated_at: new Date().toISOString()
        })
        .eq('id', sol.id)

      toast.success('¡Recogida confirmada! Estado actualizado a EN CAMINO 📍')
      refetch()
    } catch {
      toast.error('Error al confirmar recogida')
    } finally {
      setProcessingId(null)
    }
  }

  const handleCerrarServicio = async (sol: Solicitud) => {
    const confirm = window.confirm('¿Confirmas que la entrega o traslado fue completado exitosamente?')
    if (!confirm) return

    setProcessingId(sol.id)
    try {
      LocalStore.updateSolicitud(sol.id, { estado: 'COMPLETADO' })
      await supabase
        .from('solicitudes')
        .update({
          estado: 'COMPLETADO',
          updated_at: new Date().toISOString()
        })
        .eq('id', sol.id)

      toast.success('¡Servicio completado y registrado! ✅')
      refetch()
    } catch {
      toast.error('Error al cerrar servicio')
    } finally {
      setProcessingId(null)
    }
  }

  const activeServices = asignaciones.filter(a => a.estado !== 'COMPLETADO')
  const completedServices = asignaciones.filter(a => a.estado === 'COMPLETADO')

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header con vista optimizada para dispositivos móviles */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Portal del Conductor</h1>
                <p className="text-xs text-blue-100">Rutas activas y confirmación en campo</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-blue-200">Activos Hoy</span>
              <p className="text-2xl font-black">{activeServices.length}</p>
            </div>
          </div>
        </div>

        {/* Lista de Servicios Activos */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Servicios Pendientes / En Ruta
          </h2>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-400">
              Cargando asignaciones vehiculares...
            </div>
          ) : activeServices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-gray-800">¡Al día!</h3>
              <p className="text-xs text-gray-500 mt-1">
                No tienes servicios activos pendientes en este momento.
              </p>
            </div>
          ) : (
            activeServices.map((sol) => (
              <div
                key={sol.id}
                className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Cabecera del ticket con Prioridad */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getPrioridadColor(sol.prioridad_manual ?? 5)}`}>
                      Prioridad {sol.prioridad_manual ?? 5}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {TIPO_LABELS[sol.tipo]}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    {sol.estado}
                  </span>
                </div>

                {/* Contenido Operativo */}
                <div className="p-5 space-y-4">
                  {/* Ruta: Origen a Destino */}
                  <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-2xs font-bold text-gray-400 uppercase">Origen / Recogida</span>
                        <p className="font-bold text-sm text-gray-900">{sol.origen}</p>
                      </div>
                    </div>
                    <div className="border-l-2 border-dashed border-blue-200 ml-1.5 h-3" />
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-2xs font-bold text-gray-400 uppercase">Destino / Entrega</span>
                        <p className="font-bold text-sm text-gray-900">{sol.destino}</p>
                      </div>
                    </div>
                  </div>

                  {/* Datos del Pasajero si aplica */}
                  {sol.tipo === 'MOVILIZACION_PERSONAL' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1.5">
                      <p className="font-bold text-amber-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Pasajero: {sol.pasajero_nombre}
                      </p>
                      {sol.pasajero_celular && (
                        <a
                          href={`tel:${sol.pasajero_celular}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" /> Llamar: {sol.pasajero_celular}
                        </a>
                      )}
                      {sol.pasajero_motivo && (
                        <p className="text-gray-600"><strong>Motivo:</strong> {sol.pasajero_motivo}</p>
                      )}
                    </div>
                  )}

                  {/* Control de Frío si aplica */}
                  {sol.tipo === 'CARGA_BIOLOGICA' && (
                    <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs space-y-1">
                      <p className="font-bold text-sky-900 flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5" /> Cadena de Frío Activa
                      </p>
                      <p className="text-gray-700">Hora límite en Sede: <strong>{sol.hora_en_sede}</strong></p>
                      <p className="text-gray-700">Hora límite en Cava: <strong>{sol.hora_en_cava}</strong></p>
                    </div>
                  )}

                  {/* Notas Operativas de Logística para el Conductor */}
                  {sol.notas_logistica && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <span className="font-bold text-gray-700 block mb-0.5">Indicaciones de Logística:</span>
                      <p className="text-gray-600">{sol.notas_logistica}</p>
                    </div>
                  )}

                  {/* Botones de Acción Táctil en Campo */}
                  <div className="pt-2">
                    {sol.estado === 'EN_PROCESO' && (
                      <button
                        onClick={() => handleConfirmarRecogida(sol)}
                        disabled={processingId === sol.id}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                      >
                        <Navigation className="w-4 h-4" />
                        {processingId === sol.id ? 'Actualizando...' : 'Confirmar Recogida (Iniciar Ruta)'}
                      </button>
                    )}

                    {sol.estado === 'EN_CAMINO' && (
                      <button
                        onClick={() => handleCerrarServicio(sol)}
                        disabled={processingId === sol.id}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processingId === sol.id ? 'Finalizando...' : 'Completar Entrega / Cerrar Servicio'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Historial de Completados Hoy */}
        {completedServices.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Completados Hoy ({completedServices.length})
            </h3>
            <div className="space-y-2">
              {completedServices.map(c => (
                <div
                  key={c.id}
                  className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-600"
                >
                  <div className="truncate">
                    <span className="font-semibold text-gray-800">{c.origen} → {c.destino}</span>
                    <p className="text-2xs text-gray-400">{TIPO_LABELS[c.tipo]}</p>
                  </div>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" /> Completado
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
