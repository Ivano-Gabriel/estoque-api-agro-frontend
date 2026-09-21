import { useCallback, useEffect, useState } from 'react'
import API_URL, { apiFetch } from '../config/api'
import useOperacao from '../hooks/useOperacao'

export default function AcessosFuncionarias({ token }) {
  const [usuarios, setUsuarios] = useState([])
  const [erro, setErro] = useState('')
  const [selecionada, setSelecionada] = useState(null)
  const [senha, setSenha] = useState('')
  const { enviando, executar } = useOperacao()
  const carregar = useCallback(async () => {
    try {
      const response = await apiFetch(`${API_URL}/admin/usuarios`, { headers: { Authorization: `Bearer ${token}` } })
      setUsuarios(await response.json()); setErro('')
    } catch (error) { setErro(error.message) }
  }, [token])
  useEffect(() => {
    carregar()
    window.addEventListener('usuarios-alterados', carregar)
    return () => window.removeEventListener('usuarios-alterados', carregar)
  }, [carregar])

  const alterar = (usuario, caminho, method, body) => executar(async () => {
    await apiFetch(`${API_URL}/admin/usuarios/${usuario.id}/${caminho}`, {
      method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {})
    })
    setSenha(''); setSelecionada(null); await carregar()
    alert('Acesso atualizado. As sessões anteriores foram encerradas.')
  })

  return <section className="glass-panel p-6 md:col-span-2 space-y-4">
    <h2 className="font-bold">Acessos das funcionárias</h2>
    <p className="text-sm opacity-70">Bloquear impede o login e mantém o histórico. Encerrar sessões exige um novo login.</p>
    {erro && <p role="alert">{erro} <button className="underline" onClick={carregar}>Tentar novamente</button></p>}
    {!erro && usuarios.length === 0 && <p className="text-sm opacity-70">Nenhuma funcionária cadastrada.</p>}
    {usuarios.map(usuario => <div key={usuario.id} className="border border-current/20 p-4 space-y-3">
      <p className="break-all">{usuario.email} — {usuario.ativo ? 'Ativo' : 'Bloqueado'}</p>
      <div className="flex flex-wrap gap-2">
        <button disabled={enviando} className="btn-secondary p-2 text-sm" onClick={() => {
          if (confirm(`${usuario.ativo ? 'Bloquear' : 'Liberar'} o acesso de ${usuario.email}?`)) alterar(usuario, 'acesso', 'PUT', { ativo: !usuario.ativo })
        }}>{usuario.ativo ? 'Bloquear acesso' : 'Liberar acesso'}</button>
        <button disabled={enviando} className="btn-secondary p-2 text-sm" onClick={() => {
          if (confirm(`Encerrar as sessões de ${usuario.email}?`)) alterar(usuario, 'revogar-sessoes', 'POST')
        }}>Encerrar sessões</button>
        <button disabled={enviando} className="btn-secondary p-2 text-sm" onClick={() => { setSelecionada(usuario.id); setSenha('') }}>Trocar senha</button>
      </div>
      {selecionada === usuario.id && <form className="flex flex-wrap gap-2" onSubmit={event => {
        event.preventDefault(); alterar(usuario, 'senha', 'PUT', { senha })
      }}>
        <input aria-label="Nova senha da funcionária" type="password" autoComplete="new-password" minLength={10} maxLength={72} required value={senha} onChange={event => setSenha(event.target.value)} className="control-field p-2" placeholder="Nova senha (mínimo 10 caracteres)" />
        <button disabled={enviando} className="btn-primary p-2">Salvar senha</button>
      </form>}
    </div>)}
  </section>
}
