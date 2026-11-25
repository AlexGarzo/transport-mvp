import { useNavigate } from 'react-router-dom'
import { Truck, ClipboardList, LayoutDashboard, Car, LogOut } from 'lucide-react'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { cn } from '@/shared/lib/utils'
import type { UserRole } from '@/shared/types/domain.types'

const NAV_ITEMS = [
  { href: '/solicitudes',   label: 'Mis Solicitudes',  icon: ClipboardList, roles: ['solicitante', 'admin', 'coordinador'] },
  { href: '/coordinacion',  label: 'Coordinación',     icon: LayoutDashboard, roles: ['admin', 'coordinador'] },
  { href: '/conductor',     label: 'Mis Asignaciones', icon: Car,           roles: ['conductor', 'admin'] },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut, setRoleAsDemo } = useAuth()
  const navigate = useNavigate()
  const currentPath = window.location.pathname

  const visibleItems = NAV_ITEMS.filter(item =>
    role ? item.roles.includes(role) : false
  )

  const handleRoleChange = (newRole: UserRole) => {
    setRoleAsDemo(newRole)
    if (newRole === 'solicitante') navigate('/solicitudes')
    else if (newRole === 'coordinador' || newRole === 'admin') navigate('/coordinacion')
    else if (newRole === 'conductor') navigate('/conductor')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-xs">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 hidden sm:block text-sm">
                  Transporte Corporativo
                </span>
                <span className="text-2xs text-blue-600 font-semibold tracking-wide block uppercase">
                  MVP v1.0 • Gestión & Despacho
                </span>
              </div>
            </div>

            {/* Navegación por Módulos */}
            <nav className="flex items-center gap-1">
              {visibleItems.map(({ href, label, icon: Icon }) => (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    currentPath.startsWith(href)
                      ? 'bg-blue-50 text-blue-700 shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:block">{label}</span>
                </button>
              ))}
            </nav>

            {/* Selector de Rol y Perfil Activo */}
            <div className="flex items-center gap-3">
              {/* Selector Rápido de Rol */}
              <div className="hidden sm:flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs">
                <span className="text-2xs text-gray-500 font-bold px-1.5">Rol:</span>
                <button
                  onClick={() => handleRoleChange('solicitante')}
                  className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer ${
                    role === 'solicitante' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Solicitante
                </button>
                <button
                  onClick={() => handleRoleChange('coordinador')}
                  className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer ${
                    role === 'coordinador' ? 'bg-white text-purple-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Coordinador
                </button>
                <button
                  onClick={() => handleRoleChange('conductor')}
                  className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer ${
                    role === 'conductor' ? 'bg-white text-amber-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Conductor
                </button>
              </div>

              {/* Usuario */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <p className="font-semibold text-gray-800">{user?.user_metadata?.full_name || 'Usuario'}</p>
                  <p className="text-2xs text-gray-400 capitalize">{role}</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-3 text-center text-xs text-gray-400">
        Sistema de Transporte Corporativo — Especificación MVP v1.0
      </footer>
    </div>
  )
}
