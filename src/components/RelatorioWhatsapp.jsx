import { useState } from 'react'
import { CalendarDays, LoaderCircle, MessageCircle, X } from 'lucide-react'
import API_URL from '../config/api'

const PERIODOS = [
  { valor: 'DIARIO', titulo: 'Diário', detalhe: 'Hoje, da meia-noite até agora' },
  { valor: 'SEMANAL', titulo: 'Semanal', detalhe: 'Segunda-feira até agora' },
  { valor: 'MENSAL', titulo: 'Mensal', detalhe: 'Primeiro dia do mês até agora' },
]

function RelatorioWhatsapp({ token }) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState('')
  const [erro, setErro] = useState('')

  const fechar = () => {
    if (carregando) return
    setAberto(false)
    setErro('')
  }

  const gerar = async (periodo) => {
    setCarregando(periodo)
    setErro('')

    const abaWhatsapp = window.open('about:blank', '_blank')
    if (abaWhatsapp) {
      abaWhatsapp.opener = null
      abaWhatsapp.document.title = 'Preparando relatório...'
      abaWhatsapp.document.body.innerText = 'Preparando relatório do estoque...'
    }

    try {
      const resposta = await fetch(
        `${API_URL}/relatorios/whatsapp?periodo=${encodeURIComponent(periodo)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const dados = await resposta.json().catch(() => ({}))

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Não foi possível gerar o relatório.')
      }

      if (abaWhatsapp) {
        abaWhatsapp.location.replace(dados.url)
      } else {
        window.location.assign(dados.url)
      }
      setAberto(false)
    } catch (error) {
      if (abaWhatsapp) abaWhatsapp.close()
      setErro(error.message || 'Falha ao gerar o relatório.')
    } finally {
      setCarregando('')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed right-4 bottom-24 md:right-6 md:bottom-6 z-40 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label="Enviar relatório pelo WhatsApp"
        title="Enviar relatório pelo WhatsApp"
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">
          Enviar relatório
        </span>
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-relatorio-whatsapp"
        >
          <div className="glass-panel w-full max-w-md p-6 text-current">
            <div className="flex items-start justify-between gap-4 border-b border-current/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-600 p-2 text-white">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h2 id="titulo-relatorio-whatsapp" className="text-sm font-black uppercase tracking-widest">
                    Enviar relatório
                  </h2>
                  <p className="mt-1 text-[10px] uppercase tracking-widest opacity-50">
                    Escolha o período
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fechar}
                className="p-2 opacity-50 transition hover:opacity-100 disabled:cursor-not-allowed"
                disabled={Boolean(carregando)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-5 border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] font-bold uppercase leading-relaxed tracking-wider text-amber-700 dark:text-amber-300">
              O WhatsApp da chefe será aberto com a mensagem pronta. Confira e pressione enviar.
            </div>

            <div className="space-y-3">
              {PERIODOS.map((periodo) => (
                <button
                  key={periodo.valor}
                  type="button"
                  onClick={() => gerar(periodo.valor)}
                  disabled={Boolean(carregando)}
                  className="btn-secondary flex w-full items-center justify-between gap-4 p-4 text-left disabled:cursor-wait disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <CalendarDays size={17} className="opacity-60" />
                    <span>
                      <strong className="block text-xs uppercase tracking-widest">{periodo.titulo}</strong>
                      <span className="mt-1 block text-[10px] opacity-50">{periodo.detalhe}</span>
                    </span>
                  </span>
                  {carregando === periodo.valor && <LoaderCircle size={17} className="animate-spin" />}
                </button>
              ))}
            </div>

            {erro && (
              <p className="mt-4 border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
                {erro}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default RelatorioWhatsapp
