import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import Hub from './pages/Hub'
import Produtos from './pages/Produtos'
import Gerenciar from './pages/Gerenciar'
import Lucro from './pages/Lucro'
import Configuracoes from './pages/Configuracoes'

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('accessToken'))
  const [role, setRole] = useState(() => sessionStorage.getItem('userRole'))

  function entrar(sessao) {
    sessionStorage.setItem('accessToken', sessao.token)
    sessionStorage.setItem('userRole', sessao.role)
    sessionStorage.setItem('userEmail', sessao.email)
    setToken(sessao.token)
    setRole(sessao.role)
  }

  function sair() {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('userRole')
    sessionStorage.removeItem('userEmail')
    setToken(null)
    setRole(null)
  }

  if (!token) {
    return <Login onLogin={entrar} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout role={role} onLogout={sair} />}>
          <Route index element={role === 'ADMIN' ? <Hub token={token} /> : <Navigate to="/produtos" replace />} />
          <Route path="produtos" element={<Produtos token={token} />} />
          <Route path="gerenciar" element={<Gerenciar token={token} />} />
          <Route path="lucro" element={role === 'ADMIN' ? <Lucro token={token} /> : <Navigate to="/produtos" replace />} />
          <Route path="config" element={<Configuracoes token={token} role={role} />} />
          <Route path="*" element={<Navigate to={role === 'ADMIN' ? '/' : '/produtos'} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
