import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import { useState } from 'react'
import API_URL, { apiFetch } from '../config/api'
import { imagemProdutoUrl } from '../utils/cloudinary'

function ImagemProdutoUpload({ value, onChange, token }) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function selecionar(event) {
    const arquivo = event.target.files?.[0]
    if (!arquivo) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
      setErro('Use JPG, PNG ou WebP com no máximo 5 MB.'); return
    }
    setEnviando(true); setErro('')
    try {
      const autorizacaoResposta = await apiFetch(`${API_URL}/midias/assinatura-upload`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const autorizacao = await autorizacaoResposta.json()
      const dados = new FormData()
      dados.append('file', arquivo)
      dados.append('api_key', autorizacao.apiKey)
      dados.append('timestamp', String(autorizacao.timestamp))
      dados.append('signature', autorizacao.assinatura)
      dados.append('upload_preset', autorizacao.uploadPreset)
      dados.append('folder', autorizacao.pasta)
      const resposta = await globalThis.fetch(`https://api.cloudinary.com/v1_1/${autorizacao.cloudName}/image/upload`, { method: 'POST', body: dados })
      if (!resposta.ok) throw new Error('Não foi possível enviar a foto.')
      const resultado = await resposta.json(); onChange(resultado.secure_url)
    } catch (e) { setErro(e.message) } finally { setEnviando(false); event.target.value = '' }
  }

  return <div className="space-y-2">
    <span className="block text-[9px] font-bold opacity-50 uppercase tracking-widest">Foto do produto (opcional)</span>
    {value ? <div className="relative w-36 aspect-square border border-current/20 bg-white p-2"><img src={imagemProdutoUrl(value, 400)} alt="Prévia completa do produto" className="w-full h-full object-contain"/><button type="button" onClick={() => onChange('')} className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full"><X size={13}/></button></div> :
      <label className="btn-secondary inline-flex items-center gap-2 px-4 py-3 cursor-pointer text-xs"><ImagePlus size={16}/>{enviando ? <><LoaderCircle size={14} className="animate-spin"/> Enviando</> : 'Escolher foto'}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionar} disabled={enviando}/></label>}
    {erro && <p className="text-xs text-rose-500">{erro}</p>}
  </div>
}

export default ImagemProdutoUpload
