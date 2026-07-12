import { useState } from 'react'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)

  async function handleLogin() {
    try {
      const resposta = await fetch('https://estoque-api-agro.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      if (!resposta.ok) {
        setErro('Email ou senha inválidos.')
        return
      }

      const token = await resposta.text()
      onLogin(token)

    } catch (e) {
      setErro('Erro ao conectar com o servidor.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', gap: '12px' }}>
      <h1>Estoque Agro</h1>
      <input 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)}
        style={{ marginBottom: '12px', width: '320px' }}
        autoComplete="off"
      />
      <input 
        placeholder="Senha" 
        type="password" 
        value={senha} 
        onChange={e => setSenha(e.target.value)}
        style={{ marginBottom: '12px', width: '320px' }}
        autoComplete="off"
      />
      <button className="btn-primary" onClick={handleLogin}>Entrar</button>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  )
}

export default Login