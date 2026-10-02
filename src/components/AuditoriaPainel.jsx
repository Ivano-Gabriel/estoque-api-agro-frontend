import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import API_URL, { apiFetch } from '../config/api'

export default function AuditoriaPainel({ token }) {
  const [itens,setItens]=useState([]),[erro,setErro]=useState('')
  const carregar=useCallback(async()=>{try{const r=await apiFetch(`${API_URL}/auditoria?tamanho=30`,{headers:{Authorization:`Bearer ${token}`}});setItens((await r.json()).content||[])}catch(e){setErro(e.message)}},[token])
  useEffect(()=>{carregar()},[carregar])
  return <section className="glass-panel p-6 md:col-span-2"><div className="flex gap-3 items-center mb-5"><ShieldCheck/><div><h2 className="font-black text-lg">Auditoria</h2><p className="opacity-55">Quem alterou o quê e quando.</p></div></div>{erro?<p className="error-box">{erro}</p>:<div className="space-y-2 max-h-96 overflow-y-auto">{itens.map(item=><div key={item.id} className="border border-current/10 p-3"><strong>{item.acao} • {item.recurso}</strong><p className="text-sm opacity-60">{item.usuario} • {new Date(item.criadaEm).toLocaleString('pt-BR')}</p>{item.detalhes&&<p className="text-sm mt-1">{item.detalhes}</p>}</div>)}{!itens.length&&<p className="opacity-50">As próximas alterações importantes aparecerão aqui.</p>}</div>}</section>
}
