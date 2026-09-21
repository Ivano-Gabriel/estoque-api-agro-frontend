import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import API_URL, { apiFetch, enviarMovimentacao, operacaoPendente } from '../src/config/api.js'

beforeEach(() => {
  const data = new Map([['userEmail', 'teste@loja.com']])
  globalThis.sessionStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }
  globalThis.window = new EventTarget()
})

test('resposta perdida reutiliza a mesma chave e impede iniciar outra movimentação', async () => {
  const url = API_URL + '/produtos/1/venda-com-lucro'
  const headers = []
  globalThis.fetch = async (_url, options) => {
    headers.push(options.headers)
    if (headers.length === 1) throw new TypeError('network disconnected')
    return new Response(null, { status: 204 })
  }
  await assert.rejects(enviarMovimentacao(url, { quantidade: 2, preco: 150 }, 'token'))
  assert.ok(operacaoPendente())
  await assert.rejects(enviarMovimentacao(url, { quantidade: 3, preco: 150 }, 'token'), /pendente/)
  await enviarMovimentacao(url, { quantidade: 2, preco: 150 }, 'token')
  assert.equal(headers[0]['Idempotency-Key'], headers[1]['Idempotency-Key'])
  assert.equal(operacaoPendente(), null)
})

test('401 encerra sessão; 500 não vira estoque vazio', async () => {
  let expired = 0
  window.addEventListener('sessao-expirada', () => expired++)
  globalThis.fetch = async () => new Response('', { status: 401 })
  await assert.rejects(apiFetch(API_URL + '/produtos', { headers: { Authorization: 'Bearer token' } }), /sessão expirou/)
  assert.equal(expired, 1)
  globalThis.fetch = async () => new Response('{"erro":"Falha ao consultar"}', { status: 500 })
  await assert.rejects(apiFetch(API_URL + '/produtos'), /Falha ao consultar/)
})

test('erro de validação libera uma nova operação; 500 conserva a chave para confirmar', async () => {
  const url = API_URL + '/produtos/1/compra-com-custo'
  globalThis.fetch = async () => new Response('{"erro":"Inválido"}', { status: 400 })
  await assert.rejects(enviarMovimentacao(url, { quantidade: 1, preco: -1 }, 'token'))
  assert.equal(operacaoPendente(), null)
  globalThis.fetch = async () => new Response('', { status: 500 })
  await assert.rejects(enviarMovimentacao(url, { quantidade: 1, preco: 10 }, 'token'))
  assert.ok(operacaoPendente())
})

test('erro de senha no login não dispara expiração e 422 mantém os erros da planilha', async () => {
  let expired = 0
  window.addEventListener('sessao-expirada', () => expired++)
  globalThis.fetch = async () => new Response('', { status: 401 })
  await assert.rejects(apiFetch(API_URL + '/auth/login'), /senha incorretos/)
  assert.equal(expired, 0)
  globalThis.fetch = async () => new Response('{"erros":[{"linha":2}]}', { status: 422 })
  const response = await apiFetch(API_URL + '/produtos/importacao')
  assert.equal((await response.json()).erros[0].linha, 2)
})
