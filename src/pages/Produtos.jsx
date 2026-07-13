import { useState, useEffect } from 'react'
import FormQuantidade from '../components/FormQuantidade'

function Produtos({ token }) {
  const [produtos, setProdutos] = useState([])
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [busca, setBusca] = useState('')
  const [categoriasAbertas, setCategoriasAbertas] = useState([])

  function recarregarProdutos() {
    fetch('http://localhost:8081/produtos', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setProdutos(data))
  }

  useEffect(() => {
    recarregarProdutos()
  }, [token])

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.categoria?.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const categorias = [...new Set(produtos.map(p => p.categoria?.nome).filter(Boolean))]
  
  function toggleCategoria(cat) {
    setCategoriasAbertas(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* CABEÇALHO */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Frente de Estoque</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0' }}>Selecione o item para registrar a saída.</p>
      </div>

      {/* BUSCA */}
      <input
        placeholder="🔍 Buscar produto ou categoria..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        style={{ 
          width: '100%', padding: '12px 16px', marginBottom: '24px', 
          borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '15px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      />

      {/* LISTA DE PRODUTOS EM CARDS (Mobile First) */}
      {categorias.map(cat => {
        const itens = produtosFiltrados.filter(p => p.categoria?.nome === cat)
        if (itens.length === 0) return null
        const aberta = categoriasAbertas.includes(cat)

        return (
          <div key={cat} style={{ marginBottom: '12px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            
            {/* ACORDEÃO DA CATEGORIA */}
            <div onClick={() => toggleCategoria(cat)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px', cursor: 'pointer', borderBottom: aberta ? '1px solid #f0f0f0' : 'none'
            }}>
              <span style={{ fontWeight: '600', fontSize: '15px', color: '#4f46e5' }}>{cat}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', background: '#f0f0ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px' }}>
                  {itens.length}
                </span>
                <span style={{ color: '#aaa', fontSize: '10px' }}>{aberta ? '▼' : '▶'}</span>
              </div>
            </div>

            {/* ITENS DA CATEGORIA (CARDS) */}
            {aberta && (
              <div style={{ padding: '8px 16px' }}>
                {itens.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: '1px solid #f9f9f9'
                  }}>
                    
                    {/* INFO DO PRODUTO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '15px' }}>
                        {p.nome} <span style={{ fontWeight: '400', fontSize: '12px', color: '#999' }}>({p.tipo})</span>
                      </span>
                      <span style={{ fontSize: '13px', color: '#666' }}>
                        R$ {p.preco.toFixed(2)} • Estoque: {' '}
                        <strong style={{ color: p.quantidadeEstoque <= 5 ? '#e53e3e' : '#38a169' }}>
                          {p.quantidadeEstoque}
                        </strong>
                      </span>
                    </div>

                    {/* BOTÃO DE AÇÃO ÚNICA */}
                    <button 
                      onClick={() => setProdutoSelecionado(p)}
                      style={{
                        background: '#4f46e5', color: '#fff', padding: '10px 16px',
                        borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                        border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
                      }}
                    >
                      Baixa
                    </button>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* MODAL DE BAIXA (FormQuantidade agora só recebe ação de vender nativamente) */}
      {produtoSelecionado && (
        <FormQuantidade
          produto={produtoSelecionado}
          tipo="vender"
          token={token}
          onFechar={() => setProdutoSelecionado(null)}
          onAtualizado={recarregarProdutos}
        />
      )}
    </div>
  )
}

export default Produtos