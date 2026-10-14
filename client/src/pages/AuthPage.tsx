import { useState, type FormEvent } from 'react'
import { useAuth } from '../AuthContext'
import Icon from '../components/Icon'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isLogin = mode === 'login'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) await login(email, password)
      else await register(name, email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="check" size={20} />
          </span>
          Shared Todo
        </div>
        <h1>Get things done, together.</h1>
        <p>Create task lists and share them with classmates, coworkers, or family. Everyone stays on the same page.</p>
        <ul className="hero-points">
          <li><Icon name="list" /> Organize tasks into lists</li>
          <li><Icon name="users" /> Share lists by email</li>
          <li><Icon name="calendar" /> Track due dates and priorities</li>
        </ul>
      </section>

      <section className="auth-card-wrap">
        <form className="auth-card" onSubmit={onSubmit}>
          <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="muted">{isLogin ? 'Sign in to see your lists.' : 'It only takes a few seconds.'}</p>

          {!isLogin && (
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required autoFocus />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus={isLogin} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
              minLength={6}
              required
            />
          </label>

          {error && <div className="alert">{error}</div>}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>

          <p className="switch-mode">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" className="link-btn" onClick={() => { setMode(isLogin ? 'register' : 'login'); setError('') }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </div>
  )
}
