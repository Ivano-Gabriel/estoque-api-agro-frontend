import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CircleCheck,
  DollarSign,
  Layers3,
  PackageSearch,
  ShoppingCart,
  TrendingUp
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import API_URL, { apiFetch as fetch } from '../config/api'

const CORES_ESTOQUE = {
  critico: '#f43f5e',
  atencao: '#f59e0b',
  saudavel: '#10b981'
}

function nomeCurto(nome = '') {
  return nome.length > 18 ? nome.slice(0, 17) + '…' : nome
}

function TooltipEstoque({ active, payload }) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload
  return (
    <div
      className="border px-4 py-3 shadow-2xl"
      style={{
        background: 'var(--bg-color)',
        borderColor: 'var(--glass-border)',
        color: 'var(--text-color)'
      }}
    >
      <p className="max-w-52 text-xs font-black uppercase tracking-wider">{item.nomeCompleto}</p>
      <p className="mt-1 font-mono text-sm" style={{ color: CORES_ESTOQUE[item.status] }}>
        {item.quantidade} {item.quantidade === 1 ? 'unidade' : 'unidades'}
      </p>
    </div>
  )
}

function Hub({ token, loja }) {
  const [stats, setStats] = useState({
    ativos: 0,
    criticos: 0,
    patrimonio: 0,
    unidades: 0
  })
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')

  const carregarDashboard = useCallback(async () => {
    setCarregando(true)
    setErroCarga('')

    try {
      const [resStats, resProdutos] = await Promise.all([
        fetch(API_URL + '/estatisticas/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(API_URL + '/produtos', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (!resStats.ok || !resProdutos.ok) {
        throw new Error('Não foi possível carregar o panorama do estoque.')
      }

      const [dadosStats, dadosProdutos] = await Promise.all([
        resStats.json(),
        resProdutos.json()
      ])

      const lista = Array.isArray(dadosProdutos) ? dadosProdutos : []
      const unidades = lista.reduce(
        (total, produto) => total + Number(produto.quantidadeEstoque || 0),
        0
      )
      const criticos = lista.filter(
        produto => Number(produto.quantidadeEstoque || 0) <= 5
      ).length

      setProdutos(lista)
      setStats({
        ativos: lista.length,
        criticos,
        unidades,
        patrimonio: Number(dadosStats.patrimonio || 0)
      })
    } catch (error) {
      setErroCarga(error.message)
    } finally {
      setCarregando(false)
    }
  }, [token])

  useEffect(() => {
    carregarDashboard()
  }, [carregarDashboard])

  useEffect(() => {
    window.addEventListener('estoque-alterado', carregarDashboard)
    return () => window.removeEventListener('estoque-alterado', carregarDashboard)
  }, [carregarDashboard])

  const produtosGrafico = useMemo(
    () =>
      [...produtos]
        .sort(
          (produtoA, produtoB) =>
            Number(produtoA.quantidadeEstoque || 0) -
            Number(produtoB.quantidadeEstoque || 0)
        )
        .slice(0, 10)
        .map(produto => {
          const quantidade = Number(produto.quantidadeEstoque || 0)
          const status =
            quantidade <= 5 ? 'critico' : quantidade <= 10 ? 'atencao' : 'saudavel'

          return {
            nome: nomeCurto(produto.nome),
            nomeCompleto: produto.nome,
            quantidade,
            status
          }
        }),
    [produtos]
  )

  const faixasEstoque = useMemo(
    () => [
      {
        nome: 'Crítico',
        valor: produtos.filter(produto => Number(produto.quantidadeEstoque || 0) <= 5).length,
        cor: CORES_ESTOQUE.critico
      },
      {
        nome: 'Atenção',
        valor: produtos.filter(produto => {
          const quantidade = Number(produto.quantidadeEstoque || 0)
          return quantidade > 5 && quantidade <= 10
        }).length,
        cor: CORES_ESTOQUE.atencao
      },
      {
        nome: 'Saudável',
        valor: produtos.filter(produto => Number(produto.quantidadeEstoque || 0) > 10).length,
        cor: CORES_ESTOQUE.saudavel
      }
    ],
    [produtos]
  )

  const produtoMaisCritico = produtosGrafico[0]

  if (erroCarga) {
    return (
      <div role="alert" className="glass-panel p-6">
        <p>{erroCarga}</p>
        <button className="btn-primary p-3 mt-4" onClick={carregarDashboard}>
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto text-current">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-current pb-6 opacity-90">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="opacity-50" />
            <span className="text-[9px] font-black uppercase tracking-[0.28em] opacity-45">
              Inteligência de inventário
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Visão Geral</h1>
          <p className="opacity-50 mt-1 font-mono text-[11px] uppercase tracking-widest">
            Estoque vivo • dados da loja em tempo real
          </p>
        </div>

        <Link
          to="/pdv"
          className="border border-current opacity-70 hover:opacity-100 hover:bg-current/10 flex items-center justify-center gap-2 px-6 py-2.5 transition-all text-xs font-bold tracking-widest uppercase group"
        >
          <ShoppingCart size={14} /> Nova venda
        </Link>
      </header>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40 space-y-4 w-full">
          <Activity size={32} className="animate-pulse" />
          <p className="font-mono text-xs uppercase tracking-widest">Montando panorama...</p>
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 ${
              loja?.financeiroAtivo
                ? 'sm:grid-cols-2 xl:grid-cols-4'
                : 'sm:grid-cols-3'
            }`}
          >
            <div className="glass-panel p-5 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                <PackageSearch size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
                  Catálogo
                </span>
              </div>
              <div>
                <p className="text-4xl font-light font-mono tracking-tighter opacity-90">
                  {stats.ativos}
                </p>
                <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">
                  Produtos ativos
                </h3>
              </div>
            </div>

            <div className="glass-panel p-5 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                <Boxes size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
                  Volume
                </span>
              </div>
              <div>
                <p className="text-4xl font-light font-mono tracking-tighter opacity-90">
                  {stats.unidades.toLocaleString('pt-BR')}
                </p>
                <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">
                  Unidades disponíveis
                </h3>
              </div>
            </div>

            <div className="glass-panel !border-l-rose-600 p-5 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                <AlertTriangle size={18} className="text-rose-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] text-rose-500 opacity-80 uppercase tracking-widest font-bold">
                  Atenção
                </span>
              </div>
              <div>
                <p className="text-4xl font-light font-mono tracking-tighter opacity-90">
                  {stats.criticos}
                </p>
                <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">
                  Estoques críticos
                </h3>
              </div>
            </div>

            {loja?.financeiroAtivo && (
              <div className="glass-panel p-5 flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-6">
                  <DollarSign size={18} className="opacity-40 group-hover:text-emerald-500 group-hover:opacity-100 transition-colors" />
                  <span className="flex items-center gap-1 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
                    <TrendingUp size={12} /> Valor
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-light font-mono tracking-tighter opacity-90">
                    R$ {stats.patrimonio.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <h3 className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-2">
                    Estoque a preço de venda
                  </h3>
                </div>
              </div>
            )}
          </div>

          {produtos.length === 0 ? (
            <div className="glass-panel p-10 text-center border-dashed">
              <Layers3 size={38} className="mx-auto mb-4 opacity-25" />
              <h2 className="font-black uppercase tracking-widest text-sm">
                O gráfico nasce com o primeiro produto
              </h2>
              <p className="text-xs opacity-50 mt-2">
                Cadastre o estoque para acompanhar quantidades e alertas aqui.
              </p>
            </div>
          ) : (
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="glass-panel p-5 sm:p-7 xl:col-span-2 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-7">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-40">
                      Radar operacional
                    </p>
                    <h2 className="text-lg font-black uppercase tracking-wider mt-1">
                      Quantidade por produto
                    </h2>
                    <p className="text-xs opacity-50 mt-1">
                      Até 10 produtos com menor estoque, priorizando o que precisa de atenção.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-55">
                    <span className="w-2 h-2 bg-rose-500" /> Crítico
                    <span className="w-2 h-2 bg-amber-500 ml-2" /> Atenção
                    <span className="w-2 h-2 bg-emerald-500 ml-2" /> Saudável
                  </div>
                </div>

                <div style={{ width: '100%', height: Math.max(310, produtosGrafico.length * 44) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={produtosGrafico}
                      layout="vertical"
                      margin={{ top: 4, right: 18, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        horizontal={false}
                        stroke="var(--glass-border)"
                        strokeDasharray="3 5"
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fill: 'var(--text-color)', fontSize: 10, opacity: 0.45 }}
                        axisLine={{ stroke: 'var(--glass-border)' }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="nome"
                        width={112}
                        tick={{ fill: 'var(--text-color)', fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<TooltipEstoque />}
                        cursor={{ fill: 'var(--glass-border)', opacity: 0.35 }}
                      />
                      <Bar
                        dataKey="quantidade"
                        barSize={18}
                        radius={[0, 8, 8, 0]}
                        isAnimationActive
                        animationDuration={950}
                      >
                        {produtosGrafico.map(produto => (
                          <Cell
                            key={produto.nomeCompleto}
                            fill={CORES_ESTOQUE[produto.status]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-40">
                    Diagnóstico rápido
                  </p>
                  <h2 className="text-lg font-black uppercase tracking-wider mt-1">
                    Saúde do estoque
                  </h2>
                </div>

                <div className="relative h-56 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={faixasEstoque}
                        dataKey="valor"
                        nameKey="nome"
                        innerRadius={62}
                        outerRadius={86}
                        paddingAngle={4}
                        stroke="transparent"
                        isAnimationActive
                        animationDuration={1100}
                      >
                        {faixasEstoque.map(faixa => (
                          <Cell key={faixa.nome} fill={faixa.cor} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(valor, nome) => [`${valor} produtos`, nome]}
                        contentStyle={{
                          background: 'var(--bg-color)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-mono text-4xl font-light">{stats.ativos}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                      produtos
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {faixasEstoque.map(faixa => (
                    <div key={faixa.nome} className="flex items-center justify-between border-b border-current/10 pb-2">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-65">
                        <span className="w-2 h-2" style={{ background: faixa.cor }} />
                        {faixa.nome}
                      </span>
                      <span className="font-mono text-sm">{faixa.valor}</span>
                    </div>
                  ))}
                </div>

                {produtoMaisCritico && (
                  <div className="mt-5 border border-rose-500/25 bg-rose-500/5 p-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">
                      Próxima reposição
                    </span>
                    <p className="font-black uppercase tracking-wide text-sm mt-1">
                      {produtoMaisCritico.nomeCompleto}
                    </p>
                    <p className="font-mono text-xs opacity-55 mt-1">
                      {produtoMaisCritico.quantidade} unidades restantes
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-6 lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="border border-emerald-500/30 text-emerald-500 p-2.5">
                  <CircleCheck size={18} />
                </div>
                <div>
                  <h2 className="font-bold">Leitura atualizada do inventário</h2>
                  <p className="text-sm opacity-60 mt-1">
                    Vendas, reposições, exclusões e restaurações atualizam este panorama.
                  </p>
                </div>
              </div>
              {loja?.financeiroAtivo && (
                <Link to="/lucro" className="text-xs font-black uppercase tracking-widest underline underline-offset-4">
                  Ver finanças
                </Link>
              )}
            </div>

            <div className="glass-panel p-5">
              <h2 className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mb-4">
                Ações rápidas
              </h2>

              <Link
                to="/pdv"
                className="group flex items-center justify-between py-3 border-b border-current/10 hover:border-current/40 transition-colors"
              >
                <span className="text-xs font-bold opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                  Registrar venda
                </span>
                <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/produtos"
                className="group flex items-center justify-between py-3 border-b border-current/10 hover:border-current/40 transition-colors"
              >
                <span className="text-xs font-bold opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                  Inventário
                </span>
                <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/config"
                className="group flex items-center justify-between py-3 mt-2 hover:border-current/40 transition-colors"
              >
                <span className="text-xs font-bold opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                  Sistema
                </span>
                <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Hub
