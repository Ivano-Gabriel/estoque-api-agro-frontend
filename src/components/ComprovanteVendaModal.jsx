import { CheckCircle2, Printer, X } from 'lucide-react'
import { imprimirComprovanteVenda } from '../utils/impressao'

export default function ComprovanteVendaModal({ comprovante, onClose }) {
  if (!comprovante) return null
  return <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/85 sm:p-4 backdrop-blur-md">
    <div className="glass-panel !bg-[var(--bg-color)] w-full sm:max-w-md p-6 sm:p-8 space-y-6 rounded-t-2xl sm:rounded-sm">
      <div className="flex justify-between items-start"><div className="flex gap-3"><CheckCircle2 size={28} className="text-emerald-500"/><div><h2 className="text-xl font-black">{comprovante.exibirValores ? 'Venda concluída' : 'Saída concluída'}</h2><p className="text-sm opacity-60 mt-1">Operação #{comprovante.transacaoId}</p></div></div><button onClick={onClose} className="touch-button"><X size={24}/></button></div>
      <div className="border-y border-current/15 py-4 space-y-2 text-base"><div className="flex justify-between gap-4"><span>{comprovante.quantidade} × {comprovante.produto}</span>{comprovante.exibirValores && <strong>{Number(comprovante.valorTotal).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong>}</div>{comprovante.cliente && <p className="opacity-65">Cliente: {comprovante.cliente}</p>}</div>
      <p className="text-sm opacity-60">A impressão é um comprovante de saída para a impressora térmica. Não é NF-e.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><button onClick={onClose} className="btn-secondary mobile-action">Fechar</button><button onClick={() => imprimirComprovanteVenda(comprovante)} className="btn-primary mobile-action flex items-center justify-center gap-2"><Printer size={20}/> Imprimir</button></div>
    </div>
  </div>
}
