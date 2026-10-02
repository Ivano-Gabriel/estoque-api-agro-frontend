import { useCallback, useRef, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { DialogContext } from './dialog-context'

export function DialogProvider({ children }) {
  const [dialogo, setDialogo] = useState(null)
  const resolver = useRef(null)

  const abrir = useCallback(config => new Promise(resolve => {
    resolver.current = resolve
    setDialogo(config)
  }), [])
  const fechar = useCallback(valor => {
    setDialogo(null)
    resolver.current?.(valor)
    resolver.current = null
  }, [])

  const api = {
    avisar: (mensagem, titulo = 'Atenção') => abrir({ tipo: 'aviso', titulo, mensagem }),
    confirmar: (mensagem, titulo = 'Confirme a ação') => abrir({ tipo: 'confirmar', titulo, mensagem }),
    solicitar: (mensagem, valor = '', titulo = 'Informe os dados') => abrir({ tipo: 'solicitar', titulo, mensagem, valor }),
  }

  return <DialogContext.Provider value={api}>{children}{dialogo && <Dialogo config={dialogo} fechar={fechar}/>}</DialogContext.Provider>
}

function Dialogo({ config, fechar }) {
  const [valor, setValor] = useState(config.valor || '')
  const confirmar = event => { event?.preventDefault(); fechar(config.tipo === 'solicitar' ? valor.trim() : true) }
  return <div className="fixed inset-0 z-[120] bg-black/80 flex items-end sm:items-center justify-center sm:p-4" onMouseDown={e => e.target === e.currentTarget && fechar(config.tipo === 'aviso' ? true : false)}>
    <form onSubmit={confirmar} className="glass-panel !bg-[var(--bg-color)] w-full sm:max-w-md rounded-t-2xl sm:rounded-sm p-6 space-y-5" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="flex justify-between gap-4"><div className="flex gap-3"><AlertTriangle className="text-amber-500 shrink-0"/><div><h2 id="dialog-title" className="text-xl font-black">{config.titulo}</h2><p className="opacity-65 mt-2 leading-relaxed">{config.mensagem}</p></div></div><button type="button" onClick={() => fechar(config.tipo === 'aviso' ? true : false)} className="touch-button"><X/></button></div>
      {config.tipo === 'solicitar' && <textarea autoFocus required maxLength="500" rows="3" className="control-field w-full" value={valor} onChange={e => setValor(e.target.value)}/>} 
      <div className={`grid gap-3 ${config.tipo === 'aviso' ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {config.tipo !== 'aviso' && <button type="button" className="btn-secondary mobile-action" onClick={() => fechar(false)}>Cancelar</button>}
        <button autoFocus={config.tipo !== 'solicitar'} className="btn-primary mobile-action">{config.tipo === 'aviso' ? 'Entendi' : 'Confirmar'}</button>
      </div>
    </form>
  </div>
}
