import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import type { UserRole } from '@/shared/types/domain.types'
import { Truck, ShieldAlert } from 'lucide-react'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

/**
 * Componente guardián de rutas.
 * - Si no está autenticado → redirige a /login
 * - Si está autenticado pero sin el rol requerido → muestra pantalla informativa con opciones de cambio de rol
 * - Si tiene el rol correcto → renderiza la ruta hijo (<Outlet />)
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading, setRoleAsDemo } = useAuth()
  const navigate = useNavigate()

  // Pantalla de carga durante la verificación de sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Truck className="w-10 h-10 text-blue-600 mx-auto animate-pulse" />
          <p className="text-sm text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Sin el rol requerido
  if (roles && role && !roles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-5 max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Restricción de Rol</h2>
            <p className="text-xs text-gray-500 mt-1">
              Tu sesión actual está en rol <strong className="text-gray-800 capitalize font-semibold">{role}</strong>, pero esta sección requiere:
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {roles.map(r => (
                <span key={r} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-400">Puedes cambiar a un rol autorizado para continuar la prueba:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setRoleAsDemo('solicitante')
                  navigate('/solicitudes')
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Solicitante
              </button>
              <button
                onClick={() => {
                  setRoleAsDemo('coordinador')
                  navigate('/coordinacion')
                }}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Coordinador
              </button>
              <button
                onClick={() => {
                  setRoleAsDemo('conductor')
                  navigate('/conductor')
                }}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Conductor
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
