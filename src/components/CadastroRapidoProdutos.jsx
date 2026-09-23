import { AlertTriangle, CheckCircle2, ClipboardPaste, CopyPlus, ListPlus, Plus, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import API_URL, { apiFetch } from '../config/api'
import { novaLinhaProduto, parsearListaProdutos, produtoRequestDaLinha, validarLinhaProduto } from '../utils/cadastroLote'

const TIPOS_COMUNS = ['UNIDADE', 'PEÇA', 'PACOTE', 'CAIXA', 'KG', 'LITRO']

function CadastroRapidoProdutos({ token, financeiroAtivo, categorias, onClose, onSuccess }) {
  const [linhas, setLinhas] = useState(() => [novaLinhaProduto()])
  const [texto, setTexto] = useState('')
  const [padroes, setPadroes] = useState({ categoria: categorias[0] || '', tipo: 'UNIDADE', quantidade: '0' })
  const [errosServidor, setErrosServidor] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [totalSalvo, setTotalSalvo] = useState(0)

  const preenchidas = useMemo(() => linhas.filter(linha =>
    linha.nome.trim() || linha.categoria.trim() || linha.preco || linha.custo || linha.dataValidade || linha.descricao
  ), [linhas])
  const errosLocais = useMemo(() => preenchidas.map(linha => validarLinhaProduto(linha, financeiroAtivo)), [preenchidas, financeiroAtivo])
  const totalErros = errosLocais.reduce((total, erros) => total + erros.length, 0)

  function atualizar(id, campo, valor) {
    setLinhas(atuais => atuais.map(linha => linha.id === id ? { ...linha, [campo]: valor } : linha))
    setErrosServidor([])
  }

  function adicionarLinhas(quantidade = 1) {
    if (linhas.length >= 200) return
    const disponiveis = Math.min(quantidade, 200 - linhas.length)
    setLinhas(atuais => [...atuais, ...Array.from({ length: disponiveis }, () => novaLinhaProduto(padroes))])
  }

  function remover(id) {
    setLinhas(atuais => atuais.length === 1
      ? [novaLinhaProduto(padroes)]
      : atuais.filter(linha => linha.id !== id))
  }

  function duplicar(linha) {
    if (linhas.length >= 200) return
    const indice = linhas.findIndex(item => item.id === linha.id)
    const copia = novaLinhaProduto({ ...linha, nome: '' })
    delete copia.id
    const nova = novaLinhaProduto(copia)
    setLinhas(atuais => [...atuais.slice(0, indice + 1), nova, ...atuais.slice(indice + 1)])
  }

  function usarLista() {
    const novas = parsearListaProdutos(texto, padroes, financeiroAtivo)
    if (!novas.length) return
    if (novas.length > 200) {
      setErrosServidor([{ linha: 0, campo: 'lote', mensagem: `A lista tem ${novas.length} produtos. Divida em blocos de até 200 para não perder nenhuma linha.` }])
      return
    }
    setLinhas(novas)
    setTexto('')
    setErrosServidor([])
  }

  async function cadastrar() {
    if (!preenchidas.length) {
      setErrosServidor([{ linha: 0, campo: 'lote', mensagem: 'Adicione pelo menos um produto.' }])
      return
    }
    if (totalErros > 0) return

    setEnviando(true)
    setErrosServidor([])
    try {
      const resposta = await apiFetch(`${API_URL}/produtos/cadastro-em-massa`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos: preenchidas.map(linha => produtoRequestDaLinha(linha, financeiroAtivo)) }),
      })
      const resultado = await resposta.json()
      if (!resposta.ok) {
        setErrosServidor(resultado.erros || [{ linha: 0, campo: 'lote', mensagem: 'Não foi possível cadastrar.' }])
        return
      }
      setTotalSalvo(resultado.totalImportado)
      onSuccess()
    } catch (erro) {
      setErrosServidor([{ linha: 0, campo: 'conexão', mensagem: erro.message }])
    } finally {
      setEnviando(false)
    }
  }

  if (totalSalvo > 0) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="glass-panel !bg-[var(--bg-color)] w-full max-w-md p-8 text-center space-y-5">
        <CheckCircle2 size={42} className="mx-auto text-emerald-500" />
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider">Tudo cadastrado</h2>
          <p className="mt-2 text-sm opacity-60">{totalSalvo} produtos entraram no estoque de uma vez.</p>
        </div>
        <button onClick={onClose} className="btn-primary w-full p-3 text-xs font-bold uppercase tracking-widest">Voltar ao estoque</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="glass-panel !bg-[var(--bg-color)] w-full max-w-7xl mx-auto my-2 sm:my-6 overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-current/10 bg-[var(--bg-color)] p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <ListPlus size={22} />
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-widest">Cadastro rápido</h2>
              <p className="mt-1 text-[10px] opacity-50">Até 200 produtos por vez • nenhum entra se houver erro</p>
            </div>
          </div>
          <button onClick={onClose} disabled={enviando} className="p-2 opacity-60 hover:opacity-100"><X size={20} /></button>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
          <section className="grid lg:grid-cols-[1fr_1.35fr] gap-4">
            <div className="border border-current/15 bg-current/5 p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">1. Defina os padrões</h3>
                <p className="text-xs opacity-55 mt-1">Eles preenchem automaticamente os produtos colados ou adicionados.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="text-[10px] font-bold uppercase tracking-wider">
                  Categoria
                  <input list="categorias-rapidas" value={padroes.categoria} onChange={e => setPadroes({ ...padroes, categoria: e.target.value })} placeholder="Ex.: Roupas" className="control-field w-full p-2.5 mt-2 normal-case" />
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wider">
                  Unidade
                  <input list="tipos-rapidos" value={padroes.tipo} onChange={e => setPadroes({ ...padroes, tipo: e.target.value })} className="control-field w-full p-2.5 mt-2" />
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wider col-span-2 sm:col-span-1">
                  Estoque inicial
                  <input type="number" min="0" step="1" value={padroes.quantidade} onChange={e => setPadroes({ ...padroes, quantidade: e.target.value })} className="control-field w-full p-2.5 mt-2" />
                </label>
              </div>
              <datalist id="categorias-rapidas">{categorias.map(categoria => <option key={categoria} value={categoria} />)}</datalist>
              <datalist id="tipos-rapidos">{TIPOS_COMUNS.map(tipo => <option key={tipo} value={tipo} />)}</datalist>
            </div>

            <div className="border border-current/15 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <ClipboardPaste size={18} className="mt-0.5" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest">2. Cole a lista</h3>
                  <p className="text-xs opacity-55 mt-1">
                    Um nome por linha já funciona. Para trazer tudo: Nome; Qtd; Categoria; Unidade{financeiroAtivo ? '; Compra; Venda; Validade; Descrição' : '; Validade; Descrição'}.
                  </p>
                </div>
              </div>
              <textarea value={texto} onChange={e => setTexto(e.target.value)} rows="4" className="control-field w-full p-3 font-mono text-xs" placeholder={financeiroAtivo ? 'Camiseta preta; 10; Roupas; PEÇA; 30,00; 59,90' : 'Camiseta preta; 10; Roupas; PEÇA'} />
              <button onClick={usarLista} disabled={!texto.trim()} className="btn-secondary w-full sm:w-auto px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30">
                Transformar em produtos
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">3. Confira e salve</h3>
                <p className="text-xs opacity-55 mt-1">{preenchidas.length} produto(s) preenchido(s) • limite de 200</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => adicionarLinhas(1)} className="btn-secondary flex-1 sm:flex-none px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={14} /> 1 linha</button>
                <button onClick={() => adicionarLinhas(5)} className="btn-secondary flex-1 sm:flex-none px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={14} /> 5 linhas</button>
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto border border-current/15">
              <div className={`min-w-[1280px] grid ${financeiroAtivo ? 'grid-cols-[42px_1.7fr_80px_1fr_110px_110px_110px_135px_1.5fr_72px]' : 'grid-cols-[42px_1.7fr_80px_1fr_110px_135px_1.5fr_72px]'} gap-2 bg-current/5 px-3 py-3 text-[9px] font-black uppercase tracking-widest opacity-65`}>
                <span>#</span><span>Produto</span><span>Qtd.</span><span>Categoria</span><span>Unidade</span>
                {financeiroAtivo && <><span>Compra</span><span>Venda</span></>}
                <span>Validade</span><span>Descrição opcional</span><span></span>
              </div>
              <div className="divide-y divide-current/10 max-h-[46vh] overflow-y-auto">
                {linhas.map((linha, indice) => (
                  <div key={linha.id} className={`min-w-[1280px] grid ${financeiroAtivo ? 'grid-cols-[42px_1.7fr_80px_1fr_110px_110px_110px_135px_1.5fr_72px]' : 'grid-cols-[42px_1.7fr_80px_1fr_110px_135px_1.5fr_72px]'} gap-2 items-center px-3 py-2 ${errosLocais[preenchidas.indexOf(linha)]?.length ? 'bg-rose-500/5' : ''}`}>
                    <span className="text-xs font-mono opacity-45">{indice + 1}</span>
                    <input value={linha.nome} onChange={e => atualizar(linha.id, 'nome', e.target.value)} placeholder="Nome do produto" className="control-field p-2 text-xs" maxLength="120" />
                    <input value={linha.quantidade} onChange={e => atualizar(linha.id, 'quantidade', e.target.value)} type="number" min="0" step="1" className="control-field p-2 text-xs" />
                    <input list="categorias-rapidas" value={linha.categoria} onChange={e => atualizar(linha.id, 'categoria', e.target.value)} placeholder="Categoria" className="control-field p-2 text-xs" maxLength="80" />
                    <input list="tipos-rapidos" value={linha.tipo} onChange={e => atualizar(linha.id, 'tipo', e.target.value)} className="control-field p-2 text-xs" maxLength="40" />
                    {financeiroAtivo && <>
                      <input value={linha.custo} onChange={e => atualizar(linha.id, 'custo', e.target.value)} inputMode="decimal" placeholder="R$ 0,00" className="control-field p-2 text-xs" />
                      <input value={linha.preco} onChange={e => atualizar(linha.id, 'preco', e.target.value)} inputMode="decimal" placeholder="R$ 0,00" className="control-field p-2 text-xs" />
                    </>}
                    <input value={linha.dataValidade} onChange={e => atualizar(linha.id, 'dataValidade', e.target.value)} type="date" className="control-field p-2 text-xs" />
                    <input value={linha.descricao} onChange={e => atualizar(linha.id, 'descricao', e.target.value)} placeholder="Cor, tamanho, marca..." className="control-field p-2 text-xs" maxLength="500" />
                    <div className="flex gap-1">
                      <button onClick={() => duplicar(linha)} title="Duplicar padrões desta linha" className="p-2 border border-current/15"><CopyPlus size={14} /></button>
                      <button onClick={() => remover(linha.id)} title="Remover" className="p-2 border border-rose-500/25 text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:hidden space-y-3">
              {linhas.map((linha, indice) => {
                const erros = errosLocais[preenchidas.indexOf(linha)] || []
                return <div key={linha.id} className={`border p-4 space-y-3 ${erros.length ? 'border-rose-500/40 bg-rose-500/5' : 'border-current/15'}`}>
                  <div className="flex justify-between items-center"><strong className="text-xs uppercase tracking-widest">Produto {indice + 1}</strong><div className="flex gap-2"><button onClick={() => duplicar(linha)} className="p-2 border border-current/15"><CopyPlus size={14}/></button><button onClick={() => remover(linha.id)} className="p-2 border border-rose-500/25 text-rose-500"><Trash2 size={14}/></button></div></div>
                  <label className="block text-[10px] font-bold uppercase">Nome<input value={linha.nome} onChange={e => atualizar(linha.id, 'nome', e.target.value)} className="control-field w-full p-3 mt-1 normal-case" /></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-[10px] font-bold uppercase">Quantidade<input value={linha.quantidade} onChange={e => atualizar(linha.id, 'quantidade', e.target.value)} type="number" min="0" step="1" className="control-field w-full p-3 mt-1" /></label>
                    <label className="text-[10px] font-bold uppercase">Unidade<input list="tipos-rapidos" value={linha.tipo} onChange={e => atualizar(linha.id, 'tipo', e.target.value)} className="control-field w-full p-3 mt-1" /></label>
                  </div>
                  <label className="block text-[10px] font-bold uppercase">Categoria<input list="categorias-rapidas" value={linha.categoria} onChange={e => atualizar(linha.id, 'categoria', e.target.value)} className="control-field w-full p-3 mt-1 normal-case" /></label>
                  {financeiroAtivo && <div className="grid grid-cols-2 gap-3"><label className="text-[10px] font-bold uppercase">Preço de compra<input value={linha.custo} onChange={e => atualizar(linha.id, 'custo', e.target.value)} inputMode="decimal" className="control-field w-full p-3 mt-1" /></label><label className="text-[10px] font-bold uppercase">Preço de venda<input value={linha.preco} onChange={e => atualizar(linha.id, 'preco', e.target.value)} inputMode="decimal" className="control-field w-full p-3 mt-1" /></label></div>}
                  <label className="block text-[10px] font-bold uppercase">Validade opcional<input value={linha.dataValidade} onChange={e => atualizar(linha.id, 'dataValidade', e.target.value)} type="date" className="control-field w-full p-3 mt-1" /></label>
                  <label className="block text-[10px] font-bold uppercase">Descrição opcional<textarea value={linha.descricao} onChange={e => atualizar(linha.id, 'descricao', e.target.value)} rows="2" maxLength="500" className="control-field w-full p-3 mt-1 normal-case" placeholder="Cor, tamanho, marca ou detalhe importante" /></label>
                  {erros.length > 0 && <p className="text-xs text-rose-500">{erros.join(' ')}</p>}
                </div>
              })}
            </div>
          </section>

          {(totalErros > 0 || errosServidor.length > 0) && <div className="border border-rose-500/30 bg-rose-500/5 p-4 text-rose-500">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={17}/><strong className="text-xs uppercase tracking-widest">Revise antes de salvar</strong></div>
            {totalErros > 0 && <p className="text-xs">Existem {totalErros} ajuste(s) marcado(s) na grade.</p>}
            {errosServidor.slice(0, 20).map((erro, indice) => <p key={`${erro.linha}-${erro.campo}-${indice}`} className="text-xs mt-1">{erro.linha ? `Produto ${erro.linha}` : 'Lista'} • {erro.mensagem}</p>)}
          </div>}
        </div>

        <footer className="sticky bottom-0 z-20 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-current/10 bg-[var(--bg-color)] p-4 sm:p-5">
          <button onClick={onClose} disabled={enviando} className="btn-secondary px-6 py-3 text-xs font-bold uppercase tracking-widest">Cancelar</button>
          <button onClick={cadastrar} disabled={enviando || !preenchidas.length || totalErros > 0} className="btn-primary px-6 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-35 flex items-center justify-center gap-2">
            <ListPlus size={16}/> {enviando ? 'Validando e salvando...' : `Cadastrar ${preenchidas.length || ''} produtos`}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default CadastroRapidoProdutos
