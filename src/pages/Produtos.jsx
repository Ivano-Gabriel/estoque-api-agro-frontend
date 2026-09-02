import { useState, useEffect } from 'react'
import { Search, ShoppingCart, PackageSearch, Tag, X, FileText } from 'lucide-react'

function Produtos({ token }) {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  
  // Filtros
  const [busca, setBusca] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas')
  
  // Controle do Modal de Venda
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [formVender, setFormVender] = useState({ quantidade: '', precoVenda: '', gerarNota: false })
  const [usuarioId, setUsuarioId] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        setUsuarioId(JSON.parse(userData).id)
        return
      } catch (e) { console.log('Erro ao parsear userData') }
    }
    setUsuarioId(1)
  }, [])

  function recarregarProdutos() {
    setCarregando(true)
    fetch(import.meta.env.VITE_API_URL + '/produtos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setProdutos(data))
    .catch(err => console.log(err))
    .finally(() => setCarregando(false))
  }
  
  useEffect(() => { recarregarProdutos() }, [token])

  const categorias = ['Todas', ...new Set(produtos.map(p => p.categoria?.nome).filter(Boolean)), 'Sem Categoria']

  const produtosFiltrados = produtos.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(busca.toLowerCase())
    const catNome = p.categoria?.nome || 'Sem Categoria'
    const catMatch = categoriaSelecionada === 'Todas' || catNome === categoriaSelecionada
    return nomeMatch && catMatch
  })

  function abrirModalVender(produto) {
    setProdutoSelecionado(produto)
    setFormVender({ quantidade: 1, precoVenda: produto.preco, gerarNota: false })
    setModalAberto(true)
  }

  function handleVender() {
    const qtd = parseInt(formVender.quantidade)
    const preco = parseFloat(formVender.precoVenda)

    if (!qtd || !preco || qtd <= 0 || preco <= 0) {
      alert("Preencha quantidade e preço corretamente.")
      return
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    
    // Aqui no futuro podemos tratar o formVender.gerarNota para chamar a API de PDF
    fetch(apiUrl + `/produtos/${produtoSelecionado.id}/venda-com-lucro`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ quantidade: qtd, precoVenda: preco, usuarioId: usuarioId || 1 })
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        recarregarProdutos()
        if (formVender.gerarNota) alert("✅ Venda registrada e Nota solicitada!")
        else alert("✅ Venda registrada com sucesso!")
      } else {
        alert("❌ Erro ao vender produto.")
      }
    })
    .catch(() => alert("❌ Erro ao vender produto."))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Frente de Caixa</h1>
        <p className="text-slate-500 mt-1">Busque o item ou selecione a categoria para registrar a venda rápida.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Buscar produto por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-lg text-slate-800 font-medium transition-all"
            autoFocus
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer border ${
                categoriaSelecionada === cat 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat === 'Todas' ? 'Tudo' : cat}
            </button>
          ))}
        </div>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <PackageSearch size={32} className="animate-pulse text-blue-500" />
          <p className="font-medium">Carregando prateleiras...</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
          <Tag size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-semibold">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {produtosFiltrados.map(p => (
            <div 
              key={p.id} 
              onClick={() => abrirModalVender(p)}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {p.categoria?.nome || 'Sem Categoria'}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${p.quantidadeEstoque <= 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                  {p.quantidadeEstoque} {p.tipo}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-lg leading-tight mb-6 flex-1 group-hover:text-blue-600 transition-colors">
                {p.nome}
              </h3>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Preço Un.</span>
                  <span className="font-bold text-emerald-600 text-xl">R$ {p.preco?.toFixed(2)}</span>
                </div>
                
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShoppingCart size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Limpo de Venda */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Registrar Venda</h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Produto: <strong className="text-slate-800">{produtoSelecionado?.nome}</strong></p>
              <p className="text-sm text-slate-500">Estoque atual: <strong className="text-blue-600">{produtoSelecionado?.quantidadeEstoque}</strong></p>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Quantidade a Vender</label>
                <input 
                  value={formVender.quantidade} 
                  onChange={e => setFormVender({...formVender, quantidade: e.target.value})} 
                  type="number" 
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Preço de Venda Unitário (R$)</label>
                <input 
                  value={formVender.precoVenda} 
                  onChange={e => setFormVender({...formVender, precoVenda: e.target.value})} 
                  type="number" step="0.01" 
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" 
                />
              </div>

              {/* Checkbox de Gerar Nota */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formVender.gerarNota}
                    onChange={e => setFormVender({...formVender, gerarNota: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText size={16} className="text-slate-400" />
                      Emitir Comprovante / Nota
                    </span>
                    <span className="text-xs text-slate-500">Gera um recibo para esta transação</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleVender} className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer flex items-center gap-2">
                <ShoppingCart size={18} />
                Confirmar Venda
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}

export default Produtos