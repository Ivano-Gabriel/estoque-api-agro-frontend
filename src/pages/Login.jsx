import { useState } from 'react'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)

  async function handleLogin() {
    try {
      const resposta = await fetch('http://localhost:8081/auth/login', {
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
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
      <button onClick={handleLogin}>Entrar</button>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  )
}

export default Login