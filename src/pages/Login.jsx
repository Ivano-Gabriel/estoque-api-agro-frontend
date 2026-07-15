import { useState } from 'react'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    fetch(import.meta.env.VITE_API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      throw new Error('E-mail ou senha incorretos.')
    })
    .then(token => {
      onLogin(token)
    })
    .catch(err => {
      setErro(err.message)
    })
    .finally(() => {
      setCarregando(false)
    })
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#1e293b',
        padding: '40px',
        borderRadius: '24px',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', margin: '0 0 8px 0' }}>
          Estoque Inteligente
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 32px 0' }}>
          Entre com as suas credenciais de acesso.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {erro && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: '0', fontWeight: '600' }}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontWeight: '700',
              fontSize: '15px',
              cursor: carregando ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s',
              marginTop: '10px'
            }}
          >
            {carregando ? 'Conectando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login