import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [token, setToken] = useState(null)

  if (!token) {
    return <Login onLogin={setToken} />
  }

  return <Dashboard token={token} />
}

export default App