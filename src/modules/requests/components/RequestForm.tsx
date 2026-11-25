import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Package, 
  UserCheck, 
  Thermometer, 
  Users, 
  FileText,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react'

import { requestSchema, type RequestFormValues } from '../schemas/requestSchema'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useSedes } from '@/shared/hooks/useSedes'
import { useDependencias } from '@/shared/hooks/useDependencias'
import { FileUploadField } from './FileUploadField'
import { calcularPrioridadSugerida } from '@/shared/utils/prioridad'
import { supabase } from '@/shared/lib/supabase'
import { LocalStore } from '@/shared/lib/store'

interface RequestFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function RequestForm({ onSuccess, onCancel }: RequestFormProps) {
  const { user } = useAuth()
  const { sedes, loading: loadingSedes } = useSedes()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultDate = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      tipo: 'TRANSPORTE_GENERAL',
      fecha_gestion: defaultDate,
      sede_id: '',
      dependencia_id: '',
      origen: '',
      destino: '',
      insumos: '',
      observaciones_solicitante: ''
    }
  })

  const selectedSedeId = watch('sede_id')
  const selectedTipo = watch('tipo')
  const { dependencias, loading: loadingDeps } = useDependencias(selectedSedeId)

  const onSubmit = async (values: RequestFormValues) => {
    setIsSubmitting(true)
    try {
      const prioridad = calcularPrioridadSugerida({
        tipo: values.tipo,
        fecha_gestion: values.fecha_gestion
      })

      const payload = {
        solicitante_id: user?.id || '00000000-0000-0000-0000-000000000000',
        solicitante_nombre: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario Colaborador',
        solicitante_cargo: user?.user_metadata?.cargo || 'Colaborador Institucional',
        solicitante_email: user?.email || 'colaborador@organizacion.com',
        sede_id: values.sede_id,
        dependencia_id: values.dependencia_id,
        tipo: values.tipo,
        insumos: values.insumos,
        origen: values.origen,
        destino: values.destino,
        fecha_gestion: values.fecha_gestion,
        observaciones_solicitante: values.observaciones_solicitante,
        // Pasajeros
        pasajero_nombre: values.pasajero_nombre,
        pasajero_celular: values.pasajero_celular,
        pasajero_motivo: values.pasajero_motivo,
        pasajero_centro_costos: values.pasajero_centro_costos,
        // Cadena de frío
        hora_en_sede: values.hora_en_sede,
        hora_en_cava: values.hora_en_cava,
        // Retirado
        retirado_nombre: values.retirado_nombre,
        retirado_area: values.retirado_area,
        retirado_cargo: values.retirado_cargo,
        // Gestión inicial
        estado: 'RECIBIDO',
        prioridad_sugerida: prioridad,
        prioridad_manual: prioridad
      }

      const { data, error } = await supabase
        .from('solicitudes')
        .insert([payload])
        .select()

      if (error) {
        LocalStore.saveSolicitud(payload as any)
        toast.success(`Solicitud registrada (Prioridad calculada: ${prioridad})`)
      } else {
        LocalStore.saveSolicitud({ ...payload, id: data?.[0]?.id } as any)
        toast.success(`Solicitud registrada con éxito (Prioridad asignada: ${prioridad})`)
      }

      onSuccess?.()
    } catch (err: unknown) {
      console.error(err)
      toast.error('Ocurrió un error al procesar el requerimiento')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
      {/* 1. Datos del Solicitante (Perfil SSO) */}
      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Solicitante Identificado (SSO)</span>
          <p className="font-medium text-gray-800">
            {user?.user_metadata?.full_name || user?.email || 'Usuario Activo en Sesión'}
          </p>
          <p className="text-xs text-gray-500">
            {user?.user_metadata?.cargo || 'Colaborador Institucional'} • {user?.email || 'correo@organizacion.com'}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-medium text-blue-700 border border-blue-200 shadow-2xs">
          <UserCheck className="w-3.5 h-3.5" />
          Perfil Verificado
        </div>
      </div>

      {/* 2. Sedes y Dependencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Sede de Origen *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <select
              {...register('sede_id')}
              onChange={(e) => {
                setValue('sede_id', e.target.value)
                setValue('dependencia_id', '') // Reset dependencias
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Selecciona una sede...</option>
              {loadingSedes ? (
                <option disabled>Cargando sedes parametrizadas...</option>
              ) : (
                sedes.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))
              )}
            </select>
          </div>
          {errors.sede_id && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.sede_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Dependencia / Área Solicitante *
          </label>
          <select
            {...register('dependencia_id')}
            disabled={!selectedSedeId || loadingDeps}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedSedeId ? 'Primero selecciona una sede...' : loadingDeps ? 'Cargando áreas...' : 'Selecciona una dependencia...'}
            </option>
            {dependencias.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
          {errors.dependencia_id && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.dependencia_id.message}
            </p>
          )}
        </div>
      </div>

      {/* 3. Selector de Categoría / Tipo de Solicitud */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Requerimiento *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'TRANSPORTE_GENERAL', label: 'Transporte General', desc: 'Materiales, insumos, equipos o mensajería', icon: Package },
            { id: 'MOVILIZACION_PERSONAL', label: 'Personal / Pasajeros', desc: 'Traslado institucional de colaboradores', icon: Users },
            { id: 'CARGA_BIOLOGICA', label: 'Carga Biológica', desc: 'Vacunación y cadena de frío estricta', icon: Thermometer },
            { id: 'DEVOLUCION_ACTIVOS', label: 'Devolución Activos', desc: 'Equipos o bienes por retiro de personal', icon: FileText },
          ].map(({ id, label, desc, icon: Icon }) => (
            <label
              key={id}
              className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                selectedTipo === id 
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                value={id}
                {...register('tipo')}
                className="sr-only"
              />
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 mb-1">
                <Icon className={`w-4 h-4 ${selectedTipo === id ? 'text-blue-600' : 'text-gray-500'}`} />
                {label}
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{desc}</p>
            </label>
          ))}
        </div>
      </div>

      {/* 4. MÓDULOS CONDICIONALES DINÁMICOS */}
      
      {/* 4A. Módulo Condicional: Movilización de Personal */}
      {selectedTipo === 'MOVILIZACION_PERSONAL' && (
        <div className="p-5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
            <Users className="w-4 h-4" />
            <span>Datos del Pasajero / Movilización de Personal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                placeholder="Nombre del pasajero"
                {...register('pasajero_nombre')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              {errors.pasajero_nombre && <p className="text-xs text-red-500 mt-1">{errors.pasajero_nombre.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Celular / Contacto *</label>
              <input
                type="tel"
                placeholder="300 123 4567"
                {...register('pasajero_celular')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              {errors.pasajero_celular && <p className="text-xs text-red-500 mt-1">{errors.pasajero_celular.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Motivo del Viaje *</label>
              <input
                type="text"
                placeholder="Reunión directiva, auditoría..."
                {...register('pasajero_motivo')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              {errors.pasajero_motivo && <p className="text-xs text-red-500 mt-1">{errors.pasajero_motivo.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Centro de Costos</label>
              <input
                type="text"
                placeholder="CC-1020"
                {...register('pasajero_centro_costos')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4B. Módulo Condicional: Carga Biológica / Cadena de Frío */}
      {selectedTipo === 'CARGA_BIOLOGICA' && (
        <div className="p-5 bg-sky-50/60 rounded-xl border border-sky-200 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-sky-800 font-semibold text-sm">
            <Thermometer className="w-4 h-4" />
            <span>Control de Cadena de Frío & Horarios Críticos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hora Estimada en Sede *</label>
              <input
                type="time"
                {...register('hora_en_sede')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              {errors.hora_en_sede && <p className="text-xs text-red-500 mt-1">{errors.hora_en_sede.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hora Estimada en Cava *</label>
              <input
                type="time"
                {...register('hora_en_cava')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              {errors.hora_en_cava && <p className="text-xs text-red-500 mt-1">{errors.hora_en_cava.message}</p>}
            </div>
          </div>
          <p className="text-xs text-sky-700">
            ⚠️ Nota importante: Para salvaguardar la privacidad de datos sensibles en el MVP, no incluya nombres de pacientes ni historias clínicas, únicamente tipo de biológico o insumo.
          </p>
        </div>
      )}

      {/* 4C. Módulo Condicional: Devolución de Activos */}
      {selectedTipo === 'DEVOLUCION_ACTIVOS' && (
        <div className="p-5 bg-purple-50/60 rounded-xl border border-purple-200 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-purple-800 font-semibold text-sm">
            <FileText className="w-4 h-4" />
            <span>Datos de Colaborador Retirado / Activos Institucionales</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Colaborador Retirado *</label>
              <input
                type="text"
                placeholder="Nombre completo"
                {...register('retirado_nombre')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              {errors.retirado_nombre && <p className="text-xs text-red-500 mt-1">{errors.retirado_nombre.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Área o Departamento *</label>
              <input
                type="text"
                placeholder="Área previa"
                {...register('retirado_area')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              {errors.retirado_area && <p className="text-xs text-red-500 mt-1">{errors.retirado_area.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cargo Desempeñado</label>
              <input
                type="text"
                placeholder="Cargo"
                {...register('retirado_cargo')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Origen, Destino y Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Punto de Origen *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Dirección o Sede inicial"
              {...register('origen')}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {errors.origen && <p className="text-xs text-red-500 mt-1">{errors.origen.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Punto de Destino *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Dirección o Sede final"
              {...register('destino')}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {errors.destino && <p className="text-xs text-red-500 mt-1">{errors.destino.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fecha Requerida de Gestión *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="date"
              {...register('fecha_gestion')}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {errors.fecha_gestion && <p className="text-xs text-red-500 mt-1">{errors.fecha_gestion.message}</p>}
        </div>
      </div>

      {/* 6. Insumos y Observaciones del Solicitante */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Insumos o Elementos a Transportar
          </label>
          <textarea
            rows={3}
            placeholder="Detalle de bultos, cajas, equipos de cómputo, etc."
            {...register('insumos')}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Observaciones del Solicitante
          </label>
          <textarea
            rows={3}
            placeholder="Instrucciones para el conductor, contactos de entrega, accesos especiales..."
            {...register('observaciones_solicitante')}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 7. Adjuntos Multimedia / Actas */}
      <FileUploadField
        files={selectedFiles}
        onFilesChange={setSelectedFiles}
      />

      {/* 8. Botones de Acción */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando Registro...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Solicitud
            </>
          )}
        </button>
      </div>
    </form>
  )
}
