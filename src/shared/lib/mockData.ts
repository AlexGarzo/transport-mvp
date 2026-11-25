import type { Sede, Dependencia, Vehiculo, Solicitud } from '@/shared/types/domain.types'

export const DEFAULT_SEDES: Sede[] = [
  { id: 'sede-1', nombre: 'Administrativa', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-2', nombre: 'Centro', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-4', nombre: 'Norte', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-5', nombre: 'Argentina Tb', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-6', nombre: 'Av. Oriental', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-7', nombre: 'Av. Oriental Barbacoas', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-8', nombre: 'Calasanz', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-9', nombre: 'C. Especialistas', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-10', nombre: 'Norte Alterna', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-11', nombre: 'Suramericana', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-12', nombre: 'Spazio', activa: true, created_at: new Date().toISOString() },
  { id: 'sede-13', nombre: 'Otra', activa: true, created_at: new Date().toISOString() },
].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

export const DEFAULT_DEPENDENCIAS: Dependencia[] = [
  // Sede Administrativa
  { id: 'dep-1', nombre: 'Financiera', sede_id: 'sede-1', activa: true },
  { id: 'dep-2', nombre: 'Recursos Humanos', sede_id: 'sede-1', activa: true },
  { id: 'dep-3', nombre: 'Logística', sede_id: 'sede-1', activa: true },
  { id: 'dep-4', nombre: 'Sistemas / TI', sede_id: 'sede-1', activa: true },
  { id: 'dep-5', nombre: 'Gerencia General', sede_id: 'sede-1', activa: true },
  // Sede Centro
  { id: 'dep-6', nombre: 'Farmacia', sede_id: 'sede-2', activa: true },
  { id: 'dep-7', nombre: 'Urgencias', sede_id: 'sede-2', activa: true },
  { id: 'dep-8', nombre: 'Consulta Externa', sede_id: 'sede-2', activa: true },
  { id: 'dep-9', nombre: 'Laboratorio Clínico', sede_id: 'sede-2', activa: true },
  { id: 'dep-10', nombre: 'Vacunación', sede_id: 'sede-2', activa: true },
  // Sede Norte
  { id: 'dep-13', nombre: 'Almacén General', sede_id: 'sede-4', activa: true },
  { id: 'dep-14', nombre: 'Mantenimiento', sede_id: 'sede-4', activa: true },
]

export const DEFAULT_VEHICULOS: Vehiculo[] = [
  { id: 'veh-1', placa: 'ABC-123', tipo: 'van', disponible: true },
  { id: 'veh-2', placa: 'DEF-456', tipo: 'camion', disponible: true },
  { id: 'veh-3', placa: 'GHI-789', tipo: 'sedan', disponible: true },
  { id: 'veh-4', placa: 'JKL-012', tipo: 'moto', disponible: true },
  { id: 'veh-5', placa: 'MNO-345', tipo: 'pickup', disponible: true },
]

export const INITIAL_SOLICITUDES: Solicitud[] = [
  {
    id: 'sol-101',
    solicitante_id: 'demo-solicitante-01',
    solicitante_nombre: 'Dra. Andrea Moreno',
    solicitante_cargo: 'Jefe de Farmacia',
    solicitante_email: 'andrea.moreno@organizacion.com',
    sede_id: 'sede-2',
    dependencia_id: 'dep-6',
    tipo: 'CARGA_BIOLOGICA',
    insumos: 'Termonevera con 500 dosis de Vacunas Neumococo',
    origen: 'Sede Centro - Bloque Cava Fría',
    destino: 'Sede Norte - Centro de Vacunación',
    fecha_gestion: new Date().toISOString().split('T')[0],
    hora_en_sede: '08:30',
    hora_en_cava: '09:15',
    observaciones_solicitante: 'Mantener control estricto de temperatura entre 2°C y 8°C. Data logger activo.',
    estado: 'RECIBIDO',
    prioridad_sugerida: 1,
    prioridad_manual: 1,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    sedes: DEFAULT_SEDES.find((sede) => sede.id === 'sede-2'),
    dependencias: DEFAULT_DEPENDENCIAS[5]
  },
  {
    id: 'sol-103',
    solicitante_id: 'demo-solicitante-03',
    solicitante_nombre: 'Dra. Claudia Vargas',
    solicitante_cargo: 'Directora Médica',
    solicitante_email: 'claudia.vargas@organizacion.com',
    sede_id: 'sede-1',
    dependencia_id: 'dep-5',
    tipo: 'MOVILIZACION_PERSONAL',
    pasajero_nombre: 'Dr. Alejandro Peña y equipo de auditores (3 personas)',
    pasajero_celular: '310 987 6543',
    pasajero_motivo: 'Comité directivo extraordinario y auditoría de acreditación en salud',
    pasajero_centro_costos: 'CC-DIR-01',
    origen: 'Sede Administrativa - Entrada Principal',
    destino: 'Sede Centro - Auditorio Central',
    fecha_gestion: new Date().toISOString().split('T')[0],
    vehiculo_id: 'veh-1',
    estado: 'EN_CAMINO',
    prioridad_sugerida: 2,
    prioridad_manual: 2,
    notas_logistica: 'Van ABC-123 en camino. El conductor ya confirmó recogida en portería.',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
    sedes: DEFAULT_SEDES.find((sede) => sede.id === 'sede-1'),
    dependencias: DEFAULT_DEPENDENCIAS[4],
    vehiculos: DEFAULT_VEHICULOS[0]
  }
]
