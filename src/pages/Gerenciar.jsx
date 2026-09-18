import { useState, useEffect, useCallback } from 'react'
import { Plus, X, ShoppingCart, TrendingUp, Edit, Trash2, PackageSearch, Tag, Layers, Search, Filter, Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react'
import API_URL from '../config/api'

function Gerenciar({ token, role }) {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [termoBusca, setTermoBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [modoModal, setModoModal] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)

  const [form, setForm] = useState({ nome: '', preco: '', custo: '', quantidade: '', categoria: '', novaCategoria: '', tipo: 'UNIDADE' })
  const [formRepor, setFormRepor] = useState({ quantidade: '', precoCusto: '' })
  const [formVender, setFormVender] = useState({ quantidade: '', precoVenda: '' })
  const [modalImportacao, setModalImportacao] = useState(false)
  const [arquivoImportacao, setArquivoImportacao] = useState(null)
  const [importando, setImportando] = useState(false)
  const [resultadoImportacao, setResultadoImportacao] = useState(null)

  const carregarProdutos = useCallback(() => {
    setCarregando(true)
    fetch(API_URL + '/produtos', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.ok ? res.json() : [])
    .then(data => setProdutos(data))
    .catch(err => console.log(err))
    .finally(() => setCarregando(false))
  }, [token])

  useEffect(() => { carregarProdutos() }, [carregarProdutos])

  const categoriasExistentes = [...new Set(produtos.map(p => p.categoria?.nome).filter(Boolean))]

  const produtosFiltrados = produtos.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(termoBusca.toLowerCase())
    const catMatch = filtroCategoria === '' || (p.categoria?.nome || 'Sem Categoria') === filtroCategoria
    return nomeMatch && catMatch
  })

  // Funções de abrir modal omitidas por espaço (são iguais às originais)
  function abrirModalNovo() {
    setProdutoSelecionado(null); setModoModal('novo');
    setForm({ nome: '', preco: '', custo: '', quantidade: '', categoria: categoriasExistentes[0] || '', novaCategoria: '', tipo: 'UNIDADE' })
    setModalAberto(true)
  }
  function abrirModalEditar(produto) {
    setProdutoSelecionado(produto); setModoModal('editar');
    setForm({ nome: produto.nome, preco: produto.preco || '', custo: '', quantidade: produto.quantidadeEstoque || '', categoria: produto.categoria?.nome || '', novaCategoria: '', tipo: produto.tipo || 'UNIDADE' })
    setModalAberto(true)
  }
  function abrirModalRepor(produto) {
    setProdutoSelecionado(produto); setModoModal('repor'); setFormRepor({ quantidade: '', precoCusto: '' }); setModalAberto(true);
  }
  function abrirModalVender(produto) {
    setProdutoSelecionado(produto); setModoModal('vender'); setFormVender({ quantidade: '', precoVenda: '' }); setModalAberto(true);
  }
  function abrirModalDeletar(produto) {
    setProdutoSelecionado(produto); setModoModal('deletar'); setModalAberto(true);
  }

  // Funções de API (Salvar, Deletar, Repor, Vender)
  function handleSalvar() {
    const editando = Boolean(produtoSelecionado?.id)
    const quantidade = editando ? produtoSelecionado.quantidadeEstoque : parseInt(form.quantidade || '0')
    const custoUnitario = editando ? null : parseFloat(form.custo || '0')
    if (!form.nome.trim() || !form.preco || quantidade < 0) return alert('Preencha os dados obrigatórios.')
    if (!editando && quantidade > 0 && custoUnitario <= 0) return alert('Informe o custo do estoque inicial.')

    const obj = {
      nome: form.nome,
      preco: parseFloat(form.preco),
      custoUnitario,
      quantidadeEstoque: quantidade,
      tipo: form.tipo,
      categoria: { nome: form.categoria === 'nova_categoria' ? form.novaCategoria : form.categoria }
    }
    const url = editando ? `${API_URL}/produtos/${produtoSelecionado.id}` : `${API_URL}/produtos`
    fetch(url, { method: editando ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(obj) })
    .then(res => { if(res.ok) { setModalAberto(false); carregarProdutos(); } else alert("Erro ao salvar."); })
  }
  function handleDeletar() {
    fetch(API_URL + `/produtos/${produtoSelecionado.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => { if(res.ok) { setModalAberto(false); carregarProdutos(); } else alert("Erro ao deletar."); })
  }
  function handleRepor() {
    const qtd = parseInt(formRepor.quantidade); const custo = parseFloat(formRepor.precoCusto);
    if (!qtd || !custo) return alert("Preencha corretamente.")
    fetch(API_URL + `/produtos/${produtoSelecionado.id}/compra-com-custo`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ quantidade: qtd, preco: custo }) })
    .then(res => { if(res.ok) { setModalAberto(false); carregarProdutos(); } else alert("Erro ao repor."); })
  }
  function handleVender() {
    const qtd = parseInt(formVender.quantidade); const preco = parseFloat(formVender.precoVenda);
    if (!qtd || !preco) return alert("Preencha corretamente.")
    fetch(API_URL + `/produtos/${produtoSelecionado.id}/venda-com-lucro`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ quantidade: qtd, preco }) })
    .then(res => { if(res.ok) { setModalAberto(false); carregarProdutos(); } else alert("Erro ao vender."); })
  }

  function abrirImportacao() {
    setArquivoImportacao(null)
    setResultadoImportacao(null)
    setModalImportacao(true)
  }

  async function baixarModeloImportacao() {
    try {
      const resposta = await fetch(`${API_URL}/produtos/importacao/modelo`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!resposta.ok) throw new Error()

      const url = URL.createObjectURL(await resposta.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = 'modelo-importacao-estoque.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Não foi possível baixar o modelo.')
    }
  }

  async function importarPlanilha() {
    if (!arquivoImportacao) {
      setResultadoImportacao({ erros: [{ linha: 0, campo: 'arquivo', mensagem: 'Selecione uma planilha.' }] })
      return
    }

    setImportando(true)
    setResultadoImportacao(null)
    try {
      const dados = new FormData()
      dados.append('arquivo', arquivoImportacao)

      const resposta = await fetch(`${API_URL}/produtos/importacao`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: dados
      })
      const resultado = await resposta.json()
      setResultadoImportacao(
        resposta.ok || resultado.erros
          ? resultado
          : { erros: [{ linha: 0, campo: 'arquivo', mensagem: resultado.erro || 'Não foi possível importar.' }] }
      )
      if (resposta.ok) {
        setArquivoImportacao(null)
        carregarProdutos()
      }
    } catch {
      setResultadoImportacao({
        erros: [{ linha: 0, campo: 'conexao', mensagem: 'Servidor indisponível. Tente novamente.' }]
      })
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 text-current relative z-10 pb-24 md:pb-8">
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-current pb-4 opacity-90">
        <div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Gestão</h1>
          <p className="opacity-50 mt-1 font-mono text-[11px] uppercase tracking-widest">Controle de Inventário</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {role === 'ADMIN' && (
            <button onClick={abrirImportacao} className="btn-secondary px-5 py-2.5 rounded-sm font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
              <Upload size={14} /> Importar Excel
            </button>
          )}
          <button onClick={abrirModalNovo} className="btn-primary px-6 py-2.5 rounded-sm font-bold text-xs tracking-widest uppercase flex items-center gap-2">
            <Plus size={14} /> Registro
          </button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <input 
            placeholder="Buscar..." 
            value={termoBusca} 
            onChange={e => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-current/20 rounded-sm focus:outline-none focus:border-current text-sm tracking-widest font-bold uppercase transition-all placeholder:opacity-30"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <select 
            value={filtroCategoria} 
            onChange={e => setFiltroCategoria(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-current/20 rounded-sm focus:outline-none focus:border-current text-sm tracking-widest font-bold uppercase appearance-none cursor-pointer [&>option]:bg-[var(--bg-color)]"
          >
            <option value="">Todas</option>
            {categoriasExistentes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="Sem Categoria">S/ Categoria</option>
          </select>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40 space-y-4">
            <PackageSearch size={32} className="animate-pulse" />
            <p className="font-mono text-[10px] uppercase tracking-widest">Lendo Banco de Dados...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Layers size={32} className="mb-4 opacity-50" />
            <p className="font-mono text-[10px] uppercase tracking-widest">Inventário Vazio</p>
          </div>
        ) : (
          <>
            {/* VISÃO DESKTOP (TABELA) - Esconde no Celular */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-current/5 border-b border-current/10 opacity-70 text-[9px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Varejo</th>
                    <th className="px-6 py-4">Volume</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-current/5">
                  {produtosFiltrados.map(p => (
                    <tr key={p.id} className="hover:bg-current/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs uppercase tracking-wider opacity-90">{p.nome}</div>
                        <div className="text-[9px] font-mono opacity-50 mt-1 uppercase tracking-widest">{p.tipo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-2 py-1 border border-current/20 rounded-sm text-[9px] font-bold uppercase tracking-widest opacity-70">
                          <Tag size={10} /> {p.categoria?.nome || 'S/ CAT'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm opacity-90">R$ {p.preco?.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 border rounded-sm text-[10px] font-bold uppercase tracking-widest ${
                          p.quantidadeEstoque <= 5 ? 'border-rose-500/50 text-rose-500' : 'border-current/20 opacity-80'
                        }`}>
                          {p.quantidadeEstoque} UN
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => abrirModalVender(p)} title="Vender" className="p-2 border border-current/20 hover:border-current hover:bg-current/10 rounded-sm transition-all cursor-pointer"><ShoppingCart size={14} /></button>
                          <button onClick={() => abrirModalRepor(p)} title="Repor" className="p-2 border border-current/20 hover:border-current hover:bg-current/10 rounded-sm transition-all cursor-pointer"><TrendingUp size={14} /></button>
                          <button onClick={() => abrirModalEditar(p)} title="Editar" className="p-2 border border-current/20 hover:border-current hover:bg-current/10 rounded-sm transition-all opacity-60 cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => abrirModalDeletar(p)} title="Mover para lixeira" className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-sm transition-all cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VISÃO MOBILE (CARDS) - Esconde no Computador */}
            <div className="md:hidden grid grid-cols-1 gap-4 p-4">
              {produtosFiltrados.map(p => (
                <div key={`mobile-${p.id}`} className="flex flex-col p-4 border border-current/10 bg-current/5 rounded-sm space-y-4">
                  {/* Linha 1: Nome e Tipo */}
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-sm uppercase tracking-wider opacity-90">{p.nome}</div>
                    <span className={`px-2 py-1 border rounded-sm text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${
                      p.quantidadeEstoque <= 5 ? 'border-rose-500/50 text-rose-500' : 'border-current/20 opacity-80'
                    }`}>
                      {p.quantidadeEstoque} UN
                    </span>
                  </div>
                  
                  {/* Linha 2: Categoria e Preço */}
                  <div className="flex justify-between items-end border-b border-current/10 pb-4">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest opacity-60">
                      <Tag size={10} /> {p.categoria?.nome || 'S/ CAT'}
                    </span>
                    <div className="font-mono text-base font-light opacity-90">R$ {p.preco?.toFixed(2)}</div>
                  </div>

                  {/* Linha 3: Botões de Ação Grandes e Fáceis de Clicar com o dedo */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => abrirModalVender(p)} className="flex-1 flex justify-center p-3 border border-current/20 hover:bg-current/10 rounded-sm transition-all cursor-pointer">
                      <ShoppingCart size={16} />
                    </button>
                    <button onClick={() => abrirModalRepor(p)} className="flex-1 flex justify-center p-3 border border-current/20 hover:bg-current/10 rounded-sm transition-all cursor-pointer">
                      <TrendingUp size={16} />
                    </button>
                    <button onClick={() => abrirModalEditar(p)} className="flex-1 flex justify-center p-3 border border-current/20 hover:bg-current/10 rounded-sm transition-all opacity-60 cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => abrirModalDeletar(p)} title="Mover para lixeira" className="flex-1 flex justify-center p-3 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-sm transition-all cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalImportacao && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel !bg-[var(--bg-color)] w-full max-w-xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-current/10">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={19} />
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest">Importar Produtos</h2>
                  <p className="text-[9px] opacity-50 uppercase tracking-widest mt-1">Somente administradores</p>
                </div>
              </div>
              <button onClick={() => setModalImportacao(false)} className="opacity-50 hover:opacity-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="border border-current/15 bg-current/5 p-4 text-[10px] leading-relaxed uppercase tracking-wider opacity-75">
                Use o modelo oficial. Se qualquer linha estiver incorreta, nenhum produto será cadastrado.
              </div>

              <button onClick={baixarModeloImportacao} className="btn-secondary w-full p-3 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                <Download size={15} /> Baixar modelo Excel
              </button>

              <label className="block border border-dashed border-current/30 hover:border-current/60 p-6 rounded-sm text-center cursor-pointer transition-colors">
                <Upload size={22} className="mx-auto mb-3 opacity-50" />
                <span className="block text-[10px] font-bold uppercase tracking-widest">
                  {arquivoImportacao ? arquivoImportacao.name : 'Selecionar planilha .xlsx ou .xls'}
                </span>
                <span className="block text-[9px] opacity-40 uppercase tracking-widest mt-2">Máximo de 5 MB e 1.000 produtos</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={event => {
                    setArquivoImportacao(event.target.files?.[0] || null)
                    setResultadoImportacao(null)
                  }}
                />
              </label>

              {resultadoImportacao?.totalImportado > 0 && (
                <div className="border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 p-4 flex items-center gap-3">
                  <CheckCircle2 size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {resultadoImportacao.totalImportado} produtos importados com sucesso
                  </span>
                </div>
              )}

              {resultadoImportacao?.erros?.length > 0 && (
                <div className="border border-rose-500/30 bg-rose-500/5 p-4">
                  <div className="flex items-center gap-2 text-rose-500 mb-3">
                    <AlertTriangle size={17} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Corrija {resultadoImportacao.erros.length} erro(s)
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {resultadoImportacao.erros.slice(0, 20).map((erro, indice) => (
                      <p key={`${erro.linha}-${erro.campo}-${indice}`} className="text-[10px] font-mono opacity-75">
                        {erro.linha > 0 ? `Linha ${erro.linha}` : 'Arquivo'} • {erro.campo}: {erro.mensagem}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-current/10 bg-current/5 flex justify-end gap-3">
              <button onClick={() => setModalImportacao(false)} className="btn-secondary px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest">
                Fechar
              </button>
              <button onClick={importarPlanilha} disabled={importando} className="btn-primary px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Upload size={14} /> {importando ? 'Validando...' : 'Validar e importar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMALEÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel !bg-[var(--bg-color)] w-full max-w-md rounded-sm overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-current/10 opacity-90">
              <h2 className="text-xs font-bold uppercase tracking-widest">
                {modoModal === 'novo' && 'Novo Registro'}
                {modoModal === 'editar' && 'Ajuste de Ativo'}
                {modoModal === 'repor' && 'Entrada de Estoque'}
                {modoModal === 'vender' && 'Saída / Venda'}
                {modoModal === 'deletar' && 'Mover para Lixeira'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="opacity-50 hover:opacity-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {(modoModal === 'novo' || modoModal === 'editar') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Identificação</label>
                    <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all text-sm font-bold uppercase tracking-wider" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Varejo (R$)</label>
                      <input value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} type="number" step="0.01" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all font-mono" />
                    </div>
                    {modoModal === 'novo' && (
                      <div className="flex-1">
                        <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Estoque Inicial</label>
                        <input value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} type="number" min="0" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all font-mono" />
                      </div>
                    )}
                  </div>
                  {modoModal === 'novo' && (
                    <div>
                      <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Custo Unitário Inicial (R$)</label>
                      <input value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} type="number" min="0" step="0.01" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all font-mono" />
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Setor</label>
                      <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current transition-all text-xs font-bold uppercase tracking-widest [&>option]:bg-[var(--bg-color)]">
                        <option value="" disabled>---</option>
                        {categoriasExistentes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="nova_categoria">+ Criar Setor</option>
                      </select>
                    </div>
                  </div>
                  {form.categoria === 'nova_categoria' && (
                    <div className="animate-in slide-in-from-top-2 border border-current/20 p-3 rounded-sm bg-current/5">
                      <label className="block text-[9px] font-bold opacity-80 uppercase tracking-widest mb-2">Nome do Novo Setor</label>
                      <input value={form.novaCategoria} onChange={e => setForm({...form, novaCategoria: e.target.value})} className="w-full p-2.5 bg-transparent border-b border-current/30 focus:outline-none focus:border-current transition-all text-xs font-bold uppercase tracking-widest" />
                    </div>
                  )}
                </div>
              )}

              {modoModal === 'repor' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Alvo: <strong className="opacity-100">{produtoSelecionado?.nome}</strong></p>
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Carga (UN)</label>
                    <input value={formRepor.quantidade} onChange={e => setFormRepor({...formRepor, quantidade: e.target.value})} type="number" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Custo Base (R$)</label>
                    <input value={formRepor.precoCusto} onChange={e => setFormRepor({...formRepor, precoCusto: e.target.value})} type="number" step="0.01" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono" />
                  </div>
                </div>
              )}

              {modoModal === 'vender' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center opacity-70 text-[10px] font-mono uppercase tracking-widest border-b border-current/10 pb-3">
                    <span>{produtoSelecionado?.nome}</span>
                    <span>QTD Disp: {produtoSelecionado?.quantidadeEstoque}</span>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Baixa (UN)</label>
                    <input value={formVender.quantidade} onChange={e => setFormVender({...formVender, quantidade: e.target.value})} type="number" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold opacity-50 uppercase tracking-widest mb-2">Valor de Saída (R$)</label>
                    <input value={formVender.precoVenda} onChange={e => setFormVender({...formVender, precoVenda: e.target.value})} type="number" step="0.01" className="w-full p-2.5 bg-current/5 border border-current/20 rounded-sm focus:outline-none focus:border-current font-mono" />
                  </div>
                </div>
              )}

              {modoModal === 'deletar' && (
                <div className="p-4 border border-rose-500/30 bg-rose-500/5 rounded-sm">
                  <p className="text-xs font-mono opacity-80 uppercase tracking-widest leading-relaxed">
                    Mover produto para a lixeira: <br/><strong className="text-rose-500">{produtoSelecionado?.nome}</strong>. <br/>Você poderá restaurá-lo em Ajustes.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-current/10 bg-current/5 flex justify-end gap-3">
              <button onClick={() => setModalAberto(false)} className="btn-secondary px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest">
                Abortar
              </button>
              
              {modoModal === 'deletar' && (
                <button onClick={handleDeletar} className="px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                  Mover para Lixeira
                </button>
              )}

              {modoModal === 'repor' && (
                <button onClick={handleRepor} className="btn-primary px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest">
                  Executar Entrada
                </button>
              )}

              {modoModal === 'vender' && (
                <button onClick={handleVender} className="btn-primary px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest">
                  Executar Saída
                </button>
              )}

              {(modoModal === 'novo' || modoModal === 'editar') && (
                <button onClick={handleSalvar} className="btn-primary px-5 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest">
                  Gravar Dados
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gerenciar
