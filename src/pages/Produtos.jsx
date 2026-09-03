import { useState, useEffect } from 'react'
import { Search, ShoppingCart, PackageSearch, Tag, X, FileText } from 'lucide-react'

function Produtos({ token }) {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  
  const [busca, setBusca] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas')
  
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
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 text-current relative z-10 pb-24 md:pb-8">
      
      <header className="flex justify-between items-end border-b border-current pb-4 opacity-90">
        <div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Frente de Caixa</h1>
          <p className="opacity-50 mt-1 font-mono text-[11px] uppercase tracking-widest">Venda Rápida • Catálogo</p>
        </div>
      </header>

      <div className="glass-panel p-6 space-y-6">
        <div className="relative">
          <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            placeholder="Buscar produto por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-transparent border border-current/20 rounded-sm focus:outline-none focus:border-current text-lg font-bold tracking-wider transition-all placeholder:opacity-30"
            autoFocus
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              className={`flex-shrink-0 px-5 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all border ${
                categoriaSelecionada === cat 
                  ? 'bg-current text-[var(--bg-color)] border-current shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                  : 'bg-transparent opacity-60 border-current/20 hover:opacity-100 hover:border-current/50'
              }`}
            >
              {cat === 'Todas' ? 'Tudo' : cat}
            </button>
          ))}
        </div>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40 space-y-4">
          <PackageSearch size={32} className="animate-pulse" />
          <p className="font-mono text-xs uppercase tracking-widest">Carregando prateleiras...</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 glass-panel border-dashed">
          <Tag size={48} className="mb-4 opacity-30" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {produtosFiltrados.map(p => (
            <div 
              key={p.id} 
              onClick={() => abrirModalVender(p)}
              className="glass-panel p-5 flex flex-col h-full hover:border-current/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                  {p.categoria?.nome || 'Sem Categoria'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest ${p.quantidadeEstoque <= 5 ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-current/10 opacity-70 border border-current/20'}`}>
                  {p.quantidadeEstoque} {p.tipo}
                </span>
              </div>

              <h3 className="font-bold text-lg leading-tight mb-6 flex-1 group-hover:opacity-70 transition-opacity uppercase tracking-wider">
                {p.nome}
              </h3>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-current/10">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Preço Un.</span>
                  <span className="font-mono font-light text-xl opacity-90">R$ {p.preco?.toFixed(2)}</span>
                </div>
                
                <div className="border border-current/20 p-2.5 rounded-sm group-hover:bg-current group-hover:text-[var(--bg-color)] transition-colors">
                  <ShoppingCart size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Venda */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel !bg-[var(--bg-color)] w-full max-w-md rounded-sm overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-current/10 opacity-90">
              <h2 className="text-sm font-bold uppercase tracking-widest">Registrar Venda</h2>
              <button onClick={() => setModalAberto(false)} className="opacity-50 hover:opacity-100 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center opacity-70 text-xs font-mono uppercase tracking-widest">
                <span>{produtoSelecionado?.nome}</span>
                <span>Estoque: {produtoSelecionado?.quantidadeEstoque}</span>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold opacity-50 uppercase tracking-widest mb-2">Quantidade a Vender</label>
                <input 
                  value={formVender.quantidade} 
                  onChange={e => setFormVender({...formVender, quantidade: e.target.value})} 
                  type="number" 
                  className="w-full p-3 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono text-lg transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold opacity-50 uppercase tracking-widest mb-2">Preço Unitário (R$)</label>
                <input 
                  value={formVender.precoVenda} 
                  onChange={e => setFormVender({...formVender, precoVenda: e.target.value})} 
                  type="number" step="0.01" 
                  className="w-full p-3 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono text-lg transition-all" 
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-4 p-4 border border-current/20 rounded-sm cursor-pointer hover:bg-current/5 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formVender.gerarNota}
                    onChange={e => setFormVender({...formVender, gerarNota: e.target.checked})}
                    className="w-5 h-5 accent-current cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-90">
                      <FileText size={14} className="opacity-50" /> Emitir Recibo
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-current/10 bg-current/5 flex justify-end gap-3">
              <button onClick={() => setModalAberto(false)} className="px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-colors">
                Cancelar
              </button>
              <button onClick={handleVender} className="px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest bg-current text-[var(--bg-color)] hover:opacity-80 transition-colors flex items-center gap-2">
                <ShoppingCart size={14} /> Confirmar
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}

export default Produtos