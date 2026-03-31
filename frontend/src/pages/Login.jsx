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
      <form onSubmit={handleSubmit} className="login-form">
        <h1>DevTrack Login</h1>
        <p>Sign in to connect this frontend to your Express backend.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
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
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-switch">
          New here?{' '}
          <button
            type="button"
            className="auth-switch-button"
            onClick={onSwitchToRegister}
          >
            Create an account
          </button>
        </p>
      </form>
    </div>
  )
}
