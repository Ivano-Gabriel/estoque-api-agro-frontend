import { useCallback, useEffect, useState } from 'react'
import { Banknote, LockKeyhole } from 'lucide-react'
import API_URL, { apiFetch } from '../config/api'

const moeda = valor => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CaixaOperacional({ token, ativo, onChange }) {
  const [caixa, setCaixa] = useState(null)
  const [saldo, setSaldo] = useState('0')
  const [informado, setInformado] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const carregar = useCallback(async () => {
    if (!ativo) return
    try {
      const resposta = await apiFetch(`${API_URL}/caixas/atual`, { headers: { Authorization: `Bearer ${token}` } })
      const atual = resposta.status === 204 ? null : await resposta.json()
      setCaixa(atual); onChange?.(Boolean(atual))
    } catch (e) { setErro(e.message); onChange?.(false) }
  }, [ativo, token, onChange])
  useEffect(() => { carregar() }, [carregar])
  if (!ativo) return null
  async function enviar(caminho, body) {
    setCarregando(true); setErro('')
    try {
      const resposta = await apiFetch(`${API_URL}/caixas/${caminho}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const resultado = await resposta.json()
      const aberto = resultado.status === 'ABERTO' ? resultado : null
      setCaixa(aberto); onChange?.(Boolean(aberto)); setInformado('')
    } catch (e) { setErro(e.message) } finally { setCarregando(false) }
  }
  return <section className="glass-panel mobile-panel mb-4">
    {caixa ? <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
      <div className="cash-open-summary"><div><p className="field-label">Vendas deste turno</p><strong>{moeda(caixa.totalVendas)}</strong></div><div><p className="field-label">Dinheiro esperado na gaveta</p><strong>{moeda(caixa.saldoAtual)}</strong></div><div><p className="field-label">PIX, cartão e outras formas</p><strong>{moeda(Number(caixa.totalVendas || 0) - Number(caixa.totalDinheiro || 0))}</strong></div><p className="text-sm opacity-55 sm:col-span-3">Caixa aberto em {new Date(caixa.abertaEm).toLocaleString('pt-BR')}</p></div>
      <div className="flex gap-2 items-end"><label className="field-label">Valor contado<input type="number" min="0" step="0.01" value={informado} onChange={e => setInformado(e.target.value)} className="control-field mt-2" placeholder={moeda(caixa.saldoAtual)} /></label><button disabled={carregando || informado === ''} onClick={() => enviar('fechamento', { saldoInformado: Number(informado), observacoes: null })} className="btn-secondary mobile-action"><LockKeyhole size={18} /> Fechar</button></div>
    </div> : <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between"><div><h2 className="font-black text-xl">Abra seu caixa</h2><p className="opacity-55">Informe o dinheiro inicial da gaveta antes da primeira venda.</p></div><div className="flex gap-2 items-end"><label className="field-label">Saldo inicial<input type="number" min="0" step="0.01" value={saldo} onChange={e => setSaldo(e.target.value)} className="control-field mt-2" /></label><button disabled={carregando} onClick={() => enviar('abertura', { saldoInicial: Number(saldo || 0) })} className="btn-primary mobile-action"><Banknote size={18} /> Abrir caixa</button></div></div>}
    {erro && <p role="alert" className="error-box mt-3">{erro}</p>}
  </section>
}
