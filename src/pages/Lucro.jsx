import { useState, useEffect } from 'react'

function Lucro() {
  const [movimentacoes, setMovimentacoes] = useState([])

  useEffect(() => {
    const historico = JSON.parse(localStorage.getItem('movimentacoes') || '[]')
    setMovimentacoes(historico)
  }, [])

  const totalSaidas = movimentacoes.filter(m => m.tipo === 'COMPRA').reduce((acc, curr) => acc + curr.total, 0)
  const totalEntradas = movimentacoes.filter(m => m.tipo === 'VENDA').reduce((acc, curr) => acc + curr.total, 0)
  const saldo = totalEntradas - totalSaidas

  const totalMovimentado = totalEntradas + totalSaidas > 0 ? totalEntradas + totalSaidas : 1
  const percentualLucro = (totalEntradas / totalMovimentado) * 100

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>Fluxo de Caixa</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', margin: '4px 0 0' }}>Acompanhe a inteligência financeira do seu estoque.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Entradas (Vendas)</p>
          <h2 style={{ margin: '8px 0 0', fontSize: '28px', color: '#10b981' }}>R$ {totalEntradas.toFixed(2)}</h2>
        </div>

        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Saídas (Reposição)</p>
          <h2 style={{ margin: '8px 0 0', fontSize: '28px', color: '#ef4444' }}>R$ {totalSaidas.toFixed(2)}</h2>
        </div>

        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #3b82f6', boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Saldo Líquido</p>
          <h2 style={{ margin: '8px 0 0', fontSize: '28px', color: saldo >= 0 ? '#38bdf8' : '#ef4444' }}>
            R$ {saldo.toFixed(2)}
          </h2>
        </div>

      </div>

      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>Receitas</span>
          <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>Despesas</span>
        </div>
        
        <div style={{ width: '100%', height: '12px', background: '#ef4444', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
          <div style={{ 
            width: `${percentualLucro}%`, 
            background: '#10b981', 
            height: '100%',
            transition: 'width 1s ease-in-out' 
          }}></div>
        </div>
      </div>

      <h3 style={{ color: '#f8fafc', fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
        Histórico de Transações
      </h3>

      {movimentacoes.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>Nenhuma movimentação registrada ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {movimentacoes.map((mov, index) => (
            <div key={index} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '16px', background: '#1e293b', borderRadius: '12px', borderLeft: `4px solid ${mov.tipo === 'VENDA' ? '#10b981' : '#ef4444'}`
            }}>
              <div>
                <span style={{ display: 'block', fontWeight: 'bold', color: '#e2e8f0', fontSize: '15px' }}>
                  {mov.tipo === 'VENDA' ? '📈 Venda' : '📉 Compra (Reposição)'}: {mov.produto}
                </span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {mov.data} • {mov.quantidade} unidades a R$ {mov.valorUnitario?.toFixed(2)} cada
                </span>
              </div>
              <div style={{ fontWeight: '800', fontSize: '16px', color: mov.tipo === 'VENDA' ? '#10b981' : '#ef4444' }}>
                {mov.tipo === 'VENDA' ? '+' : '-'} R$ {mov.total?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Lucro