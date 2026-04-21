import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/useApp'

export default function SignupPage() {
  const { signUp, currentUser } = useApp()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [userType, setUserType] = useState('user')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentUser) {
      navigate('/tasks', { replace: true })
    }
  }, [currentUser, navigate])

  if (currentUser) {
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const result = await signUp({ email, password, fullName, phone, role: userType })
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate('/login', { replace: true, state: { signupSuccess: true } })
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
          <h2 className="auth-brand-headline">Join Ethanos</h2>
          <p className="auth-brand-copy">Log time and clients; sign in as soon as you register.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main-inner">
          <header className="auth-main-header">
            <p className="auth-eyebrow">Create account</p>
            <h1 className="auth-title">Sign up</h1>
            <p className="auth-subtitle">You can sign in immediately after registering.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-fields">
              <label className="auth-field" htmlFor="signup-name">
                <span className="auth-label">Full name</span>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="First and last name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="auth-input"
                />
              </label>
              <label className="auth-field" htmlFor="signup-email">
                <span className="auth-label">Email</span>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
              </label>
              <label className="auth-field" htmlFor="signup-phone">
                <span className="auth-label">Phone</span>
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="numeric"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="auth-input"
                />
              </label>
              <label className="auth-field" htmlFor="signup-user-type">
                <span className="auth-label">User type</span>
                <select
                  id="signup-user-type"
                  name="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="auth-input auth-select"
                  aria-describedby="signup-user-type-hint"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <span id="signup-user-type-hint" className="auth-field-hint">
                  Admins can view all users activity.
                </span>
              </label>
              <label className="auth-field" htmlFor="signup-password">
                <span className="auth-label">Password</span>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input"
                />
              </label>
              <label className="auth-field" htmlFor="signup-confirm">
                <span className="auth-label">Confirm password</span>
                <input
                  id="signup-confirm"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="auth-input"
                />
              </label>
            </div>

            {error ? (
              <div className="auth-alert" role="alert" aria-live="polite">
                {error}
              </div>
            ) : null}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
