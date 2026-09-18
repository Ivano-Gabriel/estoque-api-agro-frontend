import { PackageSearch, AlertTriangle, DollarSign, TrendingUp, ArrowRight, Activity, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import API_URL from '../config/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function Hub({ token }) {
  // Começa tudo zerado. Se ficar zerado, a API não está respondendo.
  const [stats, setStats] = useState({
    ativos: 0,
    criticos: 0,
    patrimonio: 0
  })
  const [dadosGrafico, setDadosGrafico] = useState([])
  const [carregando, setCarregando] = useState(true)

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
      setDadosGrafico(data.dadosGrafico)
      setCarregando(false)
    })
    .catch(err => {
      console.log('Erro ao carregar dashboard:', err)
      setCarregando(false)
    })
  }, [token])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border !border-current/20">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
          <p className="font-mono text-sm opacity-90 text-emerald-500 font-bold">
            R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto text-current">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-current pb-6 opacity-90">
        <div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Visão Geral</h1>
          <p className="opacity-50 mt-1 font-mono text-[11px] uppercase tracking-widest">Status: Operacional • Sincronizado</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                <PackageSearch size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Volume</span>
              </div>
              <div>
                <p className="text-4xl font-light font-mono tracking-tighter opacity-90">{stats.ativos}</p>
                <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">Produtos Ativos</h3>
              </div>
            </div>

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
                <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">Patrimônio Bruto</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            
            {/* O GRÁFICO REAL AQUI */}
            <div className="glass-panel p-4 lg:col-span-3 min-h-[300px] flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 px-2 opacity-60">
                <h2 className="text-[10px] font-bold uppercase tracking-widest">Evolução do Patrimônio</h2>
              </div>
              
              <div className="flex-1 w-full h-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="corPatrimonio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="patrimonio" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#corPatrimonio)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
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
