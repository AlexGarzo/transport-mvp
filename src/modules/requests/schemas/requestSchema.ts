import { z } from 'zod'

export const requestSchema = z.object({
  sede_id: z.string().min(1, 'Selecciona una sede'),
  dependencia_id: z.string().min(1, 'Selecciona una dependencia'),
  tipo: z.enum([
    'TRANSPORTE_GENERAL',
    'MOVILIZACION_PERSONAL',
    'CARGA_BIOLOGICA',
    'DEVOLUCION_ACTIVOS',
  ] as const),
  insumos: z.string().optional(),
  origen: z.string().min(3, 'Indica el origen (mín. 3 caracteres)'),
  destino: z.string().min(3, 'Indica el destino (mín. 3 caracteres)'),
  fecha_gestion: z.string().min(1, 'Selecciona la fecha de gestión'),
  observaciones_solicitante: z.string().optional(),

  // Módulo condicional: Pasajeros (MOVILIZACION_PERSONAL)
  pasajero_nombre: z.string().optional(),
  pasajero_celular: z.string().optional(),
  pasajero_motivo: z.string().optional(),
  pasajero_centro_costos: z.string().optional(),

  // Módulo condicional: Cadena de frío (CARGA_BIOLOGICA)
  hora_en_sede: z.string().optional(),
  hora_en_cava: z.string().optional(),

  // Módulo condicional: Colaborador retirado (DEVOLUCION_ACTIVOS)
  retirado_nombre: z.string().optional(),
  retirado_area: z.string().optional(),
  retirado_cargo: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validaciones cruzadas según tipo de solicitud
  if (data.tipo === 'MOVILIZACION_PERSONAL') {
    if (!data.pasajero_nombre?.trim())
      ctx.addIssue({ code: 'custom', path: ['pasajero_nombre'], message: 'El nombre del pasajero es requerido' })
    if (!data.pasajero_celular?.trim())
      ctx.addIssue({ code: 'custom', path: ['pasajero_celular'], message: 'El celular del pasajero es requerido' })
    if (!data.pasajero_motivo?.trim())
      ctx.addIssue({ code: 'custom', path: ['pasajero_motivo'], message: 'El motivo del viaje es requerido' })
  }

  if (data.tipo === 'CARGA_BIOLOGICA') {
    if (!data.hora_en_sede?.trim())
      ctx.addIssue({ code: 'custom', path: ['hora_en_sede'], message: 'La hora en sede es requerida para carga biológica' })
    if (!data.hora_en_cava?.trim())
      ctx.addIssue({ code: 'custom', path: ['hora_en_cava'], message: 'La hora en cava es requerida para carga biológica' })
  }

  if (data.tipo === 'DEVOLUCION_ACTIVOS') {
    if (!data.retirado_nombre?.trim())
      ctx.addIssue({ code: 'custom', path: ['retirado_nombre'], message: 'El nombre del colaborador es requerido' })
    if (!data.retirado_area?.trim())
      ctx.addIssue({ code: 'custom', path: ['retirado_area'], message: 'El área del colaborador es requerida' })
  }
})

export type RequestFormValues = z.infer<typeof requestSchema>
