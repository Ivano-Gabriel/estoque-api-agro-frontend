import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck, Banknote, Bike, Check, ChefHat, Clock3, Coffee, CookingPot, CreditCard, MapPin, Minus, PackagePlus, Plus, Printer, ReceiptText, Search, Settings2, ShoppingBag, Store, Table2, Trash2, UtensilsCrossed, X, Zap } from 'lucide-react'
import API_URL, { apiFetch, enviarVenda } from '../config/api'
import { imagemProdutoUrl } from '../utils/cloudinary'
import { useDialog } from '../components/dialog-context'
import CaixaOperacional from '../components/CaixaOperacional'

const atendimentos = [
  ['BALCAO', 'Balcão', Store, 'Pede e recebe aqui'],
  ['MESA', 'Mesa', Table2, 'Consome no salão'],
  ['RETIRADA', 'Retirada', ShoppingBag, 'Busca quando ficar pronto'],
  ['ENTREGA', 'Entrega', Bike, 'Vai para o endereço'],
]
const formas = [['PIX', 'PIX'], ['DINHEIRO', 'Dinheiro'], ['CARTAO_DEBITO', 'Débito'], ['CARTAO_CREDITO', 'Crédito'], ['OUTRO', 'Outro']]
const nomesStatus = { RECEBIDO: 'Recebido', EM_PREPARO: 'Em preparo', PRONTO: 'Pronto', SAIU_PARA_ENTREGA: 'Saiu para entrega', FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado' }
const moeda = valor => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const cabecalhos = { Authorization: '' }

function acaoDoPedido(pedido, status) {
  if (status === 'RECEBIDO') return ['EM_PREPARO', 'Começar preparo']
  if (status === 'EM_PREPARO') return ['PRONTO', 'Pedido pronto']
  if (status === 'SAIU_PARA_ENTREGA') return ['FINALIZADO', 'Confirmar entrega e receber']
  if (status !== 'PRONTO') return null
  if (pedido.tipo === 'MESA') return ['FINALIZADO', 'Receber e fechar mesa']
  if (pedido.tipo === 'RETIRADA') return ['FINALIZADO', 'Entregar e receber']
  return ['FINALIZADO', 'Receber e finalizar']
}

function tempo(data) {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(data).getTime()) / 60000))
  return minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)}h ${minutos % 60}min`
}

async function requisicao(caminho, token, options = {}) {
  const resposta = await apiFetch(`${API_URL}${caminho}`, { ...options, headers: { ...cabecalhos, ...options.headers, Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) } })
  return resposta.status === 204 ? null : resposta.json()
}

export default function Lanchonete({ token, loja, role }) {
  const [aba, setAba] = useState('atendimento')
  const [config, setConfig] = useState({ cardapio: [], grupos: [], mesas: [] })
  const [pedidos, setPedidos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [caixaAberto, setCaixaAberto] = useState(!loja?.caixaOperacionalAtivo)

  const carregarConfiguracao = useCallback(async () => {
    const [dados, listaProdutos, listaClientes] = await Promise.all([
      requisicao('/lanchonete/configuracao', token),
      requisicao('/produtos', token),
      requisicao('/clientes', token).catch(() => []),
    ])
    setConfig(dados); setProdutos(listaProdutos); setClientes(listaClientes)
  }, [token])

  const carregarPedidos = useCallback(async (silencioso = false) => {
    try { setPedidos(await requisicao('/lanchonete/pedidos', token)) }
    catch (e) { if (!silencioso) setErro(e.message) }
  }, [token])

  useEffect(() => {
    Promise.all([carregarConfiguracao(), carregarPedidos()]).catch(e => setErro(e.message)).finally(() => setCarregando(false))
  }, [carregarConfiguracao, carregarPedidos])
  useEffect(() => {
    const id = setInterval(() => carregarPedidos(true), 5000)
    return () => clearInterval(id)
  }, [carregarPedidos])

  async function atualizarTudo() { await Promise.all([carregarConfiguracao(), carregarPedidos()]) }

  if (carregando) return <div className="glass-panel empty-state"><CookingPot className="animate-pulse"/><strong>Preparando a lanchonete...</strong></div>
  return <div className="page-shell max-w-[1600px] mx-auto pb-28 md:pb-8">
    <header className="page-header"><div><h1>Lanchonete</h1><p>Venda em poucos passos: anote, prepare e finalize.</p></div><span className="lanchonete-live"><i/> Atualização ao vivo</span></header>
    {erro && <div role="alert" className="error-box mb-4 flex justify-between gap-3"><span>{erro}</span><button onClick={() => setErro('')}><X size={18}/></button></div>}
    <div className="lanchonete-tabs" role="tablist">
      <button onClick={() => setAba('atendimento')} className={aba === 'atendimento' ? 'active' : ''}><UtensilsCrossed/><span><strong>1. Novo pedido</strong><small>Escolher e enviar</small></span></button>
      <button onClick={() => setAba('cozinha')} className={aba === 'cozinha' ? 'active' : ''}><ChefHat/><span><strong>2. Pedidos</strong><small>Preparar e finalizar</small></span>{pedidos.length > 0 && <b>{pedidos.length}</b>}</button>
      {role === 'ADMIN' && <button onClick={() => setAba('config')} className={aba === 'config' ? 'active' : ''}><Settings2/><span><strong>Cardápio</strong><small>Produtos e opções</small></span></button>}
    </div>
    <CaixaOperacional token={token} ativo={loja?.caixaOperacionalAtivo} onChange={setCaixaAberto}/>
    {aba === 'atendimento' && <Atendimento token={token} loja={loja} config={config} clientes={clientes} onCriado={async () => { await atualizarTudo(); setAba('cozinha') }} setErro={setErro}/>} 
    {aba === 'cozinha' && <Cozinha token={token} loja={loja} pedidos={pedidos} atualizar={atualizarTudo} setErro={setErro} caixaAberto={caixaAberto}/>} 
    {aba === 'config' && role === 'ADMIN' && <Configuracao token={token} config={config} produtos={produtos} atualizar={atualizarTudo} setErro={setErro}/>} 
  </div>
}

function Atendimento({ token, loja, config, clientes, onCriado, setErro }) {
  const [tipo, setTipo] = useState('BALCAO')
  const [mesaId, setMesaId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [identificacao, setIdentificacao] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [desconto, setDesconto] = useState('')
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [carrinho, setCarrinho] = useState([])
  const [personalizando, setPersonalizando] = useState(null)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const categorias = useMemo(() => ['Todos', ...new Set(config.cardapio.map(i => i.produto.tipo || 'Outros'))], [config.cardapio])
  const itens = useMemo(() => config.cardapio.filter(i => i.disponivel && (categoria === 'Todos' || (i.produto.tipo || 'Outros') === categoria) && `${i.produto.nome} ${i.nomeCozinha || ''} ${i.produto.tipo || ''}`.toLowerCase().includes(busca.toLowerCase())), [config.cardapio, categoria, busca])
  const subtotal = carrinho.reduce((total, item) => total + item.quantidade * (Number(item.cardapio.produto.preco) + item.opcoes.reduce((s, o) => s + Number(o.produto.preco), 0)), 0)
  const total = Math.max(0, subtotal - Number(desconto || 0))
  const quantidade = carrinho.reduce((s, i) => s + i.quantidade, 0)

  function incluir(item) {
    if (item.grupos?.length) setPersonalizando({ cardapio: item, quantidade: 1, observacoes: '', opcoes: [] })
    else setCarrinho(atual => [...atual, { chave: crypto.randomUUID(), cardapio: item, quantidade: 1, observacoes: '', opcoes: [] }])
  }
  function confirmarPersonalizacao() {
    for (const grupo of personalizando.cardapio.grupos) {
      const n = personalizando.opcoes.filter(o => grupo.opcoes.some(go => go.id === o.id)).length
      if (n < grupo.minimo || n > grupo.maximo) { setErro(`Escolha de ${grupo.minimo} a ${grupo.maximo} opção(ões) em ${grupo.nome}.`); return }
    }
    setCarrinho(atual => [...atual, { ...personalizando, chave: crypto.randomUUID() }]); setPersonalizando(null)
  }
  function alterarQuantidade(chave, delta) { setCarrinho(atual => atual.map(i => i.chave === chave ? { ...i, quantidade: i.quantidade + delta } : i).filter(i => i.quantidade > 0)) }
  function trocarOpcao(grupo, opcao) {
    setPersonalizando(atual => {
      const existe = atual.opcoes.some(o => o.id === opcao.id)
      if (existe) return { ...atual, opcoes: atual.opcoes.filter(o => o.id !== opcao.id) }
      const doGrupo = atual.opcoes.filter(o => grupo.opcoes.some(go => go.id === o.id))
      if (doGrupo.length >= grupo.maximo) {
        if (grupo.maximo === 1) return { ...atual, opcoes: [...atual.opcoes.filter(o => !grupo.opcoes.some(go => go.id === o.id)), opcao] }
        return atual
      }
      return { ...atual, opcoes: [...atual.opcoes, opcao] }
    })
  }
  async function enviar() {
    setErro('')
    if (!carrinho.length) return setErro('Adicione pelo menos um item ao pedido.')
    if (tipo === 'MESA' && !mesaId) return setErro('Escolha uma mesa disponível.')
    if (['RETIRADA', 'ENTREGA'].includes(tipo) && !identificacao.trim()) return setErro('Informe o nome ou identificação do cliente.')
    if (tipo === 'ENTREGA' && !endereco.trim()) return setErro('Informe o endereço da entrega.')
    setEnviando(true)
    try {
      await enviarVenda(`${API_URL}/lanchonete/pedidos`, { tipo, clienteId: clienteId ? Number(clienteId) : null, mesaId: mesaId ? Number(mesaId) : null, identificacao: identificacao.trim() || null, telefone: telefone.trim() || null, endereco: endereco.trim() || null, observacoes: observacoes.trim() || null, desconto: loja.financeiroAtivo ? Number(desconto || 0) : 0, itens: carrinho.map(i => ({ itemCardapioId: i.cardapio.id, quantidade: i.quantidade, observacoes: i.observacoes || null, opcaoIds: i.opcoes.map(o => o.id) })) }, token)
      setCarrinho([]); setMesaId(''); setClienteId(''); setIdentificacao(''); setTelefone(''); setEndereco(''); setObservacoes(''); setDesconto(''); setCarrinhoAberto(false)
      await onCriado()
    } catch (e) { setErro(e.message) } finally { setEnviando(false) }
  }

  const resumo = <div className="lanchonete-carrinho glass-panel !bg-[var(--bg-color)]">
    <div className="flex items-center justify-between"><div><small className="step-kicker">Passo 3</small><h2>Confira o pedido</h2><p>{quantidade} {quantidade === 1 ? 'item' : 'itens'}</p></div><button className="touch-button xl:hidden" onClick={() => setCarrinhoAberto(false)}><X/></button></div>
    <div className="lanchonete-carrinho-itens">{!carrinho.length ? <div className="empty-state !min-h-44"><Coffee/><strong>Pedido vazio</strong><span>Toque no cardápio para começar.</span></div> : carrinho.map(item => <div className="lanchonete-carrinho-item" key={item.chave}><div className="min-w-0"><strong>{item.cardapio.nomeCozinha || item.cardapio.produto.nome}</strong>{item.opcoes.length > 0 && <p>{item.opcoes.map(o => o.produto.nome).join(', ')}</p>}{item.observacoes && <p>“{item.observacoes}”</p>}{loja.financeiroAtivo && <span>{moeda((Number(item.cardapio.produto.preco) + item.opcoes.reduce((s,o) => s + Number(o.produto.preco), 0)) * item.quantidade)}</span>}</div><div className="quantity-control"><button onClick={() => alterarQuantidade(item.chave, -1)}><Minus/></button><b>{item.quantidade}</b><button onClick={() => alterarQuantidade(item.chave, 1)}><Plus/></button><button className="text-rose-500" onClick={() => setCarrinho(c => c.filter(i => i.chave !== item.chave))}><Trash2/></button></div></div>)}</div>
    <div className="space-y-3 border-t border-current/10 pt-4">
      <label className="field-label">Cliente cadastrado (opcional)<select className="control-field" value={clienteId} onChange={e => setClienteId(e.target.value)}><option value="">Consumidor não identificado</option>{clientes.map(c => <option value={c.id} key={c.id}>{c.nome}</option>)}</select></label>
      {loja.financeiroAtivo && <label className="field-label">Desconto no pedido<input className="control-field" type="number" inputMode="decimal" min="0" max={subtotal} step="0.01" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="R$ 0,00"/></label>}
      <label className="field-label">Observação geral<textarea className="control-field" rows="2" maxLength="500" value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Ex.: enviar talheres"/></label>
      {loja.financeiroAtivo && <div className="flex justify-between text-2xl font-black"><span>Total</span><span>{moeda(total)}</span></div>}
      <button disabled={!carrinho.length || enviando} className="btn-primary mobile-action w-full flex items-center justify-center gap-2" onClick={enviar}><ChefHat/>{enviando ? 'Enviando com segurança...' : 'Enviar pedido para preparo'}</button>
      <p className="action-help">Depois, acompanhe o pedido na aba <b>Pedidos</b>.</p>
    </div>
  </div>

  return <>
    <div className="lanchonete-atendimento">
      <section className="space-y-4 min-w-0">
        <div className="glass-panel mobile-panel space-y-4"><div className="guided-title"><span>1</span><div><h2>Como o cliente vai receber?</h2><p>Escolha apenas uma opção.</p></div></div><div className="atendimento-tipos">{atendimentos.map(([id, nome, Icon, descricao]) => <button key={id} onClick={() => { setTipo(id); if (id !== 'MESA') setMesaId('') }} className={tipo === id ? 'active' : ''}><Icon/><span><b>{nome}</b><small>{descricao}</small></span>{tipo === id && <Check className="tipo-check"/>}</button>)}</div>
          {tipo === 'MESA' && <div><p className="field-label mb-2">Qual mesa?</p><div className="mesa-grid">{config.mesas.filter(m => m.ativa).map(m => <button disabled={m.ocupada} onClick={() => setMesaId(String(m.id))} className={mesaId === String(m.id) ? 'active' : ''} key={m.id}><Table2/><b>{m.nome}</b><small>{m.ocupada ? 'Ocupada' : `${m.lugares} lugares`}</small></button>)}</div></div>}
          {['RETIRADA', 'ENTREGA'].includes(tipo) && <div className="grid sm:grid-cols-2 gap-3"><label className="field-label">Nome do cliente<input className="control-field" maxLength="80" value={identificacao} onChange={e => setIdentificacao(e.target.value)}/></label><label className="field-label">Telefone<input className="control-field" maxLength="20" inputMode="tel" value={telefone} onChange={e => setTelefone(e.target.value)}/></label>{tipo === 'ENTREGA' && <label className="field-label sm:col-span-2">Endereço completo<input className="control-field" maxLength="300" value={endereco} onChange={e => setEndereco(e.target.value)}/></label>}</div>}
        </div>
        <div className="glass-panel mobile-panel space-y-3"><div className="guided-title"><span>2</span><div><h2>Toque nos itens para adicionar</h2><p>Use a busca se o cardápio for grande.</p></div></div><div className="flex flex-col sm:flex-row gap-3"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"/><input className="control-field w-full !pl-12" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar lanche, bebida..."/></label><div className="category-scroll">{categorias.map(c => <button className={categoria === c ? 'active' : ''} onClick={() => setCategoria(c)} key={c}>{c}</button>)}</div></div></div>
        {!itens.length ? <div className="glass-panel empty-state"><UtensilsCrossed/><strong>Nenhum item disponível</strong><span>A administradora precisa montar o cardápio.</span></div> : <div className="cardapio-grid">{itens.map(item => <button onClick={() => incluir(item)} className="cardapio-item glass-panel" key={item.id}>{item.destaque && <span className="cardapio-destaque">Mais pedido</span>}<div className="cardapio-imagem">{item.produto.imagemUrl ? <img src={imagemProdutoUrl(item.produto.imagemUrl, 500)} alt=""/> : <CookingPot/>}</div><div><small>{item.produto.tipo || item.estacao}</small><h2>{item.nomeCozinha || item.produto.nome}</h2><p><Clock3/> {item.tempoPreparoMinutos || 0} min • {item.estacao}</p>{loja.financeiroAtivo && <strong>{moeda(item.produto.preco)}</strong>}</div><span className="cardapio-add"><Plus/></span></button>)}</div>}
      </section><aside className="hidden xl:block">{resumo}</aside>
    </div>
    <button className="lanchonete-mobile-cart xl:hidden" onClick={() => setCarrinhoAberto(true)}><span><ShoppingBag/><b>Ver pedido • {quantidade} {quantidade === 1 ? 'item' : 'itens'}</b></span>{loja.financeiroAtivo && <strong>{moeda(total)}</strong>}</button>
    {carrinhoAberto && <div className="bottom-sheet" onClick={() => setCarrinhoAberto(false)}><div onClick={e => e.stopPropagation()}>{resumo}</div></div>}
    {personalizando && <Personalizacao estado={personalizando} setEstado={setPersonalizando} trocar={trocarOpcao} confirmar={confirmarPersonalizacao} loja={loja}/>} 
  </>
}

function Personalizacao({ estado, setEstado, trocar, confirmar, loja }) {
  return <div className="bottom-sheet sm:items-center" onClick={() => setEstado(null)}><div className="glass-panel !bg-[var(--bg-color)] lanchonete-modal" onClick={e => e.stopPropagation()}><div className="flex justify-between gap-4"><div><small className="uppercase opacity-50 font-bold">Personalize</small><h2 className="text-2xl font-black">{estado.cardapio.nomeCozinha || estado.cardapio.produto.nome}</h2></div><button className="touch-button" onClick={() => setEstado(null)}><X/></button></div>
    <div className="space-y-5 overflow-y-auto">{estado.cardapio.grupos.map(grupo => <section key={grupo.id}><div className="flex justify-between gap-3 mb-2"><div><strong>{grupo.nome}</strong><p className="text-xs opacity-55">Escolha de {grupo.minimo} a {grupo.maximo}</p></div>{grupo.minimo > 0 && <span className="required-chip">Obrigatório</span>}</div><div className="space-y-2">{grupo.opcoes.filter(o => o.ativo).map(opcao => { const selecionada = estado.opcoes.some(o => o.id === opcao.id); return <button onClick={() => trocar(grupo, opcao)} className={`opcao-adicional ${selecionada ? 'active' : ''}`} key={opcao.id}><span>{selecionada ? <Check/> : <Plus/>}</span><b>{opcao.produto.nome}</b>{loja.financeiroAtivo && <strong>+ {moeda(opcao.produto.preco)}</strong>}</button> })}</div></section>)}<label className="field-label">Observação deste item<textarea maxLength="300" rows="2" className="control-field" value={estado.observacoes} onChange={e => setEstado({ ...estado, observacoes: e.target.value })} placeholder="Ex.: sem cebola, cortar ao meio"/></label></div>
    <button className="btn-primary mobile-action w-full" onClick={confirmar}>Adicionar ao pedido</button></div></div>
}

function Cozinha({ token, loja, pedidos, atualizar, setErro, caixaAberto }) {
  const [pagando, setPagando] = useState(null)
  const [concluido, setConcluido] = useState(null)
  const [forma, setForma] = useState('PIX')
  const [recebido, setRecebido] = useState('')
  const [dividido, setDividido] = useState(false)
  const [pagamentos, setPagamentos] = useState({ PIX: '', DINHEIRO: '', CARTAO_DEBITO: '', CARTAO_CREDITO: '', OUTRO: '' })
  const [processando, setProcessando] = useState(false)
  const [historico, setHistorico] = useState(false)
  const [pedidosHistoricos, setPedidosHistoricos] = useState([])
  const { confirmar, solicitar } = useDialog()
  const colunas = ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'SAIU_PARA_ENTREGA']
  const listaPagamentos = formas.map(([id]) => ({ forma: id, valor: Number(pagamentos[id] || 0) })).filter(p => p.valor > 0)
  const somaPagamentos = listaPagamentos.reduce((s, p) => s + p.valor, 0)
  const parteDinheiro = dividido ? (listaPagamentos.find(p => p.forma === 'DINHEIRO')?.valor || 0) : (forma === 'DINHEIRO' ? Number(pagando?.total || 0) : 0)
  async function abrirHistorico() {
    setHistorico(true)
    try { setPedidosHistoricos(await requisicao('/lanchonete/pedidos?historico=true', token)) } catch (e) { setErro(e.message) }
  }

  async function mudar(pedido, status) {
    if (status === 'FINALIZADO') {
      if (loja.caixaOperacionalAtivo && !caixaAberto) { setErro('Abra seu caixa antes de receber o pedido.'); return }
      setForma('PIX'); setRecebido(''); setDividido(false); setPagamentos({ PIX: '', DINHEIRO: '', CARTAO_DEBITO: '', CARTAO_CREDITO: '', OUTRO: '' }); setPagando(pedido); return
    }
    setProcessando(true); setErro('')
    try { await requisicao(`/lanchonete/pedidos/${pedido.id}/status`, token, { method: 'PUT', body: JSON.stringify({ status }) }); await atualizar() }
    catch (e) { setErro(e.message) } finally { setProcessando(false) }
  }
  async function pagar() {
    if (loja.financeiroAtivo && dividido && Math.abs(somaPagamentos - Number(pagando.total)) > 0.009) { setErro(`Distribua exatamente ${moeda(pagando.total)} entre as formas de pagamento.`); return }
    if (loja.financeiroAtivo && parteDinheiro > 0 && Number(recebido || 0) < parteDinheiro) { setErro('O dinheiro recebido é menor que a parte paga em dinheiro.'); return }
    setProcessando(true); setErro('')
    try {
      const pedidoFinalizado = await requisicao(`/lanchonete/pedidos/${pagando.id}/pagamento`, token, { method: 'POST', body: JSON.stringify({ formaPagamento: loja.financeiroAtivo ? forma : 'NAO_INFORMADO', valorRecebido: loja.financeiroAtivo && parteDinheiro > 0 ? Number(recebido || 0) : null, pagamentos: loja.financeiroAtivo && dividido ? listaPagamentos : null }) })
      const pagamentosRegistrados = !loja.financeiroAtivo ? [] : dividido ? listaPagamentos : [{ forma, valor: Number(pagando.total) }]
      setConcluido({ pedido: pedidoFinalizado || pagando, pagamentos: pagamentosRegistrados, recebido: Number(recebido || 0), troco: parteDinheiro > 0 ? Math.max(0, Number(recebido || 0) - parteDinheiro) : 0 })
      setPagando(null); setRecebido(''); setDividido(false); setPagamentos({ PIX: '', DINHEIRO: '', CARTAO_DEBITO: '', CARTAO_CREDITO: '', OUTRO: '' }); await atualizar()
    }
    catch (e) { setErro(e.message) } finally { setProcessando(false) }
  }
  async function cancelar(pedido) {
    if (!await confirmar(`Cancelar o pedido #${pedido.numero}? Os ingredientes consumidos voltarão ao estoque.`, 'Cancelar pedido')) return
    const motivo = await solicitar('Informe o motivo do cancelamento.', '', 'Motivo obrigatório')
    if (!motivo) return
    try { await requisicao(`/lanchonete/pedidos/${pedido.id}/cancelamento`, token, { method: 'PUT', body: JSON.stringify({ motivo }) }); await atualizar() } catch (e) { setErro(e.message) }
  }

  if (historico) return <div className="space-y-4"><div className="section-heading"><div><h2>Histórico de pedidos</h2><p>Últimos 100 pedidos, incluindo cancelados.</p></div><button className="btn-secondary mobile-action !w-auto" onClick={() => setHistorico(false)}>Voltar à cozinha</button></div><div className="historico-pedidos">{pedidosHistoricos.map(p => <article className="glass-panel" key={p.id}><div><small>#{p.numero} • {new Date(p.criadoEm).toLocaleString('pt-BR')}</small><h3>{p.tipo === 'MESA' ? p.mesa : p.identificacao || atendimentos.find(a=>a[0]===p.tipo)?.[1]}</h3><p>{p.itens.map(i=>`${i.quantidade}× ${i.nome}`).join(' • ')}</p></div><div><span className={`pedido-status status-${p.status.toLowerCase()}`}>{nomesStatus[p.status]}</span>{loja.financeiroAtivo && <strong>{moeda(p.total)}</strong>}<button className="touch-button" onClick={() => imprimirPedido(p, loja.nome)}><Printer/></button></div></article>)}</div></div>
  if (!pedidos.length) return <div className="space-y-4"><div className="flex justify-end"><button className="btn-secondary mobile-action !w-auto" onClick={abrirHistorico}><ReceiptText/> Ver histórico</button></div><div className="glass-panel empty-state cozinha-vazia"><ChefHat/><strong>Nenhum pedido esperando</strong><span>Quando um pedido for enviado, ele aparecerá aqui automaticamente.</span></div>{concluido && <ConclusaoPedido dados={concluido} nomeLoja={loja.nome} financeiroAtivo={loja.financeiroAtivo} fechar={() => setConcluido(null)}/>}</div>
  return <><div className="kds-guide glass-panel"><div><span>1</span><b>Recebido</b></div><ArrowRight/><div><span>2</span><b>Preparar</b></div><ArrowRight/><div><span>3</span><b>Receber e finalizar</b></div><button className="btn-secondary" onClick={abrirHistorico}><ReceiptText/> Histórico</button></div><div className="kds-board">{colunas.map(status => { const lista = pedidos.filter(p => p.status === status); return <section className={`kds-column status-${status.toLowerCase()}`} key={status}><header><span>{nomesStatus[status]}</span><b>{lista.length}</b></header><div>{lista.map(p => { const acao = acaoDoPedido(p, status); return <article className="kds-ticket glass-panel" key={p.id}><div className="kds-ticket-head"><div><small>Pedido</small><h2>#{p.numero}</h2></div><span><Clock3/>{tempo(p.criadoEm)}</span></div><div className="kds-identificacao"><b>{p.tipo === 'MESA' ? p.mesa : p.identificacao || atendimentos.find(a => a[0] === p.tipo)?.[1]}</b><small>{atendimentos.find(a => a[0] === p.tipo)?.[1]}</small>{p.telefone && <span>{p.telefone}</span>}{p.endereco && <span><MapPin/> {p.endereco}</span>}</div><div className="kds-itens">{p.itens.map(item => <div key={item.id}><strong><b>{item.quantidade}×</b> {item.nome}</strong>{item.adicionais?.map((a, idx) => <p key={idx}>+ {a.quantidade > 1 ? `${a.quantidade}× ` : ''}{a.nome}</p>)}{item.observacoes && <em>Obs.: {item.observacoes}</em>}<small>{item.estacao}</small></div>)}</div>{p.observacoes && <div className="kds-observacao">Obs. geral: {p.observacoes}</div>}<div className="kds-ticket-actions"><button onClick={() => imprimirPedido(p, loja.nome)} className="btn-secondary" title="Imprimir comanda para preparo"><Printer/></button>{status === 'PRONTO' && p.tipo === 'ENTREGA' && <button disabled={processando} onClick={() => mudar(p, 'SAIU_PARA_ENTREGA')} className="btn-secondary"><Bike/> Saiu para entrega</button>}{acao && !(status === 'PRONTO' && p.tipo === 'ENTREGA') && <button disabled={processando} onClick={() => mudar(p, acao[0])} className="btn-primary"><Check/> {acao[1]}</button>}<button onClick={() => cancelar(p)} className="btn-danger-icon" title="Cancelar pedido"><Trash2/></button></div></article>})}</div></section> })}</div>
    {pagando && <div className="bottom-sheet sm:items-center" onClick={() => setPagando(null)}><div className="glass-panel !bg-[var(--bg-color)] lanchonete-modal payment-finish" onClick={e => e.stopPropagation()}><div className="flex justify-between"><div><small>Último passo</small><h2 className="text-3xl font-black">Finalizar pedido #{pagando.numero}</h2><p>{pagando.tipo === 'ENTREGA' ? 'Confirme o pagamento da entrega.' : pagando.tipo === 'MESA' ? 'Receba e feche a mesa.' : pagando.tipo === 'RETIRADA' ? 'Entregue o pedido e registre o pagamento.' : 'Registre o pagamento do balcão.'}</p></div><button className="touch-button" onClick={() => setPagando(null)}><X/></button></div>{loja.financeiroAtivo ? <><div className="payment-total"><span>Total a receber</span><strong>{moeda(pagando.total)}</strong></div><div><strong>Como o cliente pagou?</strong><p className="action-help !text-left">Escolha uma forma ou ative a divisão.</p></div><label className="toggle-card"><input type="checkbox" checked={dividido} onChange={e => { setDividido(e.target.checked); setRecebido('') }}/><span><b>Usou mais de uma forma?</b><small>Ex.: parte no PIX e parte no cartão</small></span></label>{dividido ? <div className="space-y-2">{formas.map(([id,nome]) => <label className="split-payment-row" key={id}><span>{id === 'PIX' ? <Zap/> : id === 'DINHEIRO' ? <Banknote/> : <CreditCard/>}<b>{nome}</b></span><input aria-label={`Valor em ${nome}`} className="control-field" type="number" inputMode="decimal" min="0" step="0.01" value={pagamentos[id]} onChange={e => setPagamentos({...pagamentos,[id]:e.target.value})} placeholder="R$ 0,00"/></label>)}<div className={`split-total ${Math.abs(somaPagamentos-Number(pagando.total))<.009?'ok':''}`}><span>Informado</span><strong>{moeda(somaPagamentos)} de {moeda(pagando.total)}</strong></div></div> : <div className="grid grid-cols-2 gap-2">{formas.map(([id, nome]) => <button className={`pdv-payment ${forma === id ? 'selected' : ''}`} onClick={() => setForma(id)} key={id}>{id === 'PIX' ? <Zap/> : id === 'DINHEIRO' ? <Banknote/> : <CreditCard/>}{nome}</button>)}</div>}{parteDinheiro > 0 && <label className="field-label">Quanto o cliente entregou em dinheiro?<input autoFocus className="control-field" type="number" inputMode="decimal" min={parteDinheiro} step="0.01" value={recebido} onChange={e => setRecebido(e.target.value)} placeholder={moeda(parteDinheiro)}/>{Number(recebido) >= parteDinheiro && <span className="change-highlight">Troco: {moeda(Number(recebido) - parteDinheiro)}</span>}</label>}</> : <div className="info-box">O pedido será concluído sem registrar valores. O estoque ainda será atualizado normalmente.</div>}<button disabled={processando || (loja.financeiroAtivo && parteDinheiro > 0 && Number(recebido) < parteDinheiro) || (loja.financeiroAtivo && dividido && Math.abs(somaPagamentos-Number(pagando.total))>.009)} onClick={pagar} className="btn-primary mobile-action w-full"><BadgeCheck/> {processando ? 'Finalizando...' : 'Confirmar e finalizar pedido'}</button></div></div>}
    {concluido && <ConclusaoPedido dados={concluido} nomeLoja={loja.nome} financeiroAtivo={loja.financeiroAtivo} fechar={() => setConcluido(null)}/>}
  </>
}

function ConclusaoPedido({ dados, nomeLoja, financeiroAtivo, fechar }) {
  const { pedido, pagamentos, troco } = dados
  return <div className="bottom-sheet sm:items-center" onClick={fechar}><div className="glass-panel !bg-[var(--bg-color)] lanchonete-modal finish-success" onClick={e => e.stopPropagation()}>
    <div className="finish-icon"><BadgeCheck/></div>
    <div className="text-center"><small>Venda concluída</small><h2>Pedido #{pedido.numero} finalizado!</h2><p>{financeiroAtivo ? 'Pagamento registrado, caixa e estoque atualizados.' : 'Pedido encerrado e estoque atualizado.'}</p></div>
    {financeiroAtivo && <div className="finish-summary"><span>Total recebido</span><strong>{moeda(pedido.total)}</strong>{pagamentos.map(p => <small key={p.forma}>{formas.find(f => f[0] === p.forma)?.[1] || p.forma}: {moeda(p.valor)}</small>)}{troco > 0 && <b>Troco entregue: {moeda(troco)}</b>}</div>}
    <button className="btn-secondary mobile-action w-full" onClick={() => imprimirComprovante(dados, nomeLoja, financeiroAtivo)}><Printer/> Imprimir comprovante</button>
    <button className="btn-primary mobile-action w-full" onClick={fechar}><Check/> Pronto, fechar</button>
    <p className="action-help">O comprovante é opcional e não é uma nota fiscal.</p>
  </div></div>
}

function imprimirComprovante({ pedido, pagamentos, troco }, nomeLoja, financeiroAtivo) {
  const janela = window.open('', '_blank', 'width=420,height=720')
  if (!janela) return
  const escapar = texto => String(texto || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[c])
  const itens = (pedido.itens || []).map(i => `<div class="item"><div><b>${i.quantidade}x ${escapar(i.nome)}</b>${(i.adicionais || []).map(a => `<small>+ ${a.quantidade || 1}x ${escapar(a.nome)}</small>`).join('')}</div>${financeiroAtivo ? `<b>${moeda(i.subtotal)}</b>` : ''}</div>`).join('')
  const pagamentosHtml = pagamentos.map(p => `<div class="row"><span>${escapar(formas.find(f => f[0] === p.forma)?.[1] || p.forma)}</span><b>${moeda(p.valor)}</b></div>`).join('')
  janela.document.write(`<!doctype html><html><head><title>Comprovante #${pedido.numero}</title><style>@page{size:80mm auto;margin:4mm}body{font:13px monospace;margin:0}.center{text-align:center}h1{font-size:19px;margin:4px}p{margin:4px 0}.linha{border-top:1px dashed #000;margin:10px 0}.item,.row{display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px dashed #000}.item small{display:block;margin-top:3px}.total{font-size:17px;font-weight:bold}.aviso{margin-top:12px;text-align:center;font-size:11px}button{width:100%;padding:10px;margin-top:12px}@media print{button{display:none}}</style></head><body><div class="center"><h1>${escapar(nomeLoja)}</h1><b>COMPROVANTE NÃO FISCAL</b><p>Pedido #${pedido.numero}</p><p>${new Date().toLocaleString('pt-BR')}</p></div><div class="linha"></div>${itens}${financeiroAtivo ? `<div class="linha"></div><div class="row total"><span>TOTAL</span><b>${moeda(pedido.total)}</b></div>${pagamentosHtml}${troco > 0 ? `<div class="row"><span>Troco</span><b>${moeda(troco)}</b></div>` : ''}` : ''}<p class="aviso">Documento sem valor fiscal<br>Obrigado pela preferência!</p><button onclick="print()">Imprimir</button><script>window.onload=()=>window.print()</script></body></html>`)
  janela.document.close()
}

function imprimirPedido(pedido, nomeLoja) {
  const janela = window.open('', '_blank', 'width=420,height=720')
  if (!janela) return
  const escapar = texto => String(texto || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[c])
  const itens = pedido.itens.map(i => `<div class="item"><b>${i.quantidade}x ${escapar(i.nome)}</b>${(i.adicionais || []).map(a => `<div>+ ${a.quantidade}x ${escapar(a.nome)}</div>`).join('')}${i.observacoes ? `<strong>OBS: ${escapar(i.observacoes)}</strong>` : ''}</div>`).join('')
  janela.document.write(`<!doctype html><html><head><title>Pedido #${pedido.numero}</title><style>@page{size:80mm auto;margin:4mm}body{font:14px monospace;margin:0}.center{text-align:center}h1{font-size:20px;margin:4px}.linha{border-top:1px dashed #000;margin:10px 0}.item{padding:7px 0;border-bottom:1px dashed #000}.item strong{display:block;margin-top:4px;font-size:13px}.meta{margin:4px 0;font-weight:bold}@media print{button{display:none}}</style></head><body><div class="center"><h1>${escapar(nomeLoja)}</h1><b>COMANDA #${pedido.numero}</b><div>${new Date(pedido.criadoEm).toLocaleString('pt-BR')}</div></div><div class="linha"></div><div class="meta">${escapar(pedido.tipo === 'MESA' ? pedido.mesa : pedido.identificacao || pedido.tipo)}</div>${pedido.endereco ? `<div>${escapar(pedido.endereco)}</div>` : ''}${itens}${pedido.observacoes ? `<p><b>OBS. GERAL:</b> ${escapar(pedido.observacoes)}</p>` : ''}<div class="linha"></div><button onclick="print()">Imprimir</button><script>window.onload=()=>window.print()</script></body></html>`)
  janela.document.close()
}

function Configuracao({ token, config, produtos, atualizar, setErro }) {
  const [secao, setSecao] = useState('itens')
  const [editandoItem, setEditandoItem] = useState(null)
  const [editandoGrupo, setEditandoGrupo] = useState(null)
  const [mesaForm, setMesaForm] = useState({ nome: '', lugares: 4, ativa: true, ordem: 0 })
  const [salvando, setSalvando] = useState(false)
  async function salvar(caminho, metodo, body) { setSalvando(true); setErro(''); try { await requisicao(caminho, token, { method: metodo, body: JSON.stringify(body) }); await atualizar(); return true } catch (e) { setErro(e.message); return false } finally { setSalvando(false) } }
  async function criarMesa(e) { e.preventDefault(); if (await salvar('/lanchonete/mesas', 'POST', { ...mesaForm, lugares: Number(mesaForm.lugares), ordem: Number(mesaForm.ordem) })) setMesaForm({ nome: '', lugares: 4, ativa: true, ordem: 0 }) }
  async function alternarMesa(m) { await salvar(`/lanchonete/mesas/${m.id}`, 'PUT', { nome: m.nome, lugares: m.lugares, ativa: !m.ativa, ordem: m.ordem }) }
  return <div className="config-lanchonete"><aside className="glass-panel config-lanchonete-nav"><h2>Montar cardápio</h2>{[['itens','1. Produtos vendidos',UtensilsCrossed],['adicionais','2. Opções e extras',PackagePlus],['mesas','3. Mesas',Table2]].map(([id,nome,Icon]) => <button className={secao === id ? 'active' : ''} onClick={() => setSecao(id)} key={id}><Icon/>{nome}</button>)}</aside><section className="min-w-0">
    {!config.cardapio.length && secao === 'itens' && <div className="onboarding-card glass-panel"><div className="guided-title"><span>1</span><div><h2>Comece pelo produto vendido</h2><p>Cadastre os produtos no estoque e depois escolha quais aparecem no cardápio.</p></div></div><ol><li><b>Produto:</b> define nome, foto e preço.</li><li><b>Ingredientes:</b> saem do estoque a cada venda.</li><li><b>Opções:</b> são extras como molho, tamanho ou adicional.</li></ol></div>}
    {secao === 'itens' && <div className="space-y-4"><div className="section-heading"><div><h2>Produtos vendidos</h2><p>Escolha o que aparece para venda e o que deve sair do estoque.</p></div><button className="btn-primary" onClick={() => setEditandoItem({ produtoId: '', nomeCozinha: '', estacao: 'Cozinha', tempoPreparoMinutos: 10, disponivel: true, destaque: false, baixaProdutoFinal: false, ordem: config.cardapio.length, ingredientes: [], grupoIds: [] })}><Plus/> Adicionar ao cardápio</button></div><div className="config-card-grid">{config.cardapio.map(item => <article className="glass-panel config-card" key={item.id}><div><small>Preparo: {item.estacao}</small><h3>{item.nomeCozinha || item.produto.nome}</h3><p>{item.baixaProdutoFinal ? 'Baixa o produto pronto' : `${item.ingredientes.length} ingrediente(s)`} • {item.grupos.length} opção(ões)</p></div><div><span className={item.disponivel ? 'status-ok' : 'status-off'}>{item.disponivel ? 'À venda' : 'Pausado'}</span><button className="btn-secondary" onClick={() => setEditandoItem({ id: item.id, produtoId: item.produto.id, nomeCozinha: item.nomeCozinha || '', estacao: item.estacao, tempoPreparoMinutos: item.tempoPreparoMinutos, disponivel: item.disponivel, destaque: item.destaque, baixaProdutoFinal: item.baixaProdutoFinal, ordem: item.ordem, ingredientes: item.ingredientes.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade })), grupoIds: item.grupos.map(g => g.id) })}>Editar</button></div></article>)}</div></div>}
    {secao === 'adicionais' && <div className="space-y-4"><div className="section-heading"><div><h2>Opções e extras</h2><p>Crie escolhas simples, como tamanho, ponto da carne, molho ou adicional.</p></div><button className="btn-primary" onClick={() => setEditandoGrupo({ nome: '', minimo: 0, maximo: 1, obrigatorio: false, ativo: true, ordem: config.grupos.length, opcoes: [] })}><Plus/> Nova opção</button></div><div className="config-card-grid">{config.grupos.map(g => <article className="glass-panel config-card" key={g.id}><div><small>{g.obrigatorio ? 'Cliente precisa escolher' : 'Escolha opcional'} • de {g.minimo} a {g.maximo}</small><h3>{g.nome}</h3><p>{g.opcoes.length} escolha(s)</p></div><div><span className={g.ativo ? 'status-ok' : 'status-off'}>{g.ativo ? 'Ativa' : 'Pausada'}</span><button className="btn-secondary" onClick={() => setEditandoGrupo({ id: g.id, nome: g.nome, minimo: g.minimo, maximo: g.maximo, obrigatorio: g.obrigatorio, ativo: g.ativo, ordem: g.ordem, opcoes: g.opcoes.map(o => ({ produtoId: o.produto.id, ingredienteId: o.ingredienteId || '', quantidadeInsumo: o.quantidadeInsumo, ativo: o.ativo, ordem: o.ordem })) })}>Editar</button></div></article>)}</div></div>}
    {secao === 'mesas' && <div className="space-y-5"><div className="section-heading"><div><h2>Mesas</h2><p>Cadastre o salão e veja ocupação durante o atendimento.</p></div></div><form onSubmit={criarMesa} className="glass-panel mobile-panel grid sm:grid-cols-[1fr_140px_auto] gap-3 items-end"><label className="field-label">Nome da mesa<input required maxLength="40" className="control-field" value={mesaForm.nome} onChange={e => setMesaForm({...mesaForm,nome:e.target.value})} placeholder="Mesa 01"/></label><label className="field-label">Lugares<input required min="1" max="100" type="number" className="control-field" value={mesaForm.lugares} onChange={e => setMesaForm({...mesaForm,lugares:e.target.value})}/></label><button disabled={salvando} className="btn-primary mobile-action"><Plus/> Adicionar</button></form><div className="mesa-grid">{config.mesas.map(m => <button onClick={() => alternarMesa(m)} className={m.ativa ? 'active' : ''} key={m.id}><Table2/><b>{m.nome}</b><small>{m.ativa ? `${m.lugares} lugares` : 'Desativada'}</small></button>)}</div></div>}
  </section>{editandoItem && <ItemForm form={editandoItem} setForm={setEditandoItem} produtos={produtos} grupos={config.grupos} salvando={salvando} onSalvar={async form => { if (await salvar(`/lanchonete/cardapio${form.id ? `/${form.id}` : ''}`, form.id ? 'PUT' : 'POST', { ...form, produtoId: Number(form.produtoId), tempoPreparoMinutos: Number(form.tempoPreparoMinutos), ordem: Number(form.ordem), ingredientes: form.ingredientes.map(i => ({ produtoId: Number(i.produtoId), quantidade: Number(i.quantidade) })), grupoIds: form.grupoIds.map(Number) })) setEditandoItem(null) }}/>} {editandoGrupo && <GrupoForm form={editandoGrupo} setForm={setEditandoGrupo} produtos={produtos} salvando={salvando} onSalvar={async form => { if (await salvar(`/lanchonete/grupos${form.id ? `/${form.id}` : ''}`, form.id ? 'PUT' : 'POST', { ...form, minimo: Number(form.minimo), maximo: Number(form.maximo), ordem: Number(form.ordem), opcoes: form.opcoes.map((o,i) => ({ produtoId: Number(o.produtoId), ingredienteId: o.ingredienteId ? Number(o.ingredienteId) : null, quantidadeInsumo: Number(o.quantidadeInsumo || 0), ativo: o.ativo, ordem: i })) })) setEditandoGrupo(null) }}/>}</div>
}

function ItemForm({ form, setForm, produtos, grupos, onSalvar, salvando }) {
  useEffect(() => {
    if (form.id || !form.produtoId || form.ingredientes.length) return
    const produto = produtos.find(p => String(p.id) === String(form.produtoId))
    if (produto && produto.quantidadeEstoque > 0 && !form.baixaProdutoFinal) {
      setForm(atual => ({ ...atual, baixaProdutoFinal: true }))
    }
  }, [form.id, form.produtoId, form.ingredientes.length, form.baixaProdutoFinal, produtos, setForm])
  return <div className="bottom-sheet sm:items-center" onClick={() => setForm(null)}><form className="glass-panel !bg-[var(--bg-color)] lanchonete-modal lanchonete-form" onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); onSalvar(form) }}><div className="flex justify-between"><div><small>Produto à venda</small><h2>{form.id ? 'Editar produto do cardápio' : 'Adicionar produto ao cardápio'}</h2></div><button type="button" className="touch-button" onClick={() => setForm(null)}><X/></button></div><div className="grid sm:grid-cols-2 gap-3"><label className="field-label sm:col-span-2">Qual produto será vendido?<select required disabled={!!form.id} className="control-field" value={form.produtoId} onChange={e => setForm({...form,produtoId:e.target.value})}><option value="">Escolha um produto...</option>{produtos.map(p => <option value={p.id} key={p.id}>{p.nome} • {moeda(p.preco)}</option>)}</select><small>O nome, preço e foto vêm do cadastro do produto.</small></label><label className="field-label">Nome curto na comanda (opcional)<input className="control-field" maxLength="80" value={form.nomeCozinha} onChange={e => setForm({...form,nomeCozinha:e.target.value})} placeholder="Ex.: X-Bacon"/></label><label className="field-label">Onde é preparado?<input required className="control-field" maxLength="40" value={form.estacao} onChange={e => setForm({...form,estacao:e.target.value})} placeholder="Ex.: Cozinha, chapa ou bar"/></label><label className="field-label">Tempo médio de preparo<input required type="number" min="0" max="480" className="control-field" value={form.tempoPreparoMinutos} onChange={e => setForm({...form,tempoPreparoMinutos:e.target.value})}/><small>Em minutos.</small></label><label className="field-label">Posição no cardápio<input type="number" className="control-field" value={form.ordem} onChange={e => setForm({...form,ordem:e.target.value})}/><small>Os menores aparecem primeiro.</small></label></div><div className="grid grid-cols-2 gap-3"><label className="toggle-card"><input type="checkbox" checked={form.disponivel} onChange={e => setForm({...form,disponivel:e.target.checked})}/><span><b>À venda</b><small>Aparece no atendimento</small></span></label><label className="toggle-card"><input type="checkbox" checked={form.destaque} onChange={e => setForm({...form,destaque:e.target.checked})}/><span><b>Destacar</b><small>Mostra “mais pedido”</small></span></label></div><div><div className="flex justify-between mb-2"><div><strong>Ingredientes usados neste produto</strong><p className="text-xs opacity-55">Ao vender 1 unidade, estas quantidades saem automaticamente do estoque.</p></div><button type="button" className="btn-secondary" onClick={() => setForm({...form,ingredientes:[...form.ingredientes,{produtoId:'',quantidade:1}]})}><Plus/> Adicionar ingrediente</button></div><div className="space-y-2">{form.ingredientes.map((ing,index) => <div className="ingredient-row" key={index}><select required className="control-field" value={ing.produtoId} onChange={e => setForm({...form,ingredientes:form.ingredientes.map((i,j)=>j===index?{...i,produtoId:e.target.value}:i)})}><option value="">Escolha o ingrediente...</option>{produtos.filter(p=>p.controlaEstoque!==false).map(p=><option value={p.id} key={p.id}>{p.nome} ({p.quantidadeEstoque} no estoque)</option>)}</select><input aria-label="Quantidade usada por venda" title="Quantidade usada por venda" required className="control-field" type="number" min="1" value={ing.quantidade} onChange={e => setForm({...form,ingredientes:form.ingredientes.map((i,j)=>j===index?{...i,quantidade:e.target.value}:i)})}/><button type="button" className="touch-button text-rose-500" onClick={() => setForm({...form,ingredientes:form.ingredientes.filter((_,j)=>j!==index)})}><Trash2/></button></div>)}</div></div><div><strong>Quais opções o cliente pode escolher?</strong><p className="text-xs opacity-55">Marque grupos como tamanho, molhos ou adicionais.</p><div className="check-grid">{grupos.map(g => <label key={g.id}><input type="checkbox" checked={form.grupoIds.includes(g.id)} onChange={e => setForm({...form,grupoIds:e.target.checked?[...form.grupoIds,g.id]:form.grupoIds.filter(id=>id!==g.id)})}/>{g.nome}</label>)}</div></div><button disabled={salvando} className="btn-primary mobile-action w-full">{salvando ? 'Salvando...' : 'Salvar no cardápio'}</button></form></div>
}

function GrupoForm({ form, setForm, produtos, onSalvar, salvando }) {
  return <div className="bottom-sheet sm:items-center" onClick={() => setForm(null)}><form className="glass-panel !bg-[var(--bg-color)] lanchonete-modal lanchonete-form" onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); onSalvar(form) }}><div className="flex justify-between"><div><small>Personalização</small><h2>{form.id ? 'Editar grupo' : 'Novo grupo'}</h2></div><button type="button" className="touch-button" onClick={() => setForm(null)}><X/></button></div><div className="grid sm:grid-cols-2 gap-3"><label className="field-label sm:col-span-2">Nome<input required maxLength="80" className="control-field" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex.: Escolha o molho"/></label><label className="field-label">Mínimo<input required type="number" min="0" className="control-field" value={form.minimo} onChange={e=>setForm({...form,minimo:e.target.value})}/></label><label className="field-label">Máximo<input required type="number" min="1" className="control-field" value={form.maximo} onChange={e=>setForm({...form,maximo:e.target.value})}/></label></div><div className="grid grid-cols-2 gap-3"><label className="toggle-card"><input type="checkbox" checked={form.obrigatorio} onChange={e=>setForm({...form,obrigatorio:e.target.checked,minimo:e.target.checked&&Number(form.minimo)<1?1:form.minimo})}/><span><b>Obrigatório</b><small>Cliente precisa escolher</small></span></label><label className="toggle-card"><input type="checkbox" checked={form.ativo} onChange={e=>setForm({...form,ativo:e.target.checked})}/><span><b>Ativo</b><small>Disponível no cardápio</small></span></label></div><div><div className="flex justify-between mb-2"><div><strong>Opções</strong><p className="text-xs opacity-55">Cada opção usa um produto como nome e preço.</p></div><button type="button" className="btn-secondary" onClick={()=>setForm({...form,opcoes:[...form.opcoes,{produtoId:'',ingredienteId:'',quantidadeInsumo:0,ativo:true}]})}><Plus/> Opção</button></div><div className="space-y-3">{form.opcoes.map((o,index)=><div className="option-config-row" key={index}><select required className="control-field" value={o.produtoId} onChange={e=>setForm({...form,opcoes:form.opcoes.map((x,j)=>j===index?{...x,produtoId:e.target.value}:x)})}><option value="">Produto/preço da opção...</option>{produtos.map(p=><option value={p.id} key={p.id}>{p.nome} • {moeda(p.preco)}</option>)}</select><select className="control-field" value={o.ingredienteId} onChange={e=>setForm({...form,opcoes:form.opcoes.map((x,j)=>j===index?{...x,ingredienteId:e.target.value}:x)})}><option value="">Não baixa insumo extra</option>{produtos.filter(p=>p.controlaEstoque!==false).map(p=><option value={p.id} key={p.id}>Baixar: {p.nome}</option>)}</select><input aria-label="Quantidade do insumo" className="control-field" type="number" min="0" value={o.quantidadeInsumo} onChange={e=>setForm({...form,opcoes:form.opcoes.map((x,j)=>j===index?{...x,quantidadeInsumo:e.target.value}:x)})}/><button type="button" className="touch-button text-rose-500" onClick={()=>setForm({...form,opcoes:form.opcoes.filter((_,j)=>j!==index)})}><Trash2/></button></div>)}</div></div><button disabled={salvando||!form.opcoes.length} className="btn-primary mobile-action w-full">{salvando?'Salvando...':'Salvar grupo de adicionais'}</button></form></div>
}
