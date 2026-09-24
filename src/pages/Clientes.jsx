import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, Heart, MessageCircle, Pencil, Plus, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import API_URL, { apiFetch } from '../config/api'

const vazio = { nome: '', telefone: '', email: '', observacoes: '', produtoFavoritoIds: [] }

export default function Clientes({ token, role }) {
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [detalhe, setDetalhe] = useState(null)
  const [form, setForm] = useState(vazio)
  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setErro(''); setCarregando(true)
    try {
      const [resClientes, resProdutos] = await Promise.all([
        apiFetch(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch(`${API_URL}/produtos`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setClientes(await resClientes.json())
      setProdutos(await resProdutos.json())
    } catch (e) { setErro(e.message) } finally { setCarregando(false) }
  }, [token])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = useMemo(() => clientes.filter(cliente =>
    `${cliente.nome} ${cliente.telefone || ''}`.toLowerCase().includes(busca.toLowerCase())
  ), [clientes, busca])

  function novo() { setForm(vazio); setDetalhe(null); setErro(''); setModal(true) }
  function editar(cliente) {
    setErro('')
    setForm({ nome: cliente.nome, telefone: cliente.telefone || '', email: cliente.email || '', observacoes: cliente.observacoes || '', produtoFavoritoIds: cliente.favoritos.map(item => item.id) })
    setDetalhe(cliente); setModal(true)
  }
  function alternarFavorito(id) {
    setForm(atual => ({ ...atual, produtoFavoritoIds: atual.produtoFavoritoIds.includes(id) ? atual.produtoFavoritoIds.filter(item => item !== id) : [...atual.produtoFavoritoIds, id] }))
  }
  async function salvar(event) {
    event.preventDefault(); setSalvando(true); setErro('')
    try {
      await apiFetch(`${API_URL}/clientes${detalhe ? `/${detalhe.id}` : ''}`, { method: detalhe ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setModal(false); await carregar()
    } catch (e) { setErro(e.message) } finally { setSalvando(false) }
  }
  async function abrirDetalhe(id) {
    try {
      const resposta = await apiFetch(`${API_URL}/clientes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setDetalhe(await resposta.json())
    } catch (e) { setErro(e.message) }
  }
  async function arquivar(id) {
    if (!confirm('Arquivar este cliente? O histórico de vendas será preservado.')) return
    try { await apiFetch(`${API_URL}/clientes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); setDetalhe(null); await carregar() }
    catch (e) { setErro(e.message) }
  }

  return <div className="page-shell max-w-6xl mx-auto space-y-6 pb-32 md:pb-8">
    <header className="page-header"><div><h1>Clientes</h1><p>Contatos, preferências e histórico de compras</p></div><button onClick={novo} className="btn-primary mobile-action flex items-center justify-center gap-2"><Plus size={21}/> Novo cliente</button></header>
    <div className="glass-panel mobile-panel relative"><Search className="absolute left-7 top-1/2 -translate-y-1/2 opacity-45" size={22}/><input value={busca} onChange={e => setBusca(e.target.value)} className="control-field w-full pl-12 pr-4 py-4 text-base" placeholder="Buscar por nome ou telefone"/></div>
    {erro && <div role="alert" className="error-box">{erro}</div>}
    {carregando ? <div className="glass-panel empty-state"><UserRound className="animate-pulse" size={48}/><strong>Carregando clientes...</strong></div> : !filtrados.length ? <div className="glass-panel empty-state"><UserRound size={48}/><strong>Nenhum cliente encontrado</strong><span>Cadastre o primeiro cliente para ligar vendas e preferências.</span></div> :
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{filtrados.map(cliente => <button key={cliente.id} onClick={() => abrirDetalhe(cliente.id)} className="glass-panel mobile-card text-left space-y-4 hover:border-current/50">
        <div className="flex justify-between gap-3"><div><h2 className="text-xl font-black leading-tight">{cliente.nome}</h2><p className="text-base opacity-60 mt-1">{cliente.telefone || 'Sem telefone'}</p></div><UserRound size={26}/></div>
        <div className="flex flex-wrap gap-2">{cliente.favoritos.slice(0,3).map(item => <span key={item.id} className="chip"><Heart size={13} fill="currentColor"/> {item.nome}</span>)}{!cliente.favoritos.length && <span className="text-sm opacity-45">Nenhum favorito marcado</span>}</div>
      </button>)}</div>}

    {detalhe && !modal && <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/85 sm:p-4"><div className="glass-panel !bg-[var(--bg-color)] w-full sm:max-w-lg rounded-t-2xl sm:rounded-sm p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between"><div><h2 className="text-2xl font-black">{detalhe.nome}</h2><p className="text-base opacity-60 mt-1">{detalhe.telefone || 'Sem telefone cadastrado'}</p></div><button onClick={() => setDetalhe(null)} className="touch-button"><X size={24}/></button></div>
      <div className="grid grid-cols-2 gap-3"><button onClick={() => editar(detalhe)} className="btn-primary mobile-action flex items-center justify-center gap-2"><Pencil size={19}/> Editar</button>{detalhe.telefone && <a className="btn-secondary mobile-action flex items-center justify-center gap-2" href={`https://wa.me/${detalhe.telefone.length <= 11 ? `55${detalhe.telefone}` : detalhe.telefone}`} target="_blank" rel="noreferrer"><MessageCircle size={19}/> WhatsApp</a>}</div>
      {detalhe.observacoes && <section className="detail-section"><h3>Observações</h3><p>{detalhe.observacoes}</p></section>}
      <section className="detail-section"><h3 className="flex items-center gap-2"><Heart size={18}/> Produtos favoritos</h3>{detalhe.favoritos.length ? <div className="flex flex-wrap gap-2 mt-3">{detalhe.favoritos.map(item => <span className="chip" key={item.id}>{item.nome}</span>)}</div> : <p>Nenhum favorito marcado.</p>}</section>
      <section className="detail-section"><h3 className="flex items-center gap-2"><ShoppingBag size={18}/> Mais comprados</h3>{detalhe.maisComprados.length ? <div className="mt-3 space-y-2">{detalhe.maisComprados.map((item, index) => <div key={item.id} className="flex justify-between text-base"><span>{index+1}. {item.nome}</span><strong>{item.quantidade} un.</strong></div>)}</div> : <p>As compras aparecerão aqui quando o cliente for selecionado nas vendas.</p>}</section>
      {role === 'ADMIN' && <button onClick={() => arquivar(detalhe.id)} className="w-full mobile-action border border-rose-500/40 text-rose-500 flex justify-center items-center gap-2"><Archive size={18}/> Arquivar cliente</button>}
    </div></div>}

    {modal && <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/85 sm:p-4"><form onSubmit={salvar} className="glass-panel !bg-[var(--bg-color)] w-full sm:max-w-2xl rounded-t-2xl sm:rounded-sm p-5 sm:p-7 space-y-5 max-h-[94vh] overflow-y-auto">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black">{detalhe ? 'Editar cliente' : 'Novo cliente'}</h2><button type="button" onClick={() => setModal(false)} className="touch-button"><X size={24}/></button></div>
      <div className="grid sm:grid-cols-2 gap-4"><label className="field-label sm:col-span-2">Nome<input required maxLength="120" className="control-field" value={form.nome} onChange={e => setForm({...form,nome:e.target.value})}/></label><label className="field-label">Telefone / WhatsApp<input inputMode="tel" className="control-field" value={form.telefone} onChange={e => setForm({...form,telefone:e.target.value})} placeholder="(82) 99999-9999"/></label><label className="field-label">E-mail opcional<input type="email" className="control-field" value={form.email} onChange={e => setForm({...form,email:e.target.value})}/></label></div>
      <label className="field-label">Observações<textarea rows="3" maxLength="500" className="control-field" value={form.observacoes} onChange={e => setForm({...form,observacoes:e.target.value})} placeholder="Tamanho, preferência, endereço ou detalhe importante"/></label>
      <fieldset><legend className="field-label mb-3">Produtos favoritos</legend><div className="grid sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto">{produtos.map(produto => <label key={produto.id} className={`select-card ${form.produtoFavoritoIds.includes(produto.id) ? 'selected' : ''}`}><input type="checkbox" checked={form.produtoFavoritoIds.includes(produto.id)} onChange={() => alternarFavorito(produto.id)}/><span>{produto.nome}</span></label>)}</div></fieldset>
      {erro && <div className="error-box">{erro}</div>}
      <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setModal(false)} className="btn-secondary mobile-action">Cancelar</button><button disabled={salvando} className="btn-primary mobile-action">{salvando ? 'Salvando...' : 'Salvar cliente'}</button></div>
    </form></div>}
  </div>
}
