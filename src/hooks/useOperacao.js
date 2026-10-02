import { useRef, useState } from 'react'
import { useDialog } from '../components/dialog-context'

export default function useOperacao() {
  const trava = useRef(false)
  const [enviando, setEnviando] = useState(false)
  const { avisar } = useDialog()
  async function executar(acao) {
    if (trava.current) return
    trava.current = true
    setEnviando(true)
    try { await acao() }
    catch (error) { await avisar(error.message || 'Não foi possível concluir a operação.') }
    finally { trava.current = false; setEnviando(false) }
  }
  return { enviando, executar }
}
