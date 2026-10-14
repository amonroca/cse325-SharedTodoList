import { useAuth } from './AuthContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="splash">
        <div className="spinner" />
      </div>
    )
  }
  return user ? <Dashboard /> : <AuthPage />
}
