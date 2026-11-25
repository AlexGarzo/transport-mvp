import { useEffect, useState } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { DEFAULT_VEHICULOS } from '@/shared/lib/mockData'
import type { Vehiculo } from '@/shared/types/domain.types'

export function useVehiculos(soloDisponibles = false) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(DEFAULT_VEHICULOS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchVehiculos() {
      try {
        let query = supabase.from('vehiculos').select('*').order('placa')
        if (soloDisponibles) query = query.eq('disponible', true)

        const { data, error } = await query
        if (error || !data || data.length === 0) {
          setVehiculos(soloDisponibles ? DEFAULT_VEHICULOS.filter(v => v.disponible) : DEFAULT_VEHICULOS)
        } else {
          setVehiculos(data)
        }
      } catch {
        setVehiculos(soloDisponibles ? DEFAULT_VEHICULOS.filter(v => v.disponible) : DEFAULT_VEHICULOS)
      } finally {
        setLoading(false)
      }
    }

    fetchVehiculos()
  }, [soloDisponibles])

  return { vehiculos, loading }
}
