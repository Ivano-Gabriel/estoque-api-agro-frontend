import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Hub from './pages/Hub'
import Produtos from './pages/Produtos'
import Gerenciar from './pages/Gerenciar'
import Lucro from './pages/Lucro'
import Config from './pages/Config'

function App() {
  // Inicializamos com um token fictício para liberar o acesso direto
  const [token, setToken] = useState('visitante_liberado')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout token={token} onLogout={() => setToken(null)} />}>
          <Route index element={<Hub token={token} />} />
          <Route path="produtos" element={<Produtos token={token} />} />
          <Route path="gerenciar" element={<Gerenciar token={token} />} />
          <Route path="lucro" element={<Lucro token={token} />} />
          <Route path="config" element={<Config />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App