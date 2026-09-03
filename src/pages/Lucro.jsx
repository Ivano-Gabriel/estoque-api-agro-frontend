import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, Activity, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react'

function Lucro({ token }) {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [fluxo, setFluxo] = useState({ totalEntradas: 0, totalSaidas: 0, saldoLiquido: 0 })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'

    fetch(apiUrl + '/transacoes', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      const movs = data.map(t => ({
        id: t.id,
        tipo: t.tipo,
        produto: t.produto?.nome || 'Produto desconhecido',
        quantidade: t.quantidade,
        valorUnitario: t.precoUnitario,
        total: t.valorTotal,
        data: new Date(t.data).toLocaleDateString('pt-BR')
      }))
      setMovimentacoes(movs)
      return fetch(apiUrl + '/fluxo-caixa', { headers: { 'Authorization': `Bearer ${token}` } })
    })
    .then(res => res.json())
    .then(data => {
      setFluxo({
        totalEntradas: data.totalEntradas || 0,
        totalSaidas: data.totalSaidas || 0,
        saldoLiquido: data.saldoLiquido || 0
      })
      setCarregando(false)
    })
    .catch(err => {
      console.log('Erro ao carregar dados:', err)
      setCarregando(false)
    })
  }, [token])

  const { totalEntradas, totalSaidas, saldoLiquido: saldo } = fluxo
  const totalMovimentado = totalEntradas + totalSaidas > 0 ? totalEntradas + totalSaidas : 1
  const percentualLucro = (totalEntradas / totalMovimentado) * 100

  const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 text-current relative z-10 pb-24 md:pb-8">
      
      <header className="flex justify-between items-end border-b border-current pb-4 opacity-90">
        <div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Fluxo de Caixa</h1>
          <p className="opacity-50 mt-1 font-mono text-[11px] uppercase tracking-widest">Inteligência Financeira</p>
        </div>
      </header>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40 space-y-4">
          <Activity size={32} className="animate-pulse" />
          <p className="font-mono text-xs uppercase tracking-widest">Carregando dados financeiros...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-panel p-6 flex flex-col justify-between border-l-2 border-emerald-500/50">
              <div className="flex items-center justify-between mb-6 opacity-60">
                <p className="text-[10px] uppercase tracking-widest font-bold">Entradas (Vendas)</p>
                <TrendingUp size={16} />
              </div>
              <h2 className="text-3xl font-mono font-light tracking-tighter opacity-90">
                <span className="text-sm opacity-50 mr-2">R$</span>{formatarMoeda(totalEntradas)}
              </h2>
            </div>

            <div className="glass-panel p-6 flex flex-col justify-between border-l-2 border-rose-500/50">
              <div className="flex items-center justify-between mb-6 opacity-60">
                <p className="text-[10px] uppercase tracking-widest font-bold">Saídas (Reposição)</p>
                <TrendingDown size={16} />
              </div>
              <h2 className="text-3xl font-mono font-light tracking-tighter opacity-90">
                <span className="text-sm opacity-50 mr-2">R$</span>{formatarMoeda(totalSaidas)}
              </h2>
            </div>

            <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden border-l-2 border-current">
              <div className="flex items-center justify-between mb-6 opacity-60">
                <p className="text-[10px] uppercase tracking-widest font-bold">Saldo Líquido</p>
                <Wallet size={16} />
              </div>
              <h2 className={`text-3xl font-mono font-light tracking-tighter ${saldo >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <span className="text-sm opacity-50 mr-2">R$</span>{formatarMoeda(saldo)}
              </h2>
            </div>

          </div>

          <div className="glass-panel p-6 mt-6">
            <div className="flex justify-between items-center mb-4 opacity-70">
              <span className="font-bold text-[10px] uppercase tracking-widest">Proporção Operacional</span>
            </div>
            <div className="w-full h-1 bg-rose-500/30 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${Math.min(percentualLucro, 100)}%` }}></div>
            </div>
          </div>

          <div className="glass-panel overflow-hidden mt-6">
            <div className="p-6 border-b border-current/10 flex items-center gap-3 opacity-90">
              <Receipt size={16} className="opacity-50" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Histórico de Transações</h3>
            </div>

            {movimentacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-40">
                <Receipt size={32} className="mb-4 opacity-50" />
                <p className="font-mono text-[10px] uppercase tracking-widest">Nenhuma movimentação</p>
              </div>
            ) : (
              <div className="divide-y divide-current/10">
                {movimentacoes.map((mov) => (
                  <div key={mov.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-current/5 transition-colors">
                    
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-sm border ${mov.tipo === 'VENDA' ? 'border-emerald-500/30 text-emerald-500' : 'border-rose-500/30 text-rose-500'}`}>
                        {mov.tipo === 'VENDA' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wider block opacity-90">
                          {mov.produto}
                        </span>
                        <span className="text-[10px] font-mono opacity-50 tracking-widest uppercase">
                          {mov.data} • {mov.quantidade} UN • R$ {formatarMoeda(mov.valorUnitario)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`font-mono font-light text-lg whitespace-nowrap ${mov.tipo === 'VENDA' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {mov.tipo === 'VENDA' ? '+' : '-'} R$ {formatarMoeda(mov.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Lucro