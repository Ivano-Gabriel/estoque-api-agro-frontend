import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import Login from './pages/Login'
import Layout from './components/Layout'
import OperacaoPendente from './components/OperacaoPendente'

const Hub = lazy(() => import('./pages/Hub'))
const Produtos = lazy(() => import('./pages/Produtos'))
const Gerenciar = lazy(() => import('./pages/Gerenciar'))
const Lucro = lazy(() => import('./pages/Lucro'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))
const Plataforma = lazy(() => import('./pages/Plataforma'))
const Clientes = lazy(() => import('./pages/Clientes'))
const NotasRecebidas = lazy(() => import('./pages/NotasRecebidas'))
const Pdv = lazy(() => import('./pages/Pdv'))
const Lanchonete = lazy(() => import('./pages/Lanchonete'))

const carregandoPagina = <div className="glass-panel empty-state m-4"><strong>Carregando...</strong></div>

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('accessToken'))
  const [role, setRole] = useState(() => sessionStorage.getItem('userRole'))
  const [loja, setLoja] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('userStore')) } catch { return null }
  })
  const [online, setOnline] = useState(() => navigator.onLine)
  const [avisoSessao, setAvisoSessao] = useState('')

  useEffect(() => {
    const expirar = (event) => {
      if (event?.detail && event.detail !== `Bearer ${token}`) return
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('userRole')
      sessionStorage.removeItem('userStore')
      setToken(null)
      setRole(null)
      setLoja(null)
      setAvisoSessao('Sua sessão terminou. Entre novamente para continuar.')
    }
    window.addEventListener('sessao-expirada', expirar)
    let timer
    if (token) {
      try {
        const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        timer = setTimeout(expirar, Math.max(0, exp * 1000 - Date.now()))
      } catch { timer = setTimeout(expirar, 0) }
    }
    return () => { clearTimeout(timer); window.removeEventListener('sessao-expirada', expirar) }
  }, [token])

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
    setAvisoSessao('')
    sessionStorage.setItem('accessToken', sessao.token)
    sessionStorage.setItem('userRole', sessao.role)
    sessionStorage.setItem('userEmail', sessao.email)
    sessionStorage.setItem('userStore', JSON.stringify(sessao.loja))
    setToken(sessao.token)
    setRole(sessao.role)
    setLoja(sessao.loja)
  }

  function sair() {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('userRole')
    sessionStorage.removeItem('userEmail')
    sessionStorage.removeItem('userStore')
    setToken(null)
    setRole(null)
    setLoja(null)
  }

  return (
    <>
      {!online && (
        <div role="status" className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-black px-4 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
          <WifiOff size={15} /> Sem internet — alterações no estoque estão indisponíveis
        </div>
      )}

      <Suspense fallback={carregandoPagina}>{!token ? (
        <Login onLogin={entrar} aviso={avisoSessao} />
      ) : role === 'SUPER_ADMIN' ? (
        <Plataforma token={token} onLogout={sair} />
      ) : (
        <BrowserRouter>
          <OperacaoPendente token={token} />
          <Routes>
            <Route path="/" element={<Layout role={role} loja={loja} token={token} onLogout={sair} />}>
              <Route index element={role === 'ADMIN' ? <Hub token={token} loja={loja} /> : <Navigate to="/produtos" replace />} />
              <Route path="produtos" element={<Produtos token={token} loja={loja} />} />
              <Route path="pdv" element={<Pdv token={token} loja={loja} />} />
              <Route path="lanchonete" element={loja?.lanchoneteAtiva ? <Lanchonete token={token} loja={loja} role={role} /> : <Navigate to="/produtos" replace />} />
              <Route path="gerenciar" element={<Gerenciar token={token} role={role} loja={loja} />} />
              <Route path="lucro" element={role === 'ADMIN' && loja?.financeiroAtivo ? <Lucro token={token} loja={loja} /> : <Navigate to="/produtos" replace />} />
              <Route path="clientes" element={<Clientes token={token} role={role} />} />
              <Route path="notas" element={role === 'ADMIN' && loja?.notasFiscaisAtivas ? <NotasRecebidas token={token} loja={loja} /> : <Navigate to="/produtos" replace />} />
              <Route path="config" element={<Configuracoes token={token} role={role} />} />
              <Route path="*" element={<Navigate to={role === 'ADMIN' ? '/' : '/produtos'} replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}</Suspense>
    </>
  )
}

export default App
