import { useState, useEffect } from 'react'

function Dashboard({ token }) {
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    fetch('http://localhost:8081/produtos', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setProdutos(data))
  }, [token])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Estoque Agro</h1>
      <h2>Produtos</h2>
      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado ainda.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Categoria</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>{p.tipo}</td>
                <td>R$ {p.preco}</td>
                <td>{p.quantidadeEstoque}</td>
                <td>{p.categoria?.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Dashboard