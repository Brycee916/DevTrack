import { useState } from 'react'
import './Register.css'
import { registerUser } from '../services/api'

export default function Register({ onSwitchToLogin, onRegisterSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await registerUser({ email, password })
      setSuccess('Account created successfully. Redirecting you to login.')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      window.setTimeout(() => {
        onRegisterSuccess?.()
      }, 900)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
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
          <h1>Set up your workspace account.</h1>
          <p className="auth-copy">
            Create an account to start organizing projects, assigning priorities,
            and keeping progress visible for the team.
          </p>

          <div className="auth-points">
            <div className="auth-point">
              <strong>Simple onboarding</strong>
              <span>Register once and access your project workspace instantly.</span>
            </div>
            <div className="auth-point">
              <strong>Structured project data</strong>
              <span>Maintain cleaner records for status, scope, and urgency.</span>
            </div>
            <div className="auth-point">
              <strong>Built for delivery</strong>
              <span>Keep teams focused on execution instead of scattered notes.</span>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="auth-header">
            <p className="eyebrow">Create account</p>
            <h2>Create account</h2>
            <p>Enter your details to open a new workspace account.</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="register-email">Work email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm-password">Confirm password</label>
            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <button
              type="button"
              className="auth-switch-button"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </p>
        </form>
      </section>
    </div>
  )
}
