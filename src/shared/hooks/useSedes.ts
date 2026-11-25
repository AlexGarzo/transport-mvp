import { useEffect, useState } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { DEFAULT_SEDES } from '@/shared/lib/mockData'
import type { Sede } from '@/shared/types/domain.types'

export function useSedes() {
  const [sedes, setSedes] = useState<Sede[]>(DEFAULT_SEDES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchSedes() {
      try {
        const { data, error } = await supabase
          .from('sedes')
          .select('*')
          .eq('activa', true)
          .order('nombre')

        if (error || !data || data.length === 0) {
          setSedes(DEFAULT_SEDES)
        } else {
          setSedes(data)
        }
      } catch {
        setSedes(DEFAULT_SEDES)
      } finally {
        setLoading(false)
      }
    }

    fetchSedes()
  }, [])

  return { sedes, loading }
}
