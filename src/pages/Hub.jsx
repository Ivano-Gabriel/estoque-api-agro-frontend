import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, Settings, Package, AlertTriangle, 
  Wallet, Loader2, ArrowRight, Zap, Bot, FileSpreadsheet, TrendingUp
} from 'lucide-react'

function Hub({ token }) {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/produtos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setProdutos(data))
    .catch(err => console.log(err))
    .finally(() => setCarregando(false))
  }, [token])

  const totalItens = produtos.length
  const estoqueCritico = produtos.filter(p => p.quantidadeEstoque <= 5)
  const patrimonio = produtos.reduce((acc, p) => acc + (p.preco * p.quantidadeEstoque), 0)

  // Saudação Dinâmica
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Banner Hero (BRABO) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 sm:p-10 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Efeito visual de fundo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {saudacao}, Gestor!
          </h1>
          <p className="text-blue-100 text-lg max-w-lg">
            O seu painel de controle inteligente está pronto. Aqui está o resumo da sua operação hoje.
          </p>
        </div>

        <div className="relative z-10 flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/produtos')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-50 hover:scale-105 transition-all cursor-pointer"
          >
            <ShoppingCart size={20} />
            Vender Agora
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="font-medium">Sincronizando banco de dados...</p>
        </div>
      ) : (
        <>
          {/* Métricas Essenciais (Responsivas: 1 coluna celular, 3 PC) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Produtos Ativos</p>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package size={20} />
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-800">{totalItens}</h2>
              <p className="text-sm text-slate-400 mt-2 flex items-center gap-1">
                <TrendingUp size={14} className="text-emerald-500" /> Itens no catálogo
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Estoque Crítico</p>
                <div className={`p-2.5 rounded-xl transition-colors ${estoqueCritico.length > 0 ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <h2 className={`text-4xl font-black ${estoqueCritico.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {estoqueCritico.length}
              </h2>
              <p className="text-sm text-slate-400 mt-2 flex items-center gap-1">
                {estoqueCritico.length > 0 ? 'Requer reposição urgente' : 'Estoque saudável'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Patrimônio Bruto</p>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Wallet size={20} />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                <span className="text-xl text-slate-400 font-bold mr-1">R$</span>
                {patrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-sm text-slate-400 mt-2">Valor total imobilizado</p>
            </div>

          </div>

          {/* Grid Inferior: Ações e Automações (Future-proof) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            
            {/* Ações Rápidas */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="text-amber-500" size={24} fill="currentColor" />
                <h3 className="text-xl font-bold text-slate-800">Ações Rápidas</h3>
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/gerenciar')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-3 rounded-lg text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                      <Settings size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Gerenciar Inventário</p>
                      <p className="text-sm text-slate-500">Cadastre ou edite seus produtos</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => navigate('/lucro')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-3 rounded-lg text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600">
                      <TrendingUp size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Relatórios Financeiros</p>
                      <p className="text-sm text-slate-500">Analise seu fluxo de caixa e lucros</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Módulos Premium (Teaser da sua visão de futuro) */}
            <div className="bg-slate-900 p-8 rounded-2xl shadow-sm relative overflow-hidden">
              {/* Efeitos de fundo escuro */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                Extensões Pro <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider">Em Breve</span>
              </h3>
              <p className="text-slate-400 text-sm mb-6">Módulos de automação para escalar sua operação.</p>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-70">
                  <Bot size={24} className="text-blue-400" />
                  <div>
                    <p className="font-bold text-slate-200">Bot de Alertas (WhatsApp)</p>
                    <p className="text-xs text-slate-400">Notificações automáticas de estoque baixo.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-70">
                  <FileSpreadsheet size={24} className="text-emerald-400" />
                  <div>
                    <p className="font-bold text-slate-200">Importação Excel / CSV</p>
                    <p className="text-xs text-slate-400">Migre milhares de produtos em segundos.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}

export default Hub