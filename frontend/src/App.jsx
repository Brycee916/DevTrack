import './App.css'
import Login from './pages/Login'

function App() {
  const apiBaseUrl = 'http://localhost:5000/api'

  return (
    <main className="app-shell">
      <Login apiBaseUrl={apiBaseUrl} />
    </main>
  )
}

export default App
