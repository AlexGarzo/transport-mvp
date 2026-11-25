import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './app/router'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* Notificaciones toast globales */}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  )
}
