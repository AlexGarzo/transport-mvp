import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { LocalStore } from '@/shared/lib/store'
import type { Solicitud } from '@/shared/types/domain.types'

export function useCoordinationSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSolicitudes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*, sedes(nombre), dependencias(nombre), vehiculos(placa, tipo)')
        .order('prioridad_manual', { ascending: true })

      if (error || !data || data.length === 0) {
        const local = LocalStore.getSolicitudes()
        setSolicitudes(local.sort((a, b) => (a.prioridad_manual ?? 5) - (b.prioridad_manual ?? 5)))
      } else {
        setSolicitudes(data as unknown as Solicitud[])
      }
    } catch {
      const local = LocalStore.getSolicitudes()
      setSolicitudes(local.sort((a, b) => (a.prioridad_manual ?? 5) - (b.prioridad_manual ?? 5)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSolicitudes()

    const handleUpdate = () => fetchSolicitudes()
    window.addEventListener('solicitudes-updated', handleUpdate)

    const channel = supabase
      .channel('coordinacion-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, () => {
        fetchSolicitudes()
      })
      .subscribe()

    return () => {
      window.removeEventListener('solicitudes-updated', handleUpdate)
      supabase.removeChannel(channel)
    }
  }, [fetchSolicitudes])

  return { solicitudes, loading, refetch: fetchSolicitudes }
}
