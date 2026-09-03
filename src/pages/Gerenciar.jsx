import { useState, useEffect } from 'react'
import { Plus, X, ShoppingCart, TrendingUp, Edit, Trash2, PackageSearch, Tag, Layers, Search, Filter } from 'lucide-react'

function Gerenciar({ token }) {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [termoBusca, setTermoBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [modoModal, setModoModal] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)

  const [form, setForm] = useState({ nome: '', preco: '', quantidade: '', categoria: '', novaCategoria: '', tipo: 'UNIDADE' })
  const [formRepor, setFormRepor] = useState({ quantidade: '', precoCusto: '' })
  const [formVender, setFormVender] = useState({ quantidade: '', precoVenda: '' })
  const [usuarioId, setUsuarioId] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      try { setUsuarioId(JSON.parse(userData).id); return; } 
      catch (e) { console.log('Erro parse') }
    }
    setUsuarioId(1)
  }, [])

  const carregarProdutos = () => {
    setCarregando(true)
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + '/produtos', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.ok ? res.json() : [])
    .then(data => setProdutos(data))
    .catch(err => console.log(err))
    .finally(() => setCarregando(false))
  }

  useEffect(() => { carregarProdutos() }, [token])

  const categoriasExistentes = [...new Set(produtos.map(p => p.categoria?.nome).filter(Boolean))]

  const produtosFiltrados = produtos.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(termoBusca.toLowerCase())
    const catMatch = filtroCategoria === '' || (p.categoria?.nome || 'Sem Categoria') === filtroCategoria
    return nomeMatch && catMatch
  })

  // Funções de abrir modal omitidas por espaço (são iguais às originais)
  function abrirModalNovo() {
    setProdutoSelecionado(null); setModoModal('novo');
    setForm({ nome: '', preco: '', quantidade: '', categoria: categoriasExistentes[0] || '', novaCategoria: '', tipo: 'UNIDADE' })
    setModalAberto(true)
  }
  function abrirModalEditar(produto) {
    setProdutoSelecionado(produto); setModoModal('editar');
    setForm({ nome: produto.nome, preco: produto.preco || '', quantidade: produto.quantidadeEstoque || '', categoria: produto.categoria?.nome || '', novaCategoria: '', tipo: produto.tipo || 'UNIDADE' })
    setModalAberto(true)
  }
  function abrirModalRepor(produto) {
    setProdutoSelecionado(produto); setModoModal('repor'); setFormRepor({ quantidade: '', precoCusto: '' }); setModalAberto(true);
  }
  function abrirModalVender(produto) {
    setProdutoSelecionado(produto); setModoModal('vender'); setFormVender({ quantidade: '', precoVenda: '' }); setModalAberto(true);
  }
  function abrirModalDeletar(produto) {
    setProdutoSelecionado(produto); setModoModal('deletar'); setModalAberto(true);
  }

  // Funções de API (Salvar, Deletar, Repor, Vender)
  function handleSalvar() {
    const obj = { id: produtoSelecionado?.id || null, nome: form.nome, preco: parseFloat(form.preco), quantidadeEstoque: parseInt(form.quantidade), tipo: form.tipo, categoria: { nome: form.categoria === 'nova_categoria' ? form.novaCategoria : form.categoria } }
    fetch((import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com') + '/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(obj) })
    .then(res => { if(res.ok) { setModalAberto(false); carregarProdutos(); } else alert("Erro ao salvar."); })
  }
  function handleDeletar() {
    fetch((import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com') + `/produtos/${produtoSelecionado.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => { if(res.ok) { setModalAberto(false); carregarProdutos(); } else alert("Erro ao deletar."); })
  }
  function handleRepor() {
    const qtd = parseInt(formRepor.quantidade); const custo = parseFloat(formRepor.precoCusto);
    if (!qtd || !custo) return alert("Preencha corretamente.")
    fetch((import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com') + `/produtos/${produtoSelecionado.id}/compra-com-custo`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ quantidade: qtd, precoCompra: custo, usuarioId: usuarioId || 1 }) })
    .then(res => { if(res.ok) { setModalAberto(false); carregarProdutos(); } else alert("Erro ao repor."); })
  }
  function handleVender() {
    const qtd = parseInt(formVender.quantidade); const preco = parseFloat(formVender.precoVenda);
    if (!qtd || !preco) return alert("Preencha corretamente.")
    fetch((import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com') + `/produtos/${produtoSelecionado.id}/venda-com-lucro`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ quantidade: qtd, precoVenda: preco, usuarioId: usuarioId || 1 }) })
    .then(res => { if(res.ok) { setModalAberto(false); carregarProdutos(); } else alert("Erro ao vender."); })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 text-current relative z-10 pb-24 md:pb-8">
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-current pb-4 opacity-90">
        <div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Gestão</h1>
          <p className="opacity-50 mt-1 font-mono text-[11px] uppercase tracking-widest">Controle de Inventário</p>
        </div>
        <button onClick={abrirModalNovo} className="border border-current bg-current/5 hover:bg-current hover:text-[var(--bg-color)] transition-all px-6 py-2.5 rounded-sm font-bold text-xs tracking-widest uppercase flex items-center gap-2">
          <Plus size={14} /> Registro
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <input 
            placeholder="Buscar..." 
            value={termoBusca} 
            onChange={e => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-current/20 rounded-sm focus:outline-none focus:border-current text-sm tracking-widest font-bold uppercase transition-all placeholder:opacity-30"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <select 
            value={filtroCategoria} 
            onChange={e => setFiltroCategoria(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-current/20 rounded-sm focus:outline-none focus:border-current text-sm tracking-widest font-bold uppercase appearance-none cursor-pointer [&>option]:bg-[var(--bg-color)]"
          >
            <option value="">Todas</option>
            {categoriasExistentes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="Sem Categoria">S/ Categoria</option>
          </select>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40 space-y-4">
            <PackageSearch size={32} className="animate-pulse" />
            <p className="font-mono text-[10px] uppercase tracking-widest">Lendo Banco de Dados...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Layers size={32} className="mb-4 opacity-50" />
            <p className="font-mono text-[10px] uppercase tracking-widest">Inventário Vazio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-current/5 border-b border-current/10 opacity-70 text-[9px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Varejo</th>
                  <th className="px-6 py-4">Volume</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/5">
                {produtosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-current/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-xs uppercase tracking-wider opacity-90">{p.nome}</div>
                      <div className="text-[9px] font-mono opacity-50 mt-1 uppercase tracking-widest">{p.tipo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-2 py-1 border border-current/20 rounded-sm text-[9px] font-bold uppercase tracking-widest opacity-70">
                        <Tag size={10} /> {p.categoria?.nome || 'S/ CAT'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm opacity-90">R$ {p.preco?.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 border rounded-sm text-[10px] font-bold uppercase tracking-widest ${
                        p.quantidadeEstoque <= 5 ? 'border-rose-500/50 text-rose-500' : 'border-current/20 opacity-80'
                      }`}>
                        {p.quantidadeEstoque} UN
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => abrirModalVender(p)} className="p-2 border border-current/20 hover:border-current hover:bg-current/10 rounded-sm transition-all"><ShoppingCart size={14} /></button>
                        <button onClick={() => abrirModalRepor(p)} className="p-2 border border-current/20 hover:border-current hover:bg-current/10 rounded-sm transition-all"><TrendingUp size={14} /></button>
                        <button onClick={() => abrirModalEditar(p)} className="p-2 border border-current/20 hover:border-current hover:bg-current/10 rounded-sm transition-all opacity-60"><Edit size={14} /></button>
                        <button onClick={() => abrirModalDeletar(p)} className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-sm transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CAMALEÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel !bg-[var(--bg-color)] w-full max-w-md rounded-sm overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-current/10 opacity-90">
              <h2 className="text-xs font-bold uppercase tracking-widest">
                {modoModal === 'novo' && 'Novo Registro'}
                {modoModal === 'editar' && 'Ajuste de Ativo'}
                {modoModal === 'repor' && 'Entrada de Estoque'}
                {modoModal === 'vender' && 'Saída / Venda'}
                {modoModal === 'deletar' && 'Purga de Dados'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="opacity-50 hover:opacity-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {(modoModal === 'novo' || modoModal === 'editar') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Identificação</label>
                    <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all text-sm font-bold uppercase tracking-wider" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Varejo (R$)</label>
                      <input value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} type="number" step="0.01" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all font-mono" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Volume Total</label>
                      <input value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} type="number" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all font-mono" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Setor</label>
                      <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all text-xs font-bold uppercase tracking-widest [&>option]:bg-[var(--bg-color)]">
                        <option value="" disabled>---</option>
                        {categoriasExistentes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="nova_categoria">+ Criar Setor</option>
                      </select>
                    </div>
                  </div>
                  {form.categoria === 'nova_categoria' && (
                    <div className="animate-in slide-in-from-top-2 border border-current/20 p-3 rounded-sm bg-current/5">
                      <label className="block text-[9px] font-bold opacity-80 uppercase tracking-widest mb-2">Nome do Novo Setor</label>
                      <input value={form.novaCategoria} onChange={e => setForm({...form, novaCategoria: e.target.value})} className="w-full p-2.5 bg-transparent border-b border-current/30 focus:outline-none focus:border-current transition-all text-xs font-bold uppercase tracking-widest" />
                    </div>
                  )}
                </div>
              )}

              {modoModal === 'repor' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Alvo: <strong className="opacity-100">{produtoSelecionado?.nome}</strong></p>
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Carga (UN)</label>
                    <input value={formRepor.quantidade} onChange={e => setFormRepor({...formRepor, quantidade: e.target.value})} type="number" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Custo Base (R$)</label>
                    <input value={formRepor.precoCusto} onChange={e => setFormRepor({...formRepor, precoCusto: e.target.value})} type="number" step="0.01" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono" />
                  </div>
                </div>
              )}

              {modoModal === 'vender' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center opacity-70 text-[10px] font-mono uppercase tracking-widest border-b border-current/10 pb-3">
                    <span>{produtoSelecionado?.nome}</span>
                    <span>QTD Disp: {produtoSelecionado?.quantidadeEstoque}</span>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Baixa (UN)</label>
                    <input value={formVender.quantidade} onChange={e => setFormVender({...formVender, quantidade: e.target.value})} type="number" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Valor de Saída (R$)</label>
                    <input value={formVender.precoVenda} onChange={e => setFormVender({...formVender, precoVenda: e.target.value})} type="number" step="0.01" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono" />
                  </div>
                </div>
              )}

              {modoModal === 'deletar' && (
                <div className="p-4 border border-rose-500/30 bg-rose-500/5 rounded-sm">
                  <p className="text-xs font-mono opacity-80 uppercase tracking-widest leading-relaxed">
                    Exclusão permanente de ativo: <br/><strong className="text-rose-500">{produtoSelecionado?.nome}</strong>. <br/>Não há retorno.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-current/10 bg-current/5 flex justify-end gap-3">
              <button onClick={() => setModalAberto(false)} className="px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-colors">
                Abortar
              </button>
              
              {modoModal === 'deletar' && (
                <button onClick={handleDeletar} className="px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                  Purgar
                </button>
              )}

              {modoModal === 'repor' && (
                <button onClick={handleRepor} className="px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest bg-current text-[var(--bg-color)] hover:opacity-80 transition-colors">
                  Executar Entrada
                </button>
              )}

              {modoModal === 'vender' && (
                <button onClick={handleVender} className="px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest bg-current text-[var(--bg-color)] hover:opacity-80 transition-colors">
                  Executar Saída
                </button>
              )}

              {(modoModal === 'novo' || modoModal === 'editar') && (
                <button onClick={handleSalvar} className="px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest bg-current text-[var(--bg-color)] hover:opacity-80 transition-colors">
                  Gravar Dados
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gerenciar