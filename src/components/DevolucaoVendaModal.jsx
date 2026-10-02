import { useMemo, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'
import API_URL, { apiFetch } from '../config/api'

const formas = [['PIX','PIX'],['DINHEIRO','Dinheiro'],['CARTAO_DEBITO','Cartão de débito'],['CARTAO_CREDITO','Cartão de crédito'],['OUTRO','Outro']]

export default function DevolucaoVendaModal({ venda, token, onClose, onSuccess }) {
  const [quantidades,setQuantidades]=useState({})
  const [motivo,setMotivo]=useState('')
  const [forma,setForma]=useState('PIX')
  const [erro,setErro]=useState('')
  const [enviando,setEnviando]=useState(false)
  const itens=useMemo(()=>venda?.itens?.map(item=>({...item,disponivel:item.quantidade-(item.quantidadeDevolvida||0)})).filter(item=>item.disponivel>0)||[],[venda])
  if(!venda)return null
  async function confirmar(event){event.preventDefault();const selecionados=itens.map(item=>({vendaItemId:item.id,quantidade:Number(quantidades[item.id]||0)})).filter(item=>item.quantidade>0);if(!selecionados.length){setErro('Informe a quantidade de pelo menos um item.');return}setEnviando(true);setErro('');try{await apiFetch(`${API_URL}/vendas/${venda.id}/devolucoes`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({motivo,formaReembolso:forma,itens:selecionados})});await onSuccess();onClose()}catch(e){setErro(e.message)}finally{setEnviando(false)}}
  return <div className="fixed inset-0 z-[90] bg-black/80 flex items-end sm:items-center justify-center sm:p-4"><form onSubmit={confirmar} className="glass-panel !bg-[var(--bg-color)] w-full sm:max-w-xl max-h-[94dvh] overflow-y-auto rounded-t-2xl sm:rounded-sm p-6 space-y-5"><div className="flex justify-between"><div><h2 className="text-2xl font-black">Troca ou devolução</h2><p className="opacity-55">O estoque e o caixa serão corrigidos juntos.</p></div><button type="button" onClick={onClose} className="touch-button"><X/></button></div><div className="space-y-2">{itens.map(item=><label key={item.id} className="flex items-center gap-3 border border-current/15 p-3"><span className="flex-1"><strong className="block">{item.nome}</strong><small className="opacity-55">Disponível para devolver: {item.disponivel}</small></span><input aria-label={`Quantidade de ${item.nome}`} className="control-field !w-24" type="number" min="0" max={item.disponivel} value={quantidades[item.id]||''} onChange={e=>setQuantidades({...quantidades,[item.id]:e.target.value})}/></label>)}</div><label className="field-label">Motivo<textarea required maxLength="300" className="control-field w-full mt-2" rows="3" value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Ex.: tamanho incorreto, defeito..."/></label><label className="field-label">Forma do reembolso<select className="control-field w-full mt-2" value={forma} onChange={e=>setForma(e.target.value)}>{formas.map(([id,nome])=><option value={id} key={id}>{nome}</option>)}</select></label>{erro&&<p className="error-box">{erro}</p>}<div className="grid grid-cols-2 gap-3"><button type="button" onClick={onClose} className="btn-secondary mobile-action">Cancelar</button><button disabled={enviando} className="btn-primary mobile-action flex items-center justify-center gap-2"><RotateCcw size={18}/>{enviando?'Registrando...':'Confirmar'}</button></div></form></div>
}
