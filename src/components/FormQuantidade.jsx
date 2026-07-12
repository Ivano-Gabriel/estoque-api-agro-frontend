import { useState } from 'react'

function FormQuantidade({ produto, tipo, token, onFechar, onAtualizado }) {
  const [quantidade, setQuantidade] = useState('')

  async function handleConfirmar() {
    const rota = tipo === 'vender' ? 'vender' : 'comprar'
    await fetch(`https://estoque-api-agro.onrender.com/produtos/${produto.id}/${rota}?quantidade=${quantidade}`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    })
    onAtualizado()
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
        padding: '32px', width: '360px',
        border: '1px solid #222'
      }}>
        <h2 style={{ marginBottom: '8px', fontSize: '18px' }}>
          {tipo === 'vender' ? 'Vender' : 'Repor'} produto
        </h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
          {produto.nome} — {produto.quantidadeEstoque} un em estoque
        </p>

        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={e => setQuantidade(e.target.value)}
          style={{ marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className={tipo === 'vender' ? 'btn-danger' : 'btn-success'}
            onClick={handleConfirmar}
            style={{ flex: 1 }}>
            Confirmar
          </button>
          <button onClick={onFechar}
            style={{ flex: 1, background: '#1a1a1a', color: '#888' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default FormQuantidade