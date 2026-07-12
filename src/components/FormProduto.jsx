import { useState } from 'react'

function FormProduto({ token, onProdutoAdicionado, onFechar }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [preco, setPreco] = useState('')
  const [dataValidade, setDataValidade] = useState('')
  const [categoria, setCategoria] = useState('')

  async function handleSalvar() {
    await fetch('https://estoque-api-agro.onrender.com/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        nome,
        tipo,
        preco: parseFloat(preco),
        dataValidade,
        categoria: { nome: categoria }
      })
    })
    onProdutoAdicionado()
    onFechar()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200
    }}>
      <div style={{
        background: '#111', borderRadius: '12px',
        padding: '32px', width: '420px',
        border: '1px solid #222'
      }}>
        <h2 style={{ marginBottom: '24px', fontSize: '18px' }}>Novo produto</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Nome do produto" value={nome} onChange={e => setNome(e.target.value)} />
          <input placeholder="Tipo (ex: Pacote 1kg)" value={tipo} onChange={e => setTipo(e.target.value)} />
          <input placeholder="Preço (ex: 8.99)" value={preco} onChange={e => setPreco(e.target.value)} />
          <input type="date" value={dataValidade} onChange={e => setDataValidade(e.target.value)} />
          <input placeholder="Categoria (ex: Alimentos)" value={categoria} onChange={e => setCategoria(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn-primary" onClick={handleSalvar} style={{ flex: 1 }}>Salvar</button>
          <button onClick={onFechar} style={{ flex: 1, background: '#1a1a1a', color: '#888' }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default FormProduto