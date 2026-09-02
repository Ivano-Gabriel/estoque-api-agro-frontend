import { useState, useEffect } from 'react'
import { Plus, X, ShoppingCart, TrendingUp, Edit, Trash2, PackageSearch, Tag, Layers, Search, Filter } from 'lucide-react'

function Gerenciar({ token }) {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Filtros
  const [termoBusca, setTermoBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [modoModal, setModoModal] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)

  const [form, setForm] = useState({
    nome: '', preco: '', quantidade: '', categoria: '', novaCategoria: '', tipo: 'UNIDADE'
  })

  const [formRepor, setFormRepor] = useState({ quantidade: '', precoCusto: '' })
  const [formVender, setFormVender] = useState({ quantidade: '', precoVenda: '' })
  const [usuarioId, setUsuarioId] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUsuarioId(parsed.id)
        return
      } catch (e) {
        console.log('Erro ao parsear userData')
      }
    }
    setUsuarioId(1)
  }, [])

  const carregarProdutos = () => {
    setCarregando(true)
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + '/produtos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setProdutos(data))
    .catch(err => console.log(err))
    .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregarProdutos()
  }, [token])

  const categoriasExistentes = [...new Set(produtos.map(p => p.categoria?.nome).filter(Boolean))]

  // Lógica de Filtragem (Busca + Categoria)
  const produtosFiltrados = produtos.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(termoBusca.toLowerCase())
    const catMatch = filtroCategoria === '' || (p.categoria?.nome || 'Sem Categoria') === filtroCategoria
    return nomeMatch && catMatch
  })

  function abrirModalNovo() {
    setProdutoSelecionado(null)
    setModoModal('novo')
    setForm({ nome: '', preco: '', quantidade: '', categoria: categoriasExistentes[0] || '', novaCategoria: '', tipo: 'UNIDADE' })
    setModalAberto(true)
  }

  function abrirModalEditar(produto) {
    setProdutoSelecionado(produto)
    setModoModal('editar')
    setForm({
      nome: produto.nome,
      preco: produto.preco || '',
      quantidade: produto.quantidadeEstoque || '',
      categoria: produto.categoria?.nome || '',
      novaCategoria: '',
      tipo: produto.tipo || 'UNIDADE'
    })
    setModalAberto(true)
  }

  function abrirModalRepor(produto) {
    setProdutoSelecionado(produto)
    setModoModal('repor')
    setFormRepor({ quantidade: '', precoCusto: '' })
    setModalAberto(true)
  }

  function abrirModalVender(produto) {
    setProdutoSelecionado(produto)
    setModoModal('vender')
    setFormVender({ quantidade: '', precoVenda: '' })
    setModalAberto(true)
  }

  function abrirModalDeletar(produto) {
    setProdutoSelecionado(produto)
    setModoModal('deletar')
    setModalAberto(true)
  }

  function handleSalvar() {
    const produtoParaSalvar = {
      id: produtoSelecionado ? produtoSelecionado.id : null,
      nome: form.nome,
      preco: parseFloat(form.preco),
      quantidadeEstoque: parseInt(form.quantidade),
      tipo: form.tipo,
      categoria: { nome: form.categoria === 'nova_categoria' ? form.novaCategoria : form.categoria }
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + '/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(produtoParaSalvar)
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        carregarProdutos()
      } else {
        alert("Ops! Erro ao salvar o produto.")
      }
    })
    .catch(err => console.log(err))
  }

  function handleDeletar() {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + `/produtos/${produtoSelecionado.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        carregarProdutos()
      } else {
        alert("Erro ao deletar produto. Pode haver transações vinculadas a ele.")
      }
    })
    .catch(err => console.log(err))
  }

  function handleRepor() {
    const qtd = parseInt(formRepor.quantidade)
    const custo = parseFloat(formRepor.precoCusto)
    if (!qtd || !custo || qtd <= 0 || custo <= 0) return alert("Preencha quantidade e preço de custo corretamente.")

    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + `/produtos/${produtoSelecionado.id}/compra-com-custo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ quantidade: qtd, precoCompra: custo, usuarioId: usuarioId || 1 })
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        carregarProdutos()
      } else alert("Erro ao repor estoque.")
    })
    .catch(err => console.log(err))
  }

  function handleVender() {
    const qtd = parseInt(formVender.quantidade)
    const preco = parseFloat(formVender.precoVenda)
    if (!qtd || !preco || qtd <= 0 || preco <= 0) return alert("Preencha quantidade e preço de venda corretamente.")

    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + `/produtos/${produtoSelecionado.id}/venda-com-lucro`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ quantidade: qtd, precoVenda: preco, usuarioId: usuarioId || 1 })
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        carregarProdutos()
      } else alert("❌ Erro ao vender produto.")
    })
    .catch(err => alert("❌ Erro ao vender produto."))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gerenciar Estoque</h1>
          <p className="text-slate-500 mt-1">Visão geral do inventário e controle de itens.</p>
        </div>
        
        <button 
          onClick={abrirModalNovo} 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-blue-700 hover:shadow transition-all"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            placeholder="Buscar produto por nome..." 
            value={termoBusca} 
            onChange={e => setTermoBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 shadow-sm"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={filtroCategoria} 
            onChange={e => setFiltroCategoria(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">Todas as Categorias</option>
            {categoriasExistentes.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="Sem Categoria">Sem Categoria</option>
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <PackageSearch size={32} className="animate-pulse text-blue-500" />
            <p className="font-medium">Carregando inventário...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Layers size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-semibold">Nenhum produto encontrado</p>
            <p className="text-sm">Tente limpar os filtros ou busque por outro nome.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Preço (Venda)</th>
                  <th className="px-6 py-4">Estoque</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.nome}</div>
                      <div className="text-xs text-slate-400 mt-0.5 uppercase">{p.tipo}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                        <Tag size={12} />
                        {p.categoria?.nome || 'Sem Categoria'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">R$ {p.preco?.toFixed(2)}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.quantidadeEstoque <= 5 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {p.quantidadeEstoque} {p.quantidadeEstoque === 1 ? 'un' : 'un'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => abrirModalVender(p)} title="Vender Produto" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 cursor-pointer">
                          <ShoppingCart size={18} />
                        </button>
                        <button onClick={() => abrirModalRepor(p)} title="Repor Estoque" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer">
                          <TrendingUp size={18} />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <button onClick={() => abrirModalEditar(p)} title="Editar Produto" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => abrirModalDeletar(p)} title="Excluir Produto" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL GLOBAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {modoModal === 'novo' && 'Criar Novo Produto'}
                {modoModal === 'editar' && 'Editar Produto'}
                {modoModal === 'repor' && 'Repor Estoque'}
                {modoModal === 'vender' && 'Vender Produto'}
                {modoModal === 'deletar' && 'Confirmar Exclusão'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {(modoModal === 'novo' || modoModal === 'editar') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Nome do Produto</label>
                    <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-600 mb-1.5">Preço (R$)</label>
                      <input value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} type="number" step="0.01" className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-600 mb-1.5">Estoque</label>
                      <input value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} type="number" className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-600 mb-1.5">Categoria</label>
                      <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer">
                        <option value="" disabled>Selecione...</option>
                        {categoriasExistentes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="nova_categoria">➕ Nova Categoria...</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-600 mb-1.5">Tipo</label>
                      <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer">
                        <option value="UNIDADE">Unidade (un)</option>
                        <option value="KG">Quilo (kg)</option>
                        <option value="CAIXA">Caixa (cx)</option>
                        <option value="LITRO">Litro (L)</option>
                      </select>
                    </div>
                  </div>
                  {form.categoria === 'nova_categoria' && (
                    <div className="animate-in slide-in-from-top-2">
                      <label className="block text-sm font-semibold text-blue-600 mb-1.5">Nome da Nova Categoria</label>
                      <input value={form.novaCategoria} onChange={e => setForm({...form, novaCategoria: e.target.value})} className="w-full p-2.5 rounded-lg border border-blue-300 bg-blue-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                    </div>
                  )}
                </div>
              )}

              {modoModal === 'repor' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Produto: <strong className="text-slate-800">{produtoSelecionado?.nome}</strong></p>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Quantidade a Repor</label>
                    <input value={formRepor.quantidade} onChange={e => setFormRepor({...formRepor, quantidade: e.target.value})} type="number" className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Preço de Custo (R$)</label>
                    <input value={formRepor.precoCusto} onChange={e => setFormRepor({...formRepor, precoCusto: e.target.value})} type="number" step="0.01" className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                  </div>
                </div>
              )}

              {modoModal === 'vender' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Produto: <strong className="text-slate-800">{produtoSelecionado?.nome}</strong></p>
                  <p className="text-sm text-slate-500">Estoque atual: <strong className="text-blue-600">{produtoSelecionado?.quantidadeEstoque}</strong></p>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Quantidade a Vender</label>
                    <input value={formVender.quantidade} onChange={e => setFormVender({...formVender, quantidade: e.target.value})} type="number" className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Preço de Venda (R$)</label>
                    <input value={formVender.precoVenda} onChange={e => setFormVender({...formVender, precoVenda: e.target.value})} type="number" step="0.01" className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                  </div>
                </div>
              )}

              {modoModal === 'deletar' && (
                <div>
                  <p className="text-slate-600 leading-relaxed">
                    Tem certeza absoluta que deseja excluir <strong>{produtoSelecionado?.nome}</strong>? Esta ação é irreversível.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer">
                Cancelar
              </button>
              
              {modoModal === 'deletar' && (
                <button onClick={handleDeletar} className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors cursor-pointer">
                  Confirmar Exclusão
                </button>
              )}

              {modoModal === 'repor' && (
                <button onClick={handleRepor} className="px-4 py-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer">
                  Confirmar Reposição
                </button>
              )}

              {modoModal === 'vender' && (
                <button onClick={handleVender} className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
                  Confirmar Venda
                </button>
              )}

              {(modoModal === 'novo' || modoModal === 'editar') && (
                <button onClick={handleSalvar} className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
                  Salvar Produto
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