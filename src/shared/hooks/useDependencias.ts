import { useEffect, useState } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { DEFAULT_DEPENDENCIAS } from '@/shared/lib/mockData'
import type { Dependencia } from '@/shared/types/domain.types'

export function useDependencias(sedeId: string | null) {
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!sedeId) {
      setDependencias([])
      return
    }

    async function fetchDeps() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('dependencias')
          .select('*')
          .eq('sede_id', sedeId)
          .eq('activa', true)
          .order('nombre')

        if (error || !data || data.length === 0) {
          const filtered = DEFAULT_DEPENDENCIAS.filter(d => d.sede_id === sedeId)
          setDependencias(filtered)
        } else {
          setDependencias(data)
        }
      } catch {
        const filtered = DEFAULT_DEPENDENCIAS.filter(d => d.sede_id === sedeId)
        setDependencias(filtered)
      } finally {
        setLoading(false)
      }
    }

    fetchDeps()
  }, [sedeId])

  return { dependencias, loading }
}
