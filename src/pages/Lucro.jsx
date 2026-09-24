import { useState, useEffect, useCallback } from 'react'
import API_URL, { apiFetch as fetch } from '../config/api'
import { TrendingUp, TrendingDown, Wallet, Activity, ArrowUpRight, ArrowDownRight, Receipt, BadgeDollarSign, Ban, Printer, CreditCard } from 'lucide-react'
import { imprimirComprovantePdv } from '../utils/impressao'

function Lucro({ token }) {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [fluxo, setFluxo] = useState({ totalEntradas: 0, totalSaidas: 0, saldoLiquido: 0 })
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')
  const [vendas, setVendas] = useState([])

  const carregar = useCallback(async () => {
    setCarregando(true); setErroCarga('')
    try {
      const [resTransacoes, resFluxo, resVendas] = await Promise.all([
        fetch(API_URL + '/transacoes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(API_URL + '/fluxo-caixa', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(API_URL + '/vendas', { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      const data = await resTransacoes.json()
      const movs = data.filter(t => !t.estornada).map(t => ({
        id: t.id,
        tipo: t.tipo,
        produto: t.produto?.nome || 'Produto desconhecido',
        quantidade: t.quantidade,
        valorUnitario: Number(t.precoUnitario || 0),
        total: Number(t.valorTotal || 0),
        custoUnitario: Number(t.custoUnitario || 0),
        lucro: Number(t.lucro || 0),
        data: new Date(t.data).toLocaleDateString('pt-BR')
      }))
      setMovimentacoes(movs)
      const caixa = await resFluxo.json()
      setFluxo({
        totalEntradas: Number(caixa.totalEntradas || 0),
        totalSaidas: Number(caixa.totalSaidas || 0),
        saldoLiquido: Number(caixa.saldoLiquido || 0),
        recebimentosPorForma: caixa.recebimentosPorForma || {}
      })
      setVendas(await resVendas.json())
    } catch (err) { setErroCarga(err.message) } finally { setCarregando(false) }
  }, [token])

  useEffect(() => { carregar() }, [carregar])

  async function cancelar(venda) {
    const motivo = prompt('Por que esta venda será cancelada? O estoque e o caixa serão estornados.')
    if (!motivo?.trim()) return
    try {
      await fetch(`${API_URL}/vendas/${venda.id}/cancelamento`, { method:'PUT', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}, body:JSON.stringify({motivo}) })
      await carregar()
    } catch (e) { setErroCarga(e.message) }
  }

  const { totalEntradas, totalSaidas, saldoLiquido: saldo } = fluxo
  const totalMovimentado = totalEntradas + totalSaidas > 0 ? totalEntradas + totalSaidas : 1
  const percentualLucro = (totalEntradas / totalMovimentado) * 100
  const lucroReal = movimentacoes
    .filter(mov => mov.tipo === 'VENDA')
    .reduce((total, mov) => total + mov.lucro, 0)

  const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const rotulosForma = { PIX:'PIX', DINHEIRO:'Dinheiro', CARTAO_DEBITO:'Cartão de débito', CARTAO_CREDITO:'Cartão de crédito', OUTRO:'Outro', NAO_INFORMADO:'Não informado' }

  if (erroCarga) return <div role="alert" className="glass-panel p-6"><p>{erroCarga}</p><button className="btn-primary p-3 mt-4" onClick={() => window.location.reload()}>Tentar novamente</button></div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
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
                <p className="text-[10px] uppercase tracking-widest font-bold">Saldo de vendas e reposições</p>
                <Wallet size={16} />
              </div>
              <h2 className={`text-3xl font-mono font-light tracking-tighter ${saldo >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <span className="text-sm opacity-50 mr-2">R$</span>{formatarMoeda(saldo)}
              </h2>
            </div>

            <div className="glass-panel p-6 flex flex-col justify-between border-l-2 border-sky-500/60">
              <div className="flex items-center justify-between mb-6 opacity-60">
                <p className="text-[10px] uppercase tracking-widest font-bold">Lucro bruto das vendas</p>
                <BadgeDollarSign size={16} />
              </div>
              <h2 className={`text-3xl font-mono font-light tracking-tighter ${lucroReal >= 0 ? 'text-sky-500' : 'text-rose-500'}`}>
                <span className="text-sm opacity-50 mr-2">R$</span>{formatarMoeda(lucroReal)}
              </h2>
            </div>

          </div>

          <div className="glass-panel p-6 mt-6">
            <p className="text-sm opacity-70 mb-4">Lucro bruto considera venda menos custo das mercadorias. Despesas, taxas e estoque inicial não são pagamentos registrados neste caixa.</p>
            <div className="flex justify-between items-center mb-4 opacity-70">
              <span className="font-bold text-[10px] uppercase tracking-widest">Proporção Operacional</span>
            </div>
            <div className="w-full h-1 bg-rose-500/30 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${Math.min(percentualLucro, 100)}%` }}></div>
            </div>
          </div>

          <div className="glass-panel p-6 mt-6">
            <div className="flex items-center gap-3 mb-5"><CreditCard size={20}/><div><h3 className="font-black text-lg">Recebimentos por forma</h3><p className="text-sm opacity-55">Total acumulado das vendas válidas</p></div></div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{Object.entries(fluxo.recebimentosPorForma || {}).filter(([,valor]) => Number(valor)>0).map(([forma,valor]) => <div className="metric-small" key={forma}><span>{rotulosForma[forma] || forma}</span><strong>R$ {formatarMoeda(Number(valor))}</strong></div>)}</div>
            {!Object.values(fluxo.recebimentosPorForma || {}).some(valor => Number(valor)>0) && <p className="opacity-50">As próximas vendas do PDV aparecerão separadas aqui.</p>}
          </div>

          <div className="glass-panel overflow-hidden mt-6">
            <div className="p-6 border-b border-current/10"><h3 className="font-black text-lg">Vendas do PDV</h3><p className="text-sm opacity-55">Reimpressão e cancelamento seguro</p></div>
            {!vendas.length ? <div className="empty-state !min-h-40"><Receipt/><strong>Nenhuma venda no PDV</strong></div> : <div className="divide-y divide-current/10">{vendas.map(venda => <div key={venda.id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${venda.status==='CANCELADA'?'opacity-50':''}`}><div><div className="flex items-center gap-2"><strong>{venda.itens.reduce((s,i)=>s+i.quantidade,0)} itens • R$ {formatarMoeda(Number(venda.total))}</strong>{venda.status==='CANCELADA'&&<span className="status-pending">Cancelada</span>}</div><p className="text-sm opacity-55 mt-1">{new Date(venda.criadaEm).toLocaleString('pt-BR')} • {venda.formaPagamentoLabel}{venda.cliente?` • ${venda.cliente}`:''}</p></div><div className="flex gap-2"><button onClick={()=>imprimirComprovantePdv(venda)} className="touch-button border border-current/20" title="Reimprimir"><Printer size={19}/></button>{venda.status!=='CANCELADA'&&<button onClick={()=>cancelar(venda)} className="touch-button border border-rose-500/30 text-rose-500" title="Cancelar venda"><Ban size={19}/></button>}</div></div>)}</div>}
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
                        {mov.tipo === 'VENDA' && (
                          <span className="text-[10px] font-mono text-sky-500/80 tracking-widest uppercase block mt-1">
                            Custo: R$ {formatarMoeda(mov.custoUnitario)} • Lucro: R$ {formatarMoeda(mov.lucro)}
                          </span>
                        )}
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
