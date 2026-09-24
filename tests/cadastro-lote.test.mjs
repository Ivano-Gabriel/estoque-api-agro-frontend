import test from 'node:test'
import assert from 'node:assert/strict'
import { novaLinhaProduto, numeroDecimal, produtoRequestDaLinha, validarLinhaProduto } from '../src/utils/cadastroLote.js'

if (!globalThis.crypto) {
  globalThis.crypto = { randomUUID: () => Math.random().toString(36) }
}

test('converte valores brasileiros sem perder centavos', () => {
  assert.equal(numeroDecimal('R$ 1.234,56'), 1234.56)
  assert.equal(numeroDecimal('59.90'), 59.9)
  assert.equal(numeroDecimal(''), '')
})

test('monta produto rápido com padrões explícitos', () => {
  const linha = novaLinhaProduto({ nome: 'Feijão', categoria: 'Mercearia', tipo: 'PACOTE', quantidade: '5' })
  assert.deepEqual(validarLinhaProduto(linha, false), [])
  assert.equal(produtoRequestDaLinha(linha, false).preco, 0)
})

test('marca preços obrigatórios somente quando finanças estão ativas', () => {
  const linha = novaLinhaProduto({ nome: 'Produto teste', quantidade: '2', categoria: 'Geral' })
  assert.equal(validarLinhaProduto(linha, true).length, 2)
  assert.deepEqual(validarLinhaProduto(linha, false), [])
})
