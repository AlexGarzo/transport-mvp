import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabase'
import type { UserRole } from '@/shared/types/domain.types'

interface AuthState {
  user: User | null
  role: UserRole | null
  loading: boolean
}

const DEMO_USERS: Record<UserRole, { id: string; email: string; name: string; cargo: string }> = {
  solicitante: {
    id: 'demo-solicitante-01',
    email: 'andrea.moreno@organizacion.com',
    name: 'Dra. Andrea Moreno',
    cargo: 'Jefe de Farmacia',
  },
  coordinador: {
    id: 'demo-coordinador-01',
    email: 'coordinacion.logistica@organizacion.com',
    name: 'Ing. Carlos Mendoza',
    cargo: 'Coordinador de Logística y Despacho',
  },
  conductor: {
    id: 'demo-conductor-01',
    email: 'carlos.ruiz@organizacion.com',
    name: 'Carlos Ruiz',
    cargo: 'Operador Asignado - Móvil 01',
  },
  admin: {
    id: 'demo-admin-01',
    email: 'admin.transporte@organizacion.com',
    name: 'Administrador del Sistema',
    cargo: 'Director de Operaciones',
  },
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  })

  useEffect(() => {
    // 1. Revisar si hay sesión demo en localStorage
    const savedDemoRole = localStorage.getItem('demo_active_role') as UserRole | null
    if (savedDemoRole && DEMO_USERS[savedDemoRole]) {
      const demo = DEMO_USERS[savedDemoRole]
      const mockUser = {
        id: demo.id,
        email: demo.email,
        user_metadata: {
          full_name: demo.name,
          cargo: demo.cargo,
          role: savedDemoRole,
        },
      } as unknown as User

      setState({
        user: mockUser,
        role: savedDemoRole,
        loading: false,
      })
      return
    }

    // 2. Si no hay demo, consultar sesión real de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user
        const role = (user.user_metadata?.role as UserRole) ?? 'solicitante'
        setState({ user, role, loading: false })
      } else {
        // Por defecto para entorno de pruebas/preview iniciamos como solicitante
        setRoleAsDemo('solicitante')
      }
    }).catch(() => {
      setRoleAsDemo('solicitante')
    })
  }, [])

  const setRoleAsDemo = (role: UserRole) => {
    localStorage.setItem('demo_active_role', role)
    const demo = DEMO_USERS[role]
    const mockUser = {
      id: demo.id,
      email: demo.email,
      user_metadata: {
        full_name: demo.name,
        cargo: demo.cargo,
        role,
      },
    } as unknown as User

    setState({
      user: mockUser,
      role,
      loading: false,
    })
  }

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/solicitudes`,
      },
    })

  const signOut = async () => {
    localStorage.removeItem('demo_active_role')
    try {
      await supabase.auth.signOut()
    } catch {
      // offline fallback
    }
    setState({ user: null, role: null, loading: false })
    window.location.href = '/login'
  }

  return {
    user: state.user,
    role: state.role,
    loading: state.loading,
    isAuthenticated: !!state.user,
    signInWithGoogle,
    setRoleAsDemo,
    signOut,
  }
}
