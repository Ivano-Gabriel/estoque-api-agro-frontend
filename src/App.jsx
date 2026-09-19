import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
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
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const ficouOnline = () => setOnline(true)
    const ficouOffline = () => setOnline(false)

    window.addEventListener('online', ficouOnline)
    window.addEventListener('offline', ficouOffline)
    return () => {
      window.removeEventListener('online', ficouOnline)
      window.removeEventListener('offline', ficouOffline)
    }
  }, [])

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

  return (
    <>
      {!online && (
        <div role="status" className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-black px-4 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
          <WifiOff size={15} /> Sem internet — alterações no estoque estão indisponíveis
        </div>
      )}

      {!token ? (
        <Login onLogin={entrar} />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout role={role} token={token} onLogout={sair} />}>
              <Route index element={role === 'ADMIN' ? <Hub token={token} /> : <Navigate to="/produtos" replace />} />
              <Route path="produtos" element={<Produtos token={token} />} />
              <Route path="gerenciar" element={<Gerenciar token={token} role={role} />} />
              <Route path="lucro" element={role === 'ADMIN' ? <Lucro token={token} /> : <Navigate to="/produtos" replace />} />
              <Route path="config" element={<Configuracoes token={token} role={role} />} />
              <Route path="*" element={<Navigate to={role === 'ADMIN' ? '/' : '/produtos'} replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </>
  )
}

export default App
