import test from 'node:test'
import assert from 'node:assert/strict'
import { numeroDecimal, parsearListaProdutos, produtoRequestDaLinha, validarLinhaProduto } from '../src/utils/cadastroLote.js'

if (!globalThis.crypto) {
  globalThis.crypto = { randomUUID: () => Math.random().toString(36) }
}

test('converte valores brasileiros sem perder centavos', () => {
  assert.equal(numeroDecimal('R$ 1.234,56'), 1234.56)
  assert.equal(numeroDecimal('59.90'), 59.9)
  assert.equal(numeroDecimal(''), '')
})

test('cola lista financeira com cabeçalho e preenche todas as colunas', () => {
  const linhas = parsearListaProdutos(
    'Nome; Qtd; Categoria; Unidade; Compra; Venda; Validade; Descrição\nCamiseta preta; 10; Roupas; PEÇA; 30,00; 59,90; 2027-12-31; Algodão',
    { categoria: 'Geral', tipo: 'UNIDADE', quantidade: '0' },
    true,
  )
  assert.equal(linhas.length, 1)
  assert.equal(linhas[0].nome, 'Camiseta preta')
  assert.equal(linhas[0].custo, '30,00')
  assert.equal(linhas[0].preco, '59,90')
  assert.equal(linhas[0].descricao, 'Algodão')
  assert.equal(produtoRequestDaLinha(linhas[0], true).preco, 59.9)
})

test('aceita somente nomes e aplica os padrões', () => {
  const linhas = parsearListaProdutos(
    'Arroz\nFeijão\nAçúcar',
    { categoria: 'Mercearia', tipo: 'PACOTE', quantidade: '5' },
    false,
  )
  assert.equal(linhas.length, 3)
  assert.equal(linhas[1].categoria, 'Mercearia')
  assert.equal(linhas[1].quantidade, '5')
  assert.deepEqual(validarLinhaProduto(linhas[1], false), [])
  assert.equal(produtoRequestDaLinha(linhas[1], false).preco, 0)
})

test('marca preços obrigatórios somente quando finanças estão ativas', () => {
  const [linha] = parsearListaProdutos(
    'Produto teste; 2; Geral; UNIDADE',
    { categoria: '', tipo: 'UNIDADE', quantidade: '0' },
    true,
  )
  assert.equal(validarLinhaProduto(linha, true).length, 2)
  assert.deepEqual(validarLinhaProduto(linha, false), [])
})
