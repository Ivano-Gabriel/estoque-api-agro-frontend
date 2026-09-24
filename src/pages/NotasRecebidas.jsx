import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, ClipboardCheck, FilePlus2, PackagePlus, Printer, X } from 'lucide-react'
import API_URL, { apiFetch } from '../config/api'
import { imprimirNotaRecebida } from '../utils/impressao'

const hoje = () => new Date().toLocaleDateString('sv-SE')
const novoItem = () => ({ id: crypto.randomUUID(), produtoId: '', quantidade: '1', custoUnitario: '' })
const formVazio = () => ({ fornecedor: '', documentoFornecedor: '', numero: '', serie: '', chaveAcesso: '', dataEmissao: '', dataRecebimento: hoje(), valorTotal: '', conferida: false, atualizarEstoque: false, observacoes: '', itens: [] })

export default function NotasRecebidas({ token, loja }) {
  const [notas, setNotas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(formVazio)
  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setErro(''); setCarregando(true)
    try {
      const [resNotas, resProdutos] = await Promise.all([
        apiFetch(`${API_URL}/notas-recebidas`, { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch(`${API_URL}/produtos`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setNotas(await resNotas.json()); setProdutos(await resProdutos.json())
    } catch (e) { setErro(e.message) } finally { setCarregando(false) }
  }, [token])
  useEffect(() => { carregar() }, [carregar])

  function abrir() { setForm(formVazio()); setErro(''); setModal(true) }
  function atualizarItem(id, campo, valor) { setForm(atual => ({ ...atual, itens: atual.itens.map(item => item.id === id ? {...item,[campo]:valor} : item) })) }
  function adicionarItem() { setForm(atual => ({...atual,itens:[...atual.itens,novoItem()]})) }
  function removerItem(id) { setForm(atual => ({...atual,itens:atual.itens.filter(item => item.id !== id)})) }

  async function salvar(event) {
    event.preventDefault(); setSalvando(true); setErro('')
    try {
      const itens = form.itens.filter(item => item.produtoId).map(item => ({ produtoId:Number(item.produtoId), quantidade:Number(item.quantidade), custoUnitario:Number(item.custoUnitario || 0) }))
      await apiFetch(`${API_URL}/notas-recebidas`, { method:'POST', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}, body:JSON.stringify({...form,valorTotal:Number(form.valorTotal || 0),dataEmissao:form.dataEmissao||null,itens}) })
      setModal(false); await carregar()
    } catch (e) { setErro(e.message) } finally { setSalvando(false) }
  }
  async function conferir(nota) {
    try { await apiFetch(`${API_URL}/notas-recebidas/${nota.id}/conferencia`, { method:'PUT', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}, body:JSON.stringify({conferida:!nota.conferida}) }); await carregar() }
    catch (e) { setErro(e.message) }
  }

  return <div className="page-shell max-w-6xl mx-auto space-y-6 pb-32 md:pb-8">
    <header className="page-header"><div><h1>Notas recebidas</h1><p>Conferência de fornecedores, lotes e reposições</p></div><button onClick={abrir} className="btn-primary mobile-action flex items-center justify-center gap-2"><FilePlus2 size={21}/> Registrar nota</button></header>
    <div className="notice-box"><ClipboardCheck size={24}/><div><strong>Controle interno de recebimento</strong><p>Guarde os dados da nota e confira os itens. A impressão desta tela não substitui o documento fiscal original.</p></div></div>
    {erro && <div className="error-box">{erro}</div>}
    {carregando ? <div className="glass-panel empty-state"><ClipboardCheck className="animate-pulse" size={48}/><strong>Carregando notas...</strong></div> : !notas.length ? <div className="glass-panel empty-state"><ClipboardCheck size={48}/><strong>Nenhuma nota recebida</strong><span>Registre a primeira reposição recebida de um fornecedor.</span></div> : <div className="space-y-4">{notas.map(nota => <article key={nota.id} className="glass-panel mobile-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"><div><div className="flex items-center gap-2 flex-wrap"><h2 className="text-xl font-black">{nota.fornecedor}</h2><span className={nota.conferida?'status-ok':'status-pending'}>{nota.conferida?'Conferida':'Pendente'}</span></div><p className="text-base opacity-65 mt-1">Nota {nota.numero}{nota.serie ? ` • Série ${nota.serie}`:''} • Recebida em {new Date(`${nota.dataRecebimento}T12:00:00`).toLocaleDateString('pt-BR')}</p></div><strong className="text-xl">{Number(nota.valorTotal).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></div>
      <div className="grid sm:grid-cols-3 gap-3"><div className="metric-small"><span>Itens ligados</span><strong>{nota.itens.length}</strong></div><div className="metric-small"><span>Estoque</span><strong>{nota.estoqueAtualizado?'Atualizado':'Não alterado'}</strong></div><div className="metric-small"><span>Cadastrada por</span><strong className="truncate">{nota.cadastradaPor}</strong></div></div>
      {nota.itens.length>0 && <div className="border-t border-current/10 pt-3 space-y-2">{nota.itens.map(item => <div key={`${nota.id}-${item.produtoId}`} className="flex justify-between text-base"><span>{item.quantidade} × {item.produto}</span><span>{Number(item.custoUnitario).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div>)}</div>}
      <div className="grid grid-cols-2 gap-3"><button onClick={()=>conferir(nota)} className="btn-secondary mobile-action flex items-center justify-center gap-2"><CheckCircle2 size={19}/>{nota.conferida?'Reabrir':'Marcar conferida'}</button><button onClick={()=>imprimirNotaRecebida(nota,loja?.nome||'Estoque')} className="btn-secondary mobile-action flex items-center justify-center gap-2"><Printer size={19}/> Imprimir</button></div>
    </article>)}</div>}

    {modal && <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/85 sm:p-4"><form onSubmit={salvar} className="glass-panel !bg-[var(--bg-color)] w-full sm:max-w-3xl rounded-t-2xl sm:rounded-sm p-5 sm:p-7 space-y-5 max-h-[95vh] overflow-y-auto">
      <div className="flex justify-between items-center"><div><h2 className="text-2xl font-black">Registrar nota recebida</h2><p className="text-sm opacity-60">Dados do documento entregue pelo fornecedor</p></div><button type="button" onClick={()=>setModal(false)} className="touch-button"><X size={24}/></button></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="field-label sm:col-span-2">Fornecedor<input required maxLength="120" className="control-field" value={form.fornecedor} onChange={e=>setForm({...form,fornecedor:e.target.value})}/></label>
        <label className="field-label">CPF/CNPJ<input inputMode="numeric" className="control-field" value={form.documentoFornecedor} onChange={e=>setForm({...form,documentoFornecedor:e.target.value})}/></label>
        <label className="field-label">Número da nota<input required className="control-field" value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})}/></label>
        <label className="field-label">Série<input className="control-field" value={form.serie} onChange={e=>setForm({...form,serie:e.target.value})}/></label>
        <label className="field-label">Valor total<input required min="0" step="0.01" type="number" className="control-field" value={form.valorTotal} onChange={e=>setForm({...form,valorTotal:e.target.value})}/></label>
        <label className="field-label">Data de emissão<input type="date" className="control-field" value={form.dataEmissao} onChange={e=>setForm({...form,dataEmissao:e.target.value})}/></label>
        <label className="field-label">Data de recebimento<input required type="date" className="control-field" value={form.dataRecebimento} onChange={e=>setForm({...form,dataRecebimento:e.target.value})}/></label>
        <label className="field-label sm:col-span-2">Chave de acesso (44 dígitos{form.atualizarEstoque ? ', obrigatória para atualizar estoque' : ', opcional'})<input required={form.atualizarEstoque} inputMode="numeric" className="control-field font-mono" value={form.chaveAcesso} onChange={e=>setForm({...form,chaveAcesso:e.target.value})}/></label>
      </div>
      <div className="border border-current/15 p-4 space-y-4"><div className="flex justify-between items-center"><div><h3 className="font-black text-lg">Itens da nota</h3><p className="text-sm opacity-60">Opcional, exceto quando atualizar o estoque.</p></div><button type="button" onClick={adicionarItem} className="btn-secondary touch-button"><PackagePlus size={21}/></button></div>{form.itens.map((item,index)=><div key={item.id} className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_100px_130px_52px] gap-2 border-t border-current/10 pt-3"><select required={form.atualizarEstoque} className="control-field" value={item.produtoId} onChange={e=>atualizarItem(item.id,'produtoId',e.target.value)}><option value="">Produto {index+1}</option>{produtos.map(produto=><option key={produto.id} value={produto.id}>{produto.nome}</option>)}</select><input type="number" min="1" step="1" className="control-field" value={item.quantidade} onChange={e=>atualizarItem(item.id,'quantidade',e.target.value)} aria-label="Quantidade"/><input type="number" min="0" step="0.01" className="control-field col-span-1" value={item.custoUnitario} onChange={e=>atualizarItem(item.id,'custoUnitario',e.target.value)} placeholder="Custo/un."/><button type="button" onClick={()=>removerItem(item.id)} className="touch-button border border-rose-500/30 text-rose-500"><X size={18}/></button></div>)}</div>
      <label className={`select-card ${form.atualizarEstoque?'selected':''}`}><input type="checkbox" checked={form.atualizarEstoque} onChange={e=>setForm({...form,atualizarEstoque:e.target.checked})}/><span><strong>Atualizar estoque com os itens</strong><small>Cria as reposições somente uma vez; em lojas com financeiro, também registra seus custos no caixa.</small></span></label>
      <label className="select-card"><input type="checkbox" checked={form.conferida} onChange={e=>setForm({...form,conferida:e.target.checked})}/><span><strong>Já foi conferida</strong><small>Também pode marcar depois.</small></span></label>
      <label className="field-label">Observações<textarea rows="3" maxLength="1000" className="control-field" value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})}/></label>
      {erro && <div className="error-box">{erro}</div>}
      <div className="grid grid-cols-2 gap-3"><button type="button" onClick={()=>setModal(false)} className="btn-secondary mobile-action">Cancelar</button><button disabled={salvando} className="btn-primary mobile-action">{salvando?'Salvando...':'Salvar nota'}</button></div>
    </form></div>}
  </div>
}
