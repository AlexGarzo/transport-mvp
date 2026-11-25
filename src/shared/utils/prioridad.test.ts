import { describe, it, expect } from 'vitest'
import { calcularPrioridadSugerida } from './prioridad'

describe('calcularPrioridadSugerida', () => {
  const hoy = new Date().toISOString().split('T')[0]
  const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const en10dias = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]

  it('Carga biológica para hoy → prioridad 1 (máxima)', () => {
    expect(calcularPrioridadSugerida({ tipo: 'CARGA_BIOLOGICA', fecha_gestion: hoy })).toBe(1)
  })

  it('Carga biológica para mañana → prioridad 1', () => {
    expect(calcularPrioridadSugerida({ tipo: 'CARGA_BIOLOGICA', fecha_gestion: manana })).toBe(1)
  })

  it('Transporte general en 10 días → prioridad alta pero no máxima', () => {
    const p = calcularPrioridadSugerida({ tipo: 'TRANSPORTE_GENERAL', fecha_gestion: en10dias })
    expect(p).toBeGreaterThanOrEqual(1)
    expect(p).toBeLessThanOrEqual(10)
    expect(p).toBeGreaterThan(1)
  })

  it('Movilización de personal para hoy → prioridad ≤ 2', () => {
    const p = calcularPrioridadSugerida({ tipo: 'MOVILIZACION_PERSONAL', fecha_gestion: hoy })
    expect(p).toBeLessThanOrEqual(2)
  })

  it('La prioridad siempre está entre 1 y 10', () => {
    const tipos = ['TRANSPORTE_GENERAL', 'MOVILIZACION_PERSONAL', 'CARGA_BIOLOGICA', 'DEVOLUCION_ACTIVOS'] as const
    const fechas = [hoy, manana, en10dias]
    for (const tipo of tipos) {
      for (const fecha of fechas) {
        const p = calcularPrioridadSugerida({ tipo, fecha_gestion: fecha })
        expect(p).toBeGreaterThanOrEqual(1)
        expect(p).toBeLessThanOrEqual(10)
      }
    }
  })
})
