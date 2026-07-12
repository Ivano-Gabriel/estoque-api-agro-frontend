import { useState, useEffect } from 'react'
import FormProduto from '../components/FormProduto'
import Navbar from '../components/Navbar'
import FormQuantidade from '../components/FormQuantidade'

function Dashboard({ token, onLogout }) {
  const [produtos, setProdutos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [tipoAcao, setTipoAcao] = useState(null)

  useEffect(() => {
    fetch('https://estoque-api-agro.onrender.com/produtos', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setProdutos(data))
  }, [token])

  function recarregarProdutos() {
    fetch('https://estoque-api-agro.onrender.com/produtos', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setProdutos(data))
  }

  
  async function deletarProduto(id) {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      await fetch(`https://estoque-api-agro.onrender.com/produtos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      recarregarProdutos()
    }
  }

  return (
    <div>
      <Navbar onLogout={onLogout} />

      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Produtos</h1>
            <p style={{ color: '#888', fontSize: '14px' }}>{produtos.length} itens cadastrados</p>
          </div>
          <button className="btn-primary" onClick={() => setMostrarForm(true)}>
              + Adicionar produto
          </button>
        </div>

        {produtos.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '60px' }}>
            Nenhum produto cadastrado ainda.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id}>
                  <td style={{ color: '#555' }}>#{p.id}</td>
                  <td style={{ fontWeight: '500', color: '#fff' }}>{p.nome}</td>
                  <td style={{ color: '#888' }}>{p.tipo}</td>
                  <td>R$ {p.preco.toFixed(2)}</td>
                  <td>
                    <span style={{
                      background: p.quantidadeEstoque <= 5 ? '#ff444420' : '#22c55e20',
                      color: p.quantidadeEstoque <= 5 ? '#ff4444' : '#22c55e',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '13px'
                    }}>
                      {p.quantidadeEstoque} un
                    </span>
                  </td>
                  <td style={{ color: '#888' }}>{p.categoria?.nome}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-success"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => { setProdutoSelecionado(p); setTipoAcao('vender') }}>
                            Vender
                        </button>
                          <button className="btn-primary"
                             style={{ padding: '6px 12px', fontSize: '12px' }}
                             onClick={() => { setProdutoSelecionado(p); setTipoAcao('repor') }}>
                            Repor
                      </button>
                      <button className="btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => deletarProduto(p.id)}>
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {produtoSelecionado && (
          <FormQuantidade
            produto={produtoSelecionado}
            tipo={tipoAcao}
            token={token}
            onFechar={() => setProdutoSelecionado(null)}
            onAtualizado={recarregarProdutos}
          />
        )}
      {mostrarForm && (
            <FormProduto
              token={token}
              onFechar={() => setMostrarForm(false)}
              onProdutoAdicionado={() => {
                setMostrarForm(false)
                recarregarProdutos() 
           }}
          />
      )}
    </div>
  )
}

export default Dashboard