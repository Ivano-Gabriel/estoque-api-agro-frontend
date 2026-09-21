import { useRef, useState } from 'react'

export default function useOperacao() {
  const trava = useRef(false)
  const [enviando, setEnviando] = useState(false)
  async function executar(acao) {
    if (trava.current) return
    trava.current = true
    setEnviando(true)
    try { await acao() }
    catch (error) { alert(error.message || 'Não foi possível concluir a operação.') }
    finally { trava.current = false; setEnviando(false) }
  }
  return { enviando, executar }
}
