import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useApp } from '../context/useApp'

export default function LoginPage() {
  const { login, currentUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/tasks'
  const signupSuccess = Boolean(location.state?.signupSuccess)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true })
    }
  }, [currentUser, from, navigate])

  if (currentUser) {
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate(from, { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-pattern" />
        <div className="auth-brand-content">
          <div className="auth-logo">
            <span className="auth-logo-icon" aria-hidden="true" />
            <span className="auth-logo-word">Ethanos</span>
          </div>
          <h2 className="auth-brand-headline">Time and tasks, one place</h2>
          <p className="auth-brand-copy">Hours, clients, and admin in a single workspace.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main-inner">
          <header className="auth-main-header">
            <p className="auth-eyebrow">Sign in</p>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Work email and password.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-fields">
              <label className="auth-field" htmlFor="login-email">
                <span className="auth-label">Work email</span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
              </label>
              <label className="auth-field" htmlFor="login-password">
                <span className="auth-label">Password</span>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                />
              </label>
            </div>

            {signupSuccess ? (
              <div className="auth-success" role="status">
                Account created — sign in with the email and password you chose.
              </div>
            ) : null}

            {error ? (
              <div className="auth-alert" role="alert" aria-live="polite">
                {error}
              </div>
            ) : null}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="auth-switch">
            New to Ethanos?{' '}
            <Link to="/signup" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
