import { useState, useEffect } from 'react'

function Gerenciar({ token }) {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [modalAberto, setModalAberto] = useState(false)
  const [modoModal, setModoModal] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)

  const [form, setForm] = useState({
    nome: '', preco: '', quantidade: '', categoria: '', novaCategoria: '', tipo: 'UNIDADE'
  })

  const [formRepor, setFormRepor] = useState({
    quantidade: '', precoCusto: ''
  })

  const [formVender, setFormVender] = useState({
    quantidade: '', precoVenda: ''
  })

  // Busca o ID do usuário logado (se tiver no token ou localStorage)
  const [usuarioId, setUsuarioId] = useState(null)

  useEffect(() => {
    // Tenta pegar o usuário do localStorage
    const userData = localStorage.getItem('userData')
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUsuarioId(parsed.id)
        console.log('✅ Usuário carregado do localStorage:', parsed.id)
        return // Sai da função se achou
      } catch (e) {
        console.log('Erro ao parsear userData')
      }
    }
    
    // Se chegou aqui, é porque não achou no localStorage
    console.log('⚠️ Usuário não encontrado no localStorage, usando ID 1')
    setUsuarioId(1)
  }, [])

  const carregarProdutos = () => {
    setCarregando(true)
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + '/produtos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setProdutos(data))
    .catch(err => console.log(err))
    .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregarProdutos()
  }, [token])

  const categoriasExistentes = [...new Set(produtos.map(p => p.categoria?.nome).filter(Boolean))]

  function abrirModalNovo() {
    setProdutoSelecionado(null)
    setModoModal('novo')
    setForm({ nome: '', preco: '', quantidade: '', categoria: categoriasExistentes[0] || '', novaCategoria: '', tipo: 'UNIDADE' })
    setModalAberto(true)
  }

  function abrirModalEditar(produto) {
    setProdutoSelecionado(produto)
    setModoModal('editar')
    setForm({
      nome: produto.nome,
      preco: produto.preco || '',
      quantidade: produto.quantidadeEstoque || '',
      categoria: produto.categoria?.nome || '',
      novaCategoria: '',
      tipo: produto.tipo || 'UNIDADE'
    })
    setModalAberto(true)
  }

  function abrirModalRepor(produto) {
    setProdutoSelecionado(produto)
    setModoModal('repor')
    setFormRepor({ quantidade: '', precoCusto: '' })
    setModalAberto(true)
  }

  function abrirModalVender(produto) {
    setProdutoSelecionado(produto)
    setModoModal('vender')
    setFormVender({ quantidade: '', precoVenda: '' })
    setModalAberto(true)
  }

  function abrirModalDeletar(produto) {
    setProdutoSelecionado(produto)
    setModoModal('deletar')
    setModalAberto(true)
  }

  function handleSalvar() {
    const produtoParaSalvar = {
      id: produtoSelecionado ? produtoSelecionado.id : null,
      nome: form.nome,
      preco: parseFloat(form.preco),
      quantidadeEstoque: parseInt(form.quantidade),
      tipo: form.tipo,
      categoria: {
        nome: form.categoria === 'nova_categoria' ? form.novaCategoria : form.categoria
      }
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + '/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(produtoParaSalvar)
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        carregarProdutos()
      } else {
        alert("Ops! Erro ao salvar o produto.")
      }
    })
    .catch(err => console.log(err))
  }

  function handleDeletar() {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + `/produtos/${produtoSelecionado.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        carregarProdutos()
      } else {
        alert("Erro ao deletar produto.")
      }
    })
    .catch(err => console.log(err))
  }

  function handleRepor() {
    const qtd = parseInt(formRepor.quantidade)
    const custo = parseFloat(formRepor.precoCusto)

    if (!qtd || !custo || qtd <= 0 || custo <= 0) {
      alert("Preencha quantidade e preço de custo corretamente.")
      return
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + `/produtos/${produtoSelecionado.id}/compra-com-custo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantidade: qtd,
        precoCompra: custo,
        usuarioId: usuarioId || 1
      })
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        carregarProdutos()
        // Recarrega a página de lucro se estiver aberta (opcional)
      } else {
        alert("Erro ao repor estoque.")
      }
    })
    .catch(err => console.log(err))
  }

  function handleVender() {
    const qtd = parseInt(formVender.quantidade)
    const preco = parseFloat(formVender.precoVenda)

    if (!qtd || !preco || qtd <= 0 || preco <= 0) {
      alert("Preencha quantidade e preço de venda corretamente.")
      return
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    console.log('🔍 Dados que vou enviar:', {
    quantidade: qtd,
    precoVenda: precoVenda,
    usuarioId: usuarioId || 1
  })
    fetch(apiUrl + `/produtos/${produtoSelecionado.id}/venda-com-lucro`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantidade: qtd,
        precoVenda: preco,
        usuarioId: usuarioId || 1
      })
    })
    .then(res => {
      if (res.ok) {
        setModalAberto(false)
        carregarProdutos()
      } else {
        alert("Erro ao vender produto.")
      }
    })
    .catch(err => console.log(err))
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', color: '#f8fafc' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>Gerenciar Estoque</h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '4px 0 0' }}>Cadastre, edite, reponha, venda ou exclua seus itens.</p>
        </div>
        
        <button onClick={abrirModalNovo} style={{ 
          background: '#10b981', color: 'white', padding: '10px 18px', borderRadius: '8px', 
          border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <i className="ti ti-plus" /> Novo Produto
        </button>
      </div>

      {carregando ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>Carregando inventário...</p>
      ) : (
        <div>
          {[...categoriasExistentes, 'Sem Categoria'].map(catNome => {
            const itensDestaCategoria = produtos.filter(p => (p.categoria?.nome || 'Sem Categoria') === catNome)
            
            if (itensDestaCategoria.length === 0) return null

            return (
              <div key={catNome} style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px',
                  borderBottom: '2px solid #334155', paddingBottom: '8px', marginBottom: '16px' 
                }}>
                  🏷️ {catNome}
                </h3>
                
                <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' }}>
                  {itensDestaCategoria.map(p => (
                    <div key={p.id} style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      padding: '16px 20px', background: '#1e293b', flexWrap: 'wrap', gap: '12px',
                      borderBottom: '1px solid #334155'
                    }}>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '16px' }}>{p.nome}</span>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                          R$ {p.preco?.toFixed(2)} • Estoque: <strong style={{ color: p.quantidadeEstoque <= 5 ? '#ef4444' : '#38bdf8' }}>{p.quantidadeEstoque}</strong> ({p.tipo})
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => abrirModalVender(p)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                          Vender
                        </button>
                        <button onClick={() => abrirModalRepor(p)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #10b981', background: 'transparent', color: '#10b981', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                          Repor
                        </button>
                        <button onClick={() => abrirModalEditar(p)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                          Editar
                        </button>
                        <button onClick={() => abrirModalDeletar(p)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                          Excluir
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div style={{ 
            background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155',
            width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            animation: 'slideIn 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
                {modoModal === 'novo' && 'Criar Novo Produto'}
                {modoModal === 'editar' && 'Editar Produto'}
                {modoModal === 'repor' && 'Repor Estoque'}
                {modoModal === 'vender' && 'Vender Produto'}
                {modoModal === 'deletar' && 'Confirmar Exclusão'}
              </h2>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>

            {(modoModal === 'novo' || modoModal === 'editar') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Nome do Produto</label>
                  <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Preço de Venda (R$)</label>
                    <input value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} type="number" step="0.01" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Qtd em Estoque</label>
                    <input value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} type="number" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Categoria</label>
                    <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }}>
                      <option value="" disabled>Selecione...</option>
                      {categoriasExistentes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="nova_categoria">➕ Criar Nova Categoria...</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Tipo</label>
                    <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }}>
                      <option value="UNIDADE">Unidade (un)</option>
                      <option value="KG">Quilo (kg)</option>
                      <option value="CAIXA">Caixa (cx)</option>
                      <option value="LITRO">Litro (L)</option>
                    </select>
                  </div>
                </div>
                {form.categoria === 'nova_categoria' && (
                  <div style={{ animation: 'slideIn 0.2s ease-out' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#38bdf8', marginBottom: '6px' }}>Nome da Nova Categoria</label>
                    <input value={form.novaCategoria} onChange={e => setForm({...form, novaCategoria: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }} />
                  </div>
                )}
              </div>
            )}

            {modoModal === 'repor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                  Produto: <strong style={{ color: '#f8fafc' }}>{produtoSelecionado?.nome}</strong>
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Quantidade a Repor</label>
                  <input value={formRepor.quantidade} onChange={e => setFormRepor({...formRepor, quantidade: e.target.value})} type="number" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Preço Unitário de Custo (R$)</label>
                  <input value={formRepor.precoCusto} onChange={e => setFormRepor({...formRepor, precoCusto: e.target.value})} type="number" step="0.01" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }} />
                </div>
              </div>
            )}

            {modoModal === 'vender' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                  Produto: <strong style={{ color: '#f8fafc' }}>{produtoSelecionado?.nome}</strong>
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  Estoque atual: <strong style={{ color: '#38bdf8' }}>{produtoSelecionado?.quantidadeEstoque}</strong>
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Quantidade a Vender</label>
                  <input value={formVender.quantidade} onChange={e => setFormVender({...formVender, quantidade: e.target.value})} type="number" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Preço Unitário de Venda (R$)</label>
                  <input value={formVender.precoVenda} onChange={e => setFormVender({...formVender, precoVenda: e.target.value})} type="number" step="0.01" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '14px' }} />
                </div>
              </div>
            )}

            {modoModal === 'deletar' && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '15px', color: '#e2e8f0', lineHeight: '1.6' }}>
                  Tem certeza absoluta que deseja excluir <strong>{produtoSelecionado?.nome}</strong>? Esta ação é irreversível.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalAberto(false)} style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontWeight: '600', cursor: 'pointer' }}>
                Cancelar
              </button>
              
              {modoModal === 'deletar' && (
                <button onClick={handleDeletar} style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  Confirmar Exclusão
                </button>
              )}

              {modoModal === 'repor' && (
                <button onClick={handleRepor} style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  Confirmar Reposição
                </button>
              )}

              {modoModal === 'vender' && (
                <button onClick={handleVender} style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  Confirmar Venda
                </button>
              )}

              {(modoModal === 'novo' || modoModal === 'editar') && (
                <button onClick={handleSalvar} style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  Salvar Produto
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default Gerenciar