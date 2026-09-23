const API_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:8081').replace(/\/$/, '')

export default API_URL

export async function apiFetch(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const response = await globalThis.fetch(url, { ...options, signal: controller.signal })
    if (response.status === 401 && !url.endsWith('/auth/login')) {
      window.dispatchEvent(new CustomEvent('sessao-expirada', { detail: options.headers?.Authorization }))
    }
    // Importações em lote usam 422 para devolver os erros por linha.
    const respostaComErrosPorLinha = response.status === 422
      && (url.endsWith('/produtos/importacao') || url.endsWith('/produtos/cadastro-em-massa'))
    if (!response.ok && !respostaComErrosPorLinha) {
      const text = await response.text()
      let mensagem
      try { mensagem = JSON.parse(text).erro } catch { /* pode ser texto simples */ }
      const error = new Error(response.status === 401
        ? (url.endsWith('/auth/login') ? 'E-mail ou senha incorretos.' : 'Sua sessão expirou. Entre novamente.')
        : response.status === 403 ? 'Seu perfil não tem permissão para esta ação.'
          : mensagem || (text && !text.startsWith('<') && text.length < 250 ? text : 'Não foi possível concluir. Tente novamente.'))
      error.status = response.status
      throw error
    }
    return response
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) {
      throw new Error('Sem confirmação do servidor. Verifique a conexão antes de repetir a operação.')
    }
    throw error
  } finally { clearTimeout(timeout) }
}

const pendingKey = () => `estoque-operacao:${sessionStorage.getItem('userEmail') || 'sessao'}`
export function operacaoPendente() {
  const value = localStorage.getItem(pendingKey())
  return value ? JSON.parse(value) : null
}

function limparPendente(storageKey) {
  localStorage.removeItem(storageKey)
  window.dispatchEvent(new Event('operacao-pendente'))
}

export async function enviarMovimentacao(url, body, token) {
  const storageKey = pendingKey()
  const serialized = JSON.stringify(body)
  let pending = operacaoPendente()
  if (pending && (pending.url !== url || pending.body !== serialized)) {
    throw new Error('Confirme a operação pendente no aviso acima antes de registrar outra movimentação.')
  }
  if (!pending) {
    pending = { url, body: serialized, key: crypto.randomUUID() }
    localStorage.setItem(storageKey, JSON.stringify(pending))
  }
  try {
    const response = await apiFetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Idempotency-Key': pending.key },
      body: serialized
    })
    limparPendente(storageKey)
    window.dispatchEvent(new Event('estoque-alterado'))
    return response
  } catch (error) {
    if (error.status >= 400 && error.status < 500 && ![401, 408, 429].includes(error.status)) limparPendente(storageKey)
    else window.dispatchEvent(new Event('operacao-pendente'))
    throw error
  }
}
