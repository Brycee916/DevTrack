import { useEffect, useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

function getInitialPath() {
  const path = window.location.pathname

  return ['/login', '/register', '/dashboard'].includes(path) ? path : '/login'
}

function App() {
  const [route, setRoute] = useState(getInitialPath)
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')

  useEffect(() => {
    const handlePopState = () => setRoute(getInitialPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute)
    }
    setRoute(nextRoute)
  }

  useEffect(() => {
    if (!token && route === '/dashboard') {
      if (window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login')
      }
      setRoute('/login')
    } else if (token && (route === '/login' || route === '/register')) {
      if (window.location.pathname !== '/dashboard') {
        window.history.pushState({}, '', '/dashboard')
      }
      setRoute('/dashboard')
    }
  }, [route, token])

  const handleLoginSuccess = (nextToken) => {
    localStorage.setItem('token', nextToken)
    setToken(nextToken)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
    navigate('/login')
  }

  return (
    <main className="app-shell">
      {route === '/register' ? (
        <Register
          onSwitchToLogin={() => navigate('/login')}
          onRegisterSuccess={() => navigate('/login')}
        />
      ) : route === '/dashboard' ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <Login
          onSwitchToRegister={() => navigate('/register')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </main>
  )
}

export default App
