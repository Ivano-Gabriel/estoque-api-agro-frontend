import { CheckCircle2, Printer, X } from 'lucide-react'
import { imprimirComprovantePdv } from '../utils/impressao'

const moeda = valor => Number(valor || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })

export default function ComprovantePdvModal({ venda, onClose }) {
  if (!venda) return null
  return <div className="fixed inset-0 z-[90] bg-black/85 flex items-end sm:items-center justify-center sm:p-4">
    <div className="glass-panel !bg-[var(--bg-color)] w-full sm:max-w-xl rounded-t-2xl sm:rounded-sm p-5 sm:p-7 space-y-5 max-h-[94dvh] overflow-y-auto">
      <div className="flex justify-between gap-3"><div className="flex gap-3"><CheckCircle2 size={32} className="text-emerald-500 shrink-0"/><div><h2 className="text-2xl font-black">Venda concluída</h2><p className="opacity-55 text-sm mt-1">Pedido {venda.id.slice(0,8).toUpperCase()}</p></div></div><button onClick={onClose} className="touch-button"><X/></button></div>
      <div className="divide-y divide-current/10 border-y border-current/15">{venda.itens.map(item => <div key={item.produtoId} className="py-3 flex justify-between gap-3"><span><strong>{item.quantidade}×</strong> {item.nome}</span>{venda.exibirValores && <strong>{moeda(item.total)}</strong>}</div>)}</div>
      {venda.exibirValores && <div className="space-y-2 text-base"><div className="flex justify-between opacity-60"><span>Subtotal</span><span>{moeda(venda.subtotal)}</span></div>{Number(venda.desconto)>0&&<div className="flex justify-between text-emerald-600"><span>Desconto</span><span>- {moeda(venda.desconto)}</span></div>}<div className="flex justify-between text-2xl font-black"><span>Total</span><span>{moeda(venda.total)}</span></div><div className="flex justify-between opacity-65"><span>{venda.formaPagamentoLabel}</span>{venda.troco!=null&&<span>Troco: {moeda(venda.troco)}</span>}</div></div>}
      {venda.cliente && <p className="notice-box">Cliente: <strong>{venda.cliente}</strong></p>}
      <p className="text-sm opacity-55">O comprovante é não fiscal e pode ser impresso em bobina térmica.</p>
      <div className="grid grid-cols-2 gap-3"><button onClick={onClose} className="btn-secondary mobile-action">Fechar</button><button onClick={() => imprimirComprovantePdv(venda)} className="btn-primary mobile-action flex items-center justify-center gap-2"><Printer size={20}/> Imprimir</button></div>
    </div>
  </div>
}
