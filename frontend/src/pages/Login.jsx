import { useState } from 'react'
import './Login.css'
import { loginUser } from '../services/api'

export default function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const data = await loginUser({ email, password })
      setSuccess('Login successful. Redirecting to your dashboard.')
      onLoginSuccess?.(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <section className="auth-layout">
        <header className="auth-topbar">
          <div className="auth-topbar-brand">
            <span className="auth-topbar-logo">DT</span>
            <span>DevTrack Workspace</span>
          </div>
          <span className="auth-topbar-status">Enterprise project operations</span>
        </header>

        <aside className="auth-panel">
          <span className="auth-brand">DevTrack</span>
          <h1>Run projects with clarity.</h1>
          <p className="auth-copy">
            Track active work, update priorities, and keep delivery teams aligned
            with a single shared workspace.
          </p>

          <div className="auth-points">
            <div className="auth-point">
              <strong>Centralized tracking</strong>
              <span>Keep status, description, and priority in one place.</span>
            </div>
            <div className="auth-point">
              <strong>Fast updates</strong>
              <span>Edit projects quickly without losing context.</span>
            </div>
            <div className="auth-point">
              <strong>Simple access</strong>
              <span>Sign in and get straight to the work that matters.</span>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="auth-header">
            <p className="eyebrow">Sign in</p>
            <h2>Sign in</h2>
            <p>Use your workspace credentials to continue.</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="auth-switch">
            New to DevTrack?{' '}
            <button
              type="button"
              className="auth-switch-button"
              onClick={onSwitchToRegister}
            >
              Create an account
            </button>
          </p>
        </form>
      </section>
    </div>
  )
}
