import test from 'node:test'
import assert from 'node:assert/strict'
import { combinarResultadosFinanceiros } from '../src/utils/financeiro.js'

test('painel financeiro continua abrindo quando um histórico falha', () => {
  const resultado = combinarResultadosFinanceiros([
    { status: 'rejected', reason: new Error('endpoint antigo') },
    { status: 'fulfilled', value: { totalEntradas: 50, totalSaidas: 10, saldoLiquido: 40 } },
    { status: 'fulfilled', value: { itens: [], ultima: true } },
  ])

  assert.equal(resultado.falhaTotal, false)
  assert.equal(resultado.fluxo.saldoLiquido, 40)
  assert.deepEqual(resultado.transacoes, [])
  assert.match(resultado.falhas[0], /Histórico de movimentações/)
})

test('painel financeiro identifica indisponibilidade total', () => {
  const falha = { status: 'rejected', reason: new Error('offline') }
  const resultado = combinarResultadosFinanceiros([falha, falha, falha])
  assert.equal(resultado.falhaTotal, true)
  assert.equal(resultado.falhas.length, 3)
})
