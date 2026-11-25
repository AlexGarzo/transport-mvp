import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { LocalStore } from '@/shared/lib/store'
import type { Solicitud } from '@/shared/types/domain.types'

export function useMisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)

  const loadSolicitudes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*, sedes(nombre), dependencias(nombre), vehiculos(placa, tipo)')
        .eq('solicitante_id', user?.id || '')
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        setSolicitudes(LocalStore.getSolicitudes())
      } else {
        setSolicitudes(data as unknown as Solicitud[])
      }
    } catch {
      setSolicitudes(LocalStore.getSolicitudes())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSolicitudes()

    const handleUpdate = () => loadSolicitudes()
    window.addEventListener('solicitudes-updated', handleUpdate)

    const channel = supabase
      .channel('mis-solicitudes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, () => {
        loadSolicitudes()
      })
      .subscribe()

    return () => {
      window.removeEventListener('solicitudes-updated', handleUpdate)
      supabase.removeChannel(channel)
    }
  }, [loadSolicitudes])

  return { solicitudes, loading, refetch: loadSolicitudes }
}
