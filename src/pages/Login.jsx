import { useState } from 'react'
import { Boxes, LockKeyhole, LogIn, Mail } from 'lucide-react'
import API_URL from '../config/api'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      if (!resposta.ok) {
        throw new Error(resposta.status === 401
          ? 'E-mail ou senha incorretos.'
          : 'Não foi possível entrar agora. Tente novamente.')
      }

      onLogin(await resposta.json())
    } catch (error) {
      setErro(error instanceof TypeError
        ? 'Servidor indisponível. Verifique sua conexão.'
        : error.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-dinamico bg-cover bg-center flex items-center justify-center p-5">
      <main className="glass-panel w-full max-w-md !border-l-2 p-7 sm:p-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 border border-current/30 bg-current/5 flex items-center justify-center">
            <Boxes size={23} strokeWidth={1.7} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] opacity-50 font-bold mb-1">Acesso protegido</p>
            <h1 className="text-xl font-black tracking-[0.18em] uppercase">Estoque</h1>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2">Bem-vinda</h2>
          <p className="text-xs opacity-55 leading-relaxed">Entre com as credenciais fornecidas pelo administrador.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block">
            <span className="block text-[9px] font-bold opacity-55 uppercase tracking-widest mb-2">E-mail</span>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="usuario@loja.com"
                autoComplete="username"
                required
                className="control-field w-full py-3.5 pl-11 pr-4 rounded-sm text-sm"
              />
            </div>
          </label>

          <label className="block">
            <span className="block text-[9px] font-bold opacity-55 uppercase tracking-widest mb-2">Senha</span>
            <div className="relative">
              <LockKeyhole size={15} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="password"
                value={senha}
                onChange={event => setSenha(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="control-field w-full py-3.5 pl-11 pr-4 rounded-sm text-sm"
              />
            </div>
          </label>

          {erro && (
            <p role="alert" className="border border-rose-500/30 bg-rose-500/5 text-rose-500 p-3 text-[11px] font-semibold rounded-sm">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="btn-primary w-full p-3.5 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
          >
            <LogIn size={15} />
            {carregando ? 'Conectando...' : 'Entrar no sistema'}
          </button>
        </form>

        <p className="text-center text-[9px] uppercase tracking-widest opacity-35 mt-8">
          Sessão individual e protegida
        </p>
      </main>
    </div>
  )
}

export default Login
