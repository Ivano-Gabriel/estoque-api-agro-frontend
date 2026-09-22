import { PackageSearch, AlertTriangle, DollarSign, TrendingUp, ArrowRight, Activity, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import API_URL, { apiFetch as fetch } from '../config/api'

function Hub({ token, loja }) {
  // Começa tudo zerado. Se ficar zerado, a API não está respondendo.
  const [stats, setStats] = useState({
    ativos: 0,
    criticos: 0,
    patrimonio: 0
  })
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')

  useEffect(() => {
    fetch(API_URL + '/estatisticas/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro na resposta da API')
      return res.json()
    })
    .then(data => {
      setStats({
        ativos: data.ativos,
        criticos: data.criticos,
        patrimonio: data.patrimonio
      })
      setCarregando(false)
    })
    .catch(err => {
      setErroCarga(err.message)
      setCarregando(false)
    })
  }, [token])

  if (erroCarga) return <div role="alert" className="glass-panel p-6"><p>{erroCarga}</p><button className="btn-primary p-3 mt-4" onClick={() => window.location.reload()}>Tentar novamente</button></div>

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto text-current">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-current pb-6 opacity-90">
        <div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Visão Geral</h1>
          <p className="opacity-50 mt-1 font-mono text-[11px] uppercase tracking-widest">Resumo da última consulta</p>
        </div>
        <Link to="/gerenciar" className="border border-current opacity-70 hover:opacity-100 hover:bg-current/10 flex items-center gap-2 px-6 py-2.5 transition-all text-xs font-bold tracking-widest uppercase group">
          <ShoppingCart size={14} /> Registrar Venda
        </Link>
      </header>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40 space-y-4 w-full">
          <Activity size={32} className="animate-pulse" />
          <p className="font-mono text-xs uppercase tracking-widest">Buscando métricas...</p>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-1 ${loja?.financeiroAtivo ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
            {loja?.financeiroAtivo && <div className="glass-panel p-5 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                <PackageSearch size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Volume</span>
              </div>
              <div>
                <p className="text-4xl font-light font-mono tracking-tighter opacity-90">{stats.ativos}</p>
                <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">Produtos Ativos</h3>
              </div>
            </div>}

            <div className="glass-panel !border-l-rose-600 p-5 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                <AlertTriangle size={18} className="text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] text-rose-600 opacity-70 uppercase tracking-widest font-bold animate-pulse">Atenção</span>
              </div>
              <div>
                <p className="text-4xl font-light font-mono tracking-tighter opacity-90">{stats.criticos}</p>
                <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">Estoque Crítico</h3>
              </div>
            </div>

            <div className="glass-panel p-5 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                <DollarSign size={18} className="opacity-40 group-hover:text-emerald-500 group-hover:opacity-100 transition-colors" />
                <span className="flex items-center gap-1 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
                  <TrendingUp size={12} /> +
                </span>
              </div>
              <div>
                <p className="text-3xl font-light font-mono tracking-tighter opacity-90">
                  R$ {stats.patrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">Estoque a preço de venda</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-6 lg:col-span-3 flex flex-col justify-center gap-3">
              <h2 className="font-bold">Resumo do estoque atual</h2>
              <p className="text-sm opacity-70">Acompanhe produtos ativos, estoque crítico e movimentações da loja.</p>
              {loja?.financeiroAtivo && <Link to="/lucro" className="underline text-sm">Conferir movimentações e lucro bruto</Link>}
            </div>

            <div className="flex flex-col gap-4">
              <div className="glass-panel p-5 flex-1">
                <h2 className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mb-6">Ações Rápidas</h2>
                
                <Link to="/produtos" className="group flex items-center justify-between py-3 border-b border-current/10 hover:border-current/40 transition-colors">
                  <span className="text-xs font-bold opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">Inventário</span>
                  <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                
                <Link to="/config" className="group flex items-center justify-between py-3 hover:border-current/40 transition-colors mt-2">
                  <span className="text-xs font-bold opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">Sistema</span>
                  <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  )
}

export default Hub
