import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import Produtos from './pages/Produtos'
import Repor from './pages/Repor'
import Lucro from './pages/Lucro'
import Config from './pages/Config'

function App() {
  const [token, setToken] = useState(null)

  if (!token) {
    return <Login onLogin={setToken} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout token={token} onLogout={() => setToken(null)} />}>
          <Route index element={<Navigate to="/produtos" />} />
          <Route path="produtos" element={<Produtos token={token} />} />
          <Route path="repor" element={<Repor token={token} />} />
          <Route path="lucro" element={<Lucro token={token} />} />
          <Route path="config" element={<Config />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App