import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const estoqueCritico = produtos.filter(p => p.quantidadeEstoque <= 5).length
  const patrimonio = produtos.reduce((acc, p) => acc + (p.preco * p.quantidadeEstoque), 0)

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', color: '#f8fafc' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>Visão Geral</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', margin: '4px 0 0' }}>Bem-vindo de volta ao Estoque Inteligente.</p>
      </div>

      {carregando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <h3 style={{ animation: 'pulse 1.5s infinite' }}>📊 Calculando métricas...</h3>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Tipos de Produtos</p>
              <h2 style={{ margin: '8px 0 0', fontSize: '32px', color: '#3b82f6' }}>{totalItens}</h2>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Estoque Crítico (≤ 5)</p>
              <h2 style={{ margin: '8px 0 0', fontSize: '32px', color: estoqueCritico > 0 ? '#ef4444' : '#10b981' }}>
                {estoqueCritico} <span style={{fontSize: '14px', fontWeight: 'normal', color: '#94a3b8'}}>itens</span>
              </h2>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Patrimônio Bruto</p>
              <h2 style={{ margin: '8px 0 0', fontSize: '28px', color: '#10b981' }}>
                R$ {patrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <h3 style={{ color: '#f8fafc', fontSize: '18px', marginBottom: '16px' }}>Ações Rápidas</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            
            <button 
              onClick={() => navigate('/produtos')}
              style={{ 
                flex: '1', minWidth: '200px', padding: '20px', background: '#3b82f6', color: 'white', 
                borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)', transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🛒 Frente de Caixa
            </button>

            <button 
              onClick={() => navigate('/gerenciar')}
              style={{ 
                flex: '1', minWidth: '200px', padding: '20px', background: '#1e293b', color: '#38bdf8', 
                borderRadius: '16px', border: '1px solid #38bdf8', cursor: 'pointer', fontSize: '16px', fontWeight: '700',
                transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ⚙️ Gerenciar Estoque
            </button>

          </div>
        </>
      )}
    </div>
  )
}

export default Hub