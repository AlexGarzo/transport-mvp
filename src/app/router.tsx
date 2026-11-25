import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RequestsPage } from '@/modules/requests/pages/RequestsPage'
import { CoordinationPage } from '@/modules/coordination/pages/CoordinationPage'
import { DriverPage } from '@/modules/driver/pages/DriverPage'

export const router = createBrowserRouter([
  // Ruta raíz → redirige al formulario de solicitudes
  { path: '/', element: <Navigate to="/solicitudes" replace /> },

  // Página de login (pública)
  { path: '/login', element: <LoginPage /> },

  // Módulo 1 — Solicitante (Todos los roles institucionales pueden crear y consultar solicitudes)
  {
    path: '/solicitudes',
    element: <ProtectedRoute roles={['solicitante', 'admin', 'coordinador', 'conductor']} />,
    children: [
      { index: true, element: <RequestsPage /> },
    ],
  },

  // Módulo 2 — Coordinación / Admin
  {
    path: '/coordinacion',
    element: <ProtectedRoute roles={['admin', 'coordinador']} />,
    children: [
      { index: true, element: <CoordinationPage /> },
    ],
  },

  // Módulo 3 — Conductor
  {
    path: '/conductor',
    element: <ProtectedRoute roles={['conductor', 'admin']} />,
    children: [
      { index: true, element: <DriverPage /> },
    ],
  },

  // 404
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-200">404</h1>
          <p className="text-gray-500 mt-2">Página no encontrada</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">Ir al inicio</a>
        </div>
      </div>
    ),
  },
])
