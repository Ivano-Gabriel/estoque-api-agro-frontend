import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, Activity, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react'

function Lucro({ token }) {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [fluxo, setFluxo] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    saldoLiquido: 0
  })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'

    fetch(apiUrl + '/transacoes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
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
      return fetch(apiUrl + '/fluxo-caixa', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
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

  const totalEntradas = fluxo.totalEntradas
  const totalSaidas = fluxo.totalSaidas
  const saldo = fluxo.saldoLiquido

  const totalMovimentado = totalEntradas + totalSaidas > 0 ? totalEntradas + totalSaidas : 1
  const percentualLucro = (totalEntradas / totalMovimentado) * 100

  // Função auxiliar para formatar dinheiro no padrão BR
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fluxo de Caixa</h1>
        <p className="text-slate-500 mt-1">Acompanhe a inteligência financeira do seu estoque.</p>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Activity size={32} className="animate-pulse text-blue-500" />
          <p className="font-medium">Carregando dados financeiros...</p>
        </div>
      ) : (
        <>
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-sm font-semibold">Entradas (Vendas)</p>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp size={20} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800">
                <span className="text-lg text-slate-400 font-medium mr-1">R$</span>
                {formatarMoeda(totalEntradas)}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-sm font-semibold">Saídas (Reposição)</p>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <TrendingDown size={20} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800">
                <span className="text-lg text-slate-400 font-medium mr-1">R$</span>
                {formatarMoeda(totalSaidas)}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-sm font-semibold">Saldo Líquido</p>
                <div className={`p-2 rounded-lg ${saldo >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                  <Wallet size={20} />
                </div>
              </div>
              <h2 className={`text-3xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                <span className={`text-lg font-medium mr-1 ${saldo >= 0 ? 'text-blue-400' : 'text-red-400'}`}>R$</span>
                {formatarMoeda(saldo)}
              </h2>
            </div>

          </div>

          {/* Barra de Proporção (Receitas x Despesas) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-emerald-600 font-bold text-sm uppercase tracking-wide">Receitas</span>
              <span className="text-red-500 font-bold text-sm uppercase tracking-wide">Despesas</span>
            </div>
            <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min(percentualLucro, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Histórico de Transações */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Receipt className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-slate-800">Histórico de Transações</h3>
            </div>

            {movimentacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Receipt size={48} className="text-slate-200 mb-4" />
                <p className="font-semibold">Nenhuma movimentação registrada</p>
                <p className="text-sm">Suas vendas e compras aparecerão aqui.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {movimentacoes.map((mov) => (
                  <div key={mov.id} className="p-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                    
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full flex-shrink-0 ${mov.tipo === 'VENDA' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {mov.tipo === 'VENDA' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-base">
                          {mov.produto}
                        </span>
                        <span className="text-sm text-slate-500">
                          {mov.data} • {mov.quantidade} unidades a R$ {formatarMoeda(mov.valorUnitario)} cada
                        </span>
                      </div>
                    </div>
                    
                    <div className={`font-bold text-lg whitespace-nowrap ${mov.tipo === 'VENDA' ? 'text-emerald-600' : 'text-red-500'}`}>
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