import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import { useState } from 'react'

function ImagemProdutoUpload({ value, onChange, lojaSlug }) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  async function selecionar(event) {
    const arquivo = event.target.files?.[0]
    if (!arquivo) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
      setErro('Use JPG, PNG ou WebP com no máximo 5 MB.'); return
    }
    if (!cloud || !preset) { setErro('Upload de fotos ainda não configurado.'); return }
    setEnviando(true); setErro('')
    try {
      const dados = new FormData(); dados.append('file', arquivo); dados.append('upload_preset', preset)
      dados.append('folder', `estoque/${lojaSlug || 'loja'}`)
      const resposta = await globalThis.fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: dados })
      if (!resposta.ok) throw new Error('Não foi possível enviar a foto.')
      const resultado = await resposta.json(); onChange(resultado.secure_url)
    } catch (e) { setErro(e.message) } finally { setEnviando(false); event.target.value = '' }
  }

  return <div className="space-y-2">
    <span className="block text-[9px] font-bold opacity-50 uppercase tracking-widest">Foto do produto (opcional)</span>
    {value ? <div className="relative w-28 h-28"><img src={value} alt="Prévia" className="w-full h-full object-cover border border-current/20"/><button type="button" onClick={() => onChange('')} className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full"><X size={13}/></button></div> :
      <label className="btn-secondary inline-flex items-center gap-2 px-4 py-3 cursor-pointer text-xs"><ImagePlus size={16}/>{enviando ? <><LoaderCircle size={14} className="animate-spin"/> Enviando</> : 'Escolher foto'}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionar} disabled={enviando}/></label>}
    {erro && <p className="text-xs text-rose-500">{erro}</p>}
  </div>
}

export default ImagemProdutoUpload
