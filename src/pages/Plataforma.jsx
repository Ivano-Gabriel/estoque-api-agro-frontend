import { useCallback, useEffect, useState } from 'react'
import { Building2, LogOut, Plus, ShieldCheck } from 'lucide-react'
import API_URL, { apiFetch as fetch } from '../config/api'

function Plataforma({ token, onLogout }) {
  const [lojas, setLojas] = useState([])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: '', slug: '', financeiroAtivo: false, fotosAtivas: false, whatsapp: '', adminEmail: '', adminSenha: '' })

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch(`${API_URL}/plataforma/lojas`, { headers: { Authorization: `Bearer ${token}` } })
      setLojas(await resposta.json())
    } catch (e) { setErro(e.message) }
  }, [token])

  useEffect(() => { carregar() }, [carregar])

  async function criar(event) {
    event.preventDefault(); setSalvando(true); setErro('')
    try {
      await fetch(`${API_URL}/plataforma/lojas`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setForm({ nome: '', slug: '', financeiroAtivo: false, fotosAtivas: false, whatsapp: '', adminEmail: '', adminSenha: '' })
      await carregar()
    } catch (e) { setErro(e.message) } finally { setSalvando(false) }
  }

  async function atualizar(url, body) {
    setErro('')
    try {
      await fetch(`${API_URL}${url}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      await carregar()
    } catch (e) { setErro(e.message) }
  }

  return <main className="min-h-screen bg-dinamico bg-cover p-4 md:p-8 text-current">
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="glass-panel p-5 flex items-center justify-between">
        <div className="flex items-center gap-3"><ShieldCheck /><div><h1 className="font-black uppercase tracking-widest">Painel da plataforma</h1><p className="text-xs opacity-50">Lojas e assinaturas</p></div></div>
        <button onClick={onLogout} className="btn-secondary p-3"><LogOut size={17} /></button>
      </header>

      <section className="grid md:grid-cols-2 gap-5">
        <form onSubmit={criar} className="glass-panel p-6 space-y-4">
          <h2 className="font-bold uppercase tracking-widest flex items-center gap-2"><Plus size={17}/> Nova loja</h2>
          <input required maxLength="100" className="control-field w-full p-3" placeholder="Nome da loja" value={form.nome} onChange={e => setForm({...form, nome:e.target.value, slug:e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')})}/>
          <input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="control-field w-full p-3" placeholder="identificador-da-loja" value={form.slug} onChange={e => setForm({...form, slug:e.target.value})}/>
          <input className="control-field w-full p-3" placeholder="WhatsApp com DDI e DDD" value={form.whatsapp} onChange={e => setForm({...form, whatsapp:e.target.value})}/>
          <input required type="email" className="control-field w-full p-3" placeholder="E-mail da administradora" value={form.adminEmail} onChange={e => setForm({...form, adminEmail:e.target.value})}/>
          <input required minLength="10" maxLength="72" type="password" className="control-field w-full p-3" placeholder="Senha inicial" value={form.adminSenha} onChange={e => setForm({...form, adminSenha:e.target.value})}/>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.financeiroAtivo} onChange={e => setForm({...form, financeiroAtivo:e.target.checked})}/> Ativar módulo financeiro</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.fotosAtivas} onChange={e => setForm({...form, fotosAtivas:e.target.checked})}/> Ativar fotos de produtos</label>
          {erro && <p role="alert" className="text-rose-500 text-sm">{erro}</p>}
          <button disabled={salvando} className="btn-primary w-full p-3 font-bold uppercase tracking-widest">{salvando ? 'Criando...' : 'Criar loja'}</button>
        </form>

        <div className="glass-panel p-6 space-y-3">
          <h2 className="font-bold uppercase tracking-widest flex items-center gap-2"><Building2 size={17}/> Clientes</h2>
          {lojas.map(loja => <div key={loja.id} className="border border-current/15 p-4 space-y-3">
            <div className="flex justify-between gap-3">
            <div><strong>{loja.nome}</strong><p className="text-xs opacity-50">{loja.slug}</p></div>
            <div className="text-right text-xs"><p>{loja.ativa ? 'Ativa' : 'Bloqueada'}</p><p className="opacity-50">{loja.financeiroAtivo ? 'Com financeiro' : 'Sem financeiro'}</p><p className="opacity-50">{loja.fotosAtivas ? 'Com fotos' : 'Sem fotos'}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider">
              <button className="btn-secondary px-3 py-2" onClick={() => atualizar(`/plataforma/lojas/${loja.id}/status`, { ativa: !loja.ativa })}>{loja.ativa ? 'Bloquear' : 'Reativar'}</button>
              <button className="btn-secondary px-3 py-2" onClick={() => atualizar(`/plataforma/lojas/${loja.id}/configuracao`, { nome: loja.nome, financeiroAtivo: !loja.financeiroAtivo, fotosAtivas: loja.fotosAtivas, whatsapp: loja.whatsapp })}>{loja.financeiroAtivo ? 'Desligar financeiro' : 'Ligar financeiro'}</button>
              <button className="btn-secondary px-3 py-2" onClick={() => atualizar(`/plataforma/lojas/${loja.id}/configuracao`, { nome: loja.nome, financeiroAtivo: loja.financeiroAtivo, fotosAtivas: !loja.fotosAtivas, whatsapp: loja.whatsapp })}>{loja.fotosAtivas ? 'Desligar fotos' : 'Ligar fotos'}</button>
              <button className="btn-secondary px-3 py-2" onClick={() => { const numero = window.prompt('WhatsApp com DDI e DDD:', loja.whatsapp || ''); if (numero !== null) atualizar(`/plataforma/lojas/${loja.id}/configuracao`, { nome: loja.nome, financeiroAtivo: loja.financeiroAtivo, fotosAtivas: loja.fotosAtivas, whatsapp: numero }) }}>Alterar WhatsApp</button>
              <button className="btn-secondary px-3 py-2" onClick={() => { const nome = window.prompt('Nome da loja:', loja.nome); if (nome) atualizar(`/plataforma/lojas/${loja.id}/configuracao`, { nome, financeiroAtivo: loja.financeiroAtivo, fotosAtivas: loja.fotosAtivas, whatsapp: loja.whatsapp }) }}>Renomear</button>
            </div>
          </div>)}
        </div>
      </section>
    </div>
  </main>
}

export default Plataforma
