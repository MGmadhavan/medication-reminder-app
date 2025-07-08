import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/AuthForm'
import { Dashboard } from '@/components/Dashboard'
import '@/index.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthForm />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
