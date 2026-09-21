import { useEffect, useState } from 'react'
import { enviarMovimentacao, operacaoPendente } from '../config/api'
import useOperacao from '../hooks/useOperacao'

export default function OperacaoPendente({ token }) {
  const [pending, setPending] = useState(operacaoPendente)
  const { enviando, executar } = useOperacao()
  useEffect(() => {
    const atualizar = () => setPending(operacaoPendente())
    window.addEventListener('operacao-pendente', atualizar)
    window.addEventListener('storage', atualizar)
    return () => {
      window.removeEventListener('operacao-pendente', atualizar)
      window.removeEventListener('storage', atualizar)
    }
  }, [])
  if (!pending) return null
  return <div role="alert" className="bg-amber-100 text-amber-950 p-4 text-sm flex flex-wrap items-center gap-3">
    <span>Há uma movimentação sem confirmação. Confirme antes de registrar outra venda ou reposição.</span>
    <button disabled={enviando} className="border border-current rounded px-3 py-2 font-bold" onClick={() => executar(async () => {
      await enviarMovimentacao(pending.url, JSON.parse(pending.body), token)
      alert('Operação confirmada. O estoque foi atualizado uma única vez.')
    })}>{enviando ? 'Confirmando...' : 'Confirmar operação pendente'}</button>
  </div>
}
