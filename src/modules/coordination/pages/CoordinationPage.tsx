import { useState, useMemo } from 'react'
import { AppLayout } from '@/shared/components/AppLayout'
import { useCoordinationSolicitudes } from '../hooks/useCoordinationSolicitudes'
import { useSedes } from '@/shared/hooks/useSedes'
import { useVehiculos } from '@/shared/hooks/useVehiculos'
import { supabase } from '@/shared/lib/supabase'
import { LocalStore } from '@/shared/lib/store'
import { toast } from 'sonner'
import { 
  LayoutDashboard, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  XCircle
} from 'lucide-react'
import { TIPO_LABELS, getPrioridadColor } from '@/shared/utils/prioridad'
import type { Solicitud } from '@/shared/types/domain.types'

export function CoordinationPage() {
  const { solicitudes, loading, refetch } = useCoordinationSolicitudes()
  const { sedes } = useSedes()
  const { vehiculos } = useVehiculos(false)

  // Filtros
  const [selectedSede, setSelectedSede] = useState<string>('ALL')
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal de Asignación / Gestión
  const [activeSolicitud, setActiveSolicitud] = useState<Solicitud | null>(null)
  const [vehiculoId, setVehiculoId] = useState('')
  const [prioridadManual, setPrioridadManual] = useState<number>(5)
  const [notasLogistica, setNotasLogistica] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Métricas
  const metrics = useMemo(() => {
    return {
      pendientes: solicitudes.filter(s => s.estado === 'RECIBIDO').length,
      enProceso: solicitudes.filter(s => s.estado === 'EN_PROCESO' || s.estado === 'EN_CAMINO').length,
      completadas: solicitudes.filter(s => s.estado === 'COMPLETADO').length,
      criticas: solicitudes.filter(s => (s.prioridad_manual ?? 10) <= 3 && s.estado !== 'COMPLETADO').length
    }
  }, [solicitudes])

  // Filtrado
  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter(s => {
      if (selectedSede !== 'ALL' && s.sede_id !== selectedSede) return false
      if (selectedEstado !== 'ALL' && s.estado !== selectedEstado) return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchUser = s.solicitante_nombre?.toLowerCase().includes(query)
        const matchOrigen = s.origen?.toLowerCase().includes(query)
        const matchDestino = s.destino?.toLowerCase().includes(query)
        const matchInsumos = s.insumos?.toLowerCase().includes(query)
        if (!matchUser && !matchOrigen && !matchDestino && !matchInsumos) return false
      }
      return true
    })
  }, [solicitudes, selectedSede, selectedEstado, searchTerm])

  const openAssignModal = (sol: Solicitud) => {
    setActiveSolicitud(sol)
    setVehiculoId(sol.vehiculo_id || '')
    setPrioridadManual(sol.prioridad_manual || sol.prioridad_sugerida || 5)
    setNotasLogistica(sol.notas_logistica || '')
  }

  const handleSaveGestion = async () => {
    if (!activeSolicitud) return
    setIsUpdating(true)

    try {
      const updates: Partial<Solicitud> = {
        vehiculo_id: vehiculoId || undefined,
        prioridad_manual: Number(prioridadManual),
        notas_logistica: notasLogistica,
        // Si se asigna vehículo y estaba en RECIBIDO, pasa a EN_PROCESO
        estado: (vehiculoId && activeSolicitud.estado === 'RECIBIDO') ? 'EN_PROCESO' : activeSolicitud.estado,
        updated_at: new Date().toISOString()
      }

      LocalStore.updateSolicitud(activeSolicitud.id, updates)
      await supabase.from('solicitudes').update(updates).eq('id', activeSolicitud.id)

      toast.success('Solicitud despachada y vehículo asignado')
      refetch()
      setActiveSolicitud(null)
    } catch (e) {
      console.error(e)
      toast.error('Error al actualizar la solicitud')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelar = async (solId: string) => {
    const motivo = prompt('Indica el motivo de cancelación de la solicitud:')
    if (!motivo) return

    try {
      LocalStore.updateSolicitud(solId, {
        estado: 'CANCELADO',
        notas_logistica: `CANCELADO: ${motivo}`
      })
      await supabase
        .from('solicitudes')
        .update({
          estado: 'CANCELADO',
          notas_logistica: `CANCELADO: ${motivo}`
        })
        .eq('id', solId)

      toast.success('Solicitud cancelada')
      refetch()
    } catch {
      toast.error('No se pudo cancelar la solicitud')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
              Panel de Coordinación Logística
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Despacho, matriz de priorización y asignación vehicular en tiempo real
            </p>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Por Asignar</p>
              <h4 className="text-xl font-bold text-gray-900">{metrics.pendientes}</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">En Operación</p>
              <h4 className="text-xl font-bold text-gray-900">{metrics.enProceso}</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-2xs flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Prioridad Alta (1-3)</p>
              <h4 className="text-xl font-bold text-red-600">{metrics.criticas}</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Completados</p>
              <h4 className="text-xl font-bold text-gray-900">{metrics.completadas}</h4>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por solicitante, sedes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filtro Sede */}
            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700"
            >
              <option value="ALL">Todas las Sedes</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>

            {/* Filtro Estado */}
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="RECIBIDO">Pendientes (Recibido)</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="EN_CAMINO">En Camino</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Tabla / Grid de Solicitudes para Gestión */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-500 border border-gray-200">
            <Truck className="w-8 h-8 text-blue-600 animate-bounce mx-auto mb-2" />
            <p className="text-sm">Sincronizando tablero logístico...</p>
          </div>
        ) : filteredSolicitudes.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-400 border border-dashed border-gray-300">
            No se encontraron requerimientos con los filtros seleccionados.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Prioridad</th>
                    <th className="py-3 px-4">Solicitante / Área</th>
                    <th className="py-3 px-4">Tipo / Insumos</th>
                    <th className="py-3 px-4">Ruta (Origen → Destino)</th>
                    <th className="py-3 px-4">Fecha Gestión</th>
                    <th className="py-3 px-4">Vehículo Asignado</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSolicitudes.map((sol) => (
                    <tr key={sol.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Prioridad con badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold border ${getPrioridadColor(sol.prioridad_manual ?? 5)}`}>
                          P-{sol.prioridad_manual ?? sol.prioridad_sugerida ?? 5}
                        </span>
                      </td>

                      {/* Solicitante */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{sol.solicitante_nombre}</p>
                        <p className="text-gray-400">{sol.solicitante_cargo}</p>
                      </td>

                      {/* Tipo / Insumos */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">
                          {TIPO_LABELS[sol.tipo]}
                        </span>
                        {sol.insumos && (
                          <p className="text-gray-500 truncate max-w-xs">{sol.insumos}</p>
                        )}
                      </td>

                      {/* Ruta */}
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center gap-1 font-medium">
                          <span>{sol.origen}</span>
                          <span className="text-gray-400">→</span>
                          <span>{sol.destino}</span>
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {sol.fecha_gestion}
                      </td>

                      {/* Vehículo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {sol.vehiculos ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-md font-medium text-2xs">
                            <Truck className="w-3 h-3 text-blue-600" />
                            {sol.vehiculos.tipo.toUpperCase()} ({sol.vehiculos.placa})
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Sin asignar</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {sol.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => openAssignModal(sol)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-2xs font-medium transition-colors"
                        >
                          Gestionar / Asignar
                        </button>
                        {sol.estado !== 'CANCELADO' && sol.estado !== 'COMPLETADO' && (
                          <button
                            onClick={() => handleCancelar(sol.id)}
                            className="p-1 hover:text-red-600 text-gray-400 transition-colors"
                            title="Cancelar solicitud"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Coordinación y Asignación */}
        {activeSolicitud && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  Despacho & Gestión Operativa
                </h3>
                <button
                  onClick={() => setActiveSolicitud(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Info básica */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                <p><strong>Solicitante:</strong> {activeSolicitud.solicitante_nombre}</p>
                <p><strong>Ruta:</strong> {activeSolicitud.origen} → {activeSolicitud.destino}</p>
                <p><strong>Fecha Programada:</strong> {activeSolicitud.fecha_gestion}</p>
                <p><strong>Prioridad Calculada por Sistema:</strong> {activeSolicitud.prioridad_sugerida ?? 5}/10</p>
              </div>

              {/* Formulario de Asignación */}
              <div className="space-y-4 text-xs">
                {/* 1. Asignar Vehículo */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Vehículo Corporativo Asignado
                  </label>
                  <select
                    value={vehiculoId}
                    onChange={(e) => setVehiculoId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                  >
                    <option value="">Selecciona un vehículo disponible...</option>
                    {vehiculos.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.tipo.toUpperCase()} - Placa: {v.placa} {v.disponible ? '(Disponible)' : '(Ocupado)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Ajuste manual de prioridad */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nivel de Prioridad Operativa (1: Máxima Urgencia, 10: Baja)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={prioridadManual}
                      onChange={(e) => setPrioridadManual(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className={`px-2.5 py-1 rounded-md font-bold text-xs border ${getPrioridadColor(prioridadManual)}`}>
                      Nivel {prioridadManual}
                    </span>
                  </div>
                </div>

                {/* 3. Notas operativas de Logística (Unificación de campo duplicado) */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Notas Operativas de Logística (Bitácora Interna)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Instrucciones para el operador, motivos de reasignación, novedades de ruta..."
                    value={notasLogistica}
                    onChange={(e) => setNotasLogistica(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveSolicitud(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleSaveGestion}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isUpdating ? 'Guardando...' : 'Confirmar Despacho'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
