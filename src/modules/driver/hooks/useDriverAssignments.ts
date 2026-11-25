import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { LocalStore } from '@/shared/lib/store'
import type { Solicitud } from '@/shared/types/domain.types'

export function useDriverAssignments() {
  const [asignaciones, setAsignaciones] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAsignaciones = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*, vehiculos(placa, tipo), sedes(nombre)')
        .in('estado', ['EN_PROCESO', 'EN_CAMINO', 'COMPLETADO'])
        .order('prioridad_manual', { ascending: true })

      if (error || !data || data.length === 0) {
        const local = LocalStore.getSolicitudes()
        const filtered = local.filter(s => ['EN_PROCESO', 'EN_CAMINO', 'COMPLETADO'].includes(s.estado))
        setAsignaciones(filtered)
      } else {
        setAsignaciones(data as unknown as Solicitud[])
      }
    } catch {
      const local = LocalStore.getSolicitudes()
      const filtered = local.filter(s => ['EN_PROCESO', 'EN_CAMINO', 'COMPLETADO'].includes(s.estado))
      setAsignaciones(filtered)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAsignaciones()

    const handleUpdate = () => fetchAsignaciones()
    window.addEventListener('solicitudes-updated', handleUpdate)

    const channel = supabase
      .channel('conductor-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, () => {
        fetchAsignaciones()
      })
      .subscribe()

    return () => {
      window.removeEventListener('solicitudes-updated', handleUpdate)
      supabase.removeChannel(channel)
    }
  }, [fetchAsignaciones])

  return { asignaciones, loading, refetch: fetchAsignaciones }
}
