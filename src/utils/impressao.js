function escapar(valor) {
  return String(valor ?? '').replace(/[&<>'"]/g, caractere => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[caractere])
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function imprimir(titulo, conteudo) {
  const janela = window.open('', '_blank', 'width=420,height=700')
  if (!janela) throw new Error('O navegador bloqueou a impressão. Permita pop-ups para este site.')
  janela.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapar(titulo)}</title><style>
    @page{size:80mm auto;margin:4mm}*{box-sizing:border-box}body{font-family:ui-monospace,monospace;width:72mm;margin:0 auto;color:#000;font-size:12px;line-height:1.35}
    h1{font-size:17px;text-align:center;margin:0 0 2px}h2{font-size:13px;text-align:center;margin:0 0 12px}.linha{border-top:1px dashed #000;margin:9px 0}.row{display:flex;justify-content:space-between;gap:10px}.center{text-align:center}.forte{font-weight:800}.pequeno{font-size:10px}.item{margin:7px 0}@media print{button{display:none}}
  </style></head><body>${conteudo}<script>window.addEventListener('load',()=>{window.print()})</script></body></html>`)
  janela.document.close()
}

export function imprimirComprovanteVenda(comprovante) {
  const data = new Date(comprovante.data).toLocaleString('pt-BR')
  imprimir(`Comprovante ${comprovante.transacaoId}`, `
    <h1>${escapar(comprovante.loja)}</h1><h2>COMPROVANTE NÃO FISCAL</h2>
    <div class="center pequeno">Operação #${escapar(comprovante.transacaoId)}<br>${escapar(data)}</div>
    <div class="linha"></div>
    ${comprovante.cliente ? `<div><span class="forte">Cliente:</span> ${escapar(comprovante.cliente)}</div>` : ''}
    <div class="item forte">${escapar(comprovante.produto)}</div>
    <div class="row"><span>${escapar(comprovante.quantidade)}${comprovante.exibirValores ? ` x ${moeda(comprovante.precoUnitario)}` : ' unidade(s)'}</span>${comprovante.exibirValores ? `<span>${moeda(comprovante.valorTotal)}</span>` : ''}</div>
    ${comprovante.exibirValores ? `<div class="linha"></div><div class="row forte"><span>TOTAL</span><span>${moeda(comprovante.valorTotal)}</span></div>` : ''}
    <div class="linha"></div><div class="center pequeno">Atendente: ${escapar(comprovante.atendente)}<br>Este documento não possui valor fiscal.</div>`)
}

export function imprimirComprovantePdv(venda) {
  const itens = venda.itens.map(item => `<div class="item"><div class="forte">${escapar(item.nome)}</div><div class="row"><span>${item.quantidade}${venda.exibirValores ? ` x ${moeda(item.precoUnitario)}` : ' unidade(s)'}</span>${venda.exibirValores ? `<span>${moeda(item.total)}</span>` : ''}</div>${venda.exibirValores && Number(item.desconto)>0 ? `<div class="pequeno">Desconto: -${moeda(item.desconto)}</div>` : ''}</div>`).join('')
  imprimir(`Comprovante ${venda.id}`, `
    <h1>${escapar(venda.loja)}</h1><h2>COMPROVANTE NÃO FISCAL</h2>
    <div class="center pequeno">Venda ${escapar(venda.id.slice(0,8).toUpperCase())}<br>${escapar(new Date(venda.criadaEm).toLocaleString('pt-BR'))}</div>
    <div class="linha"></div>${venda.cliente ? `<div><span class="forte">Cliente:</span> ${escapar(venda.cliente)}</div>` : ''}${itens}
    ${venda.exibirValores ? `<div class="linha"></div><div class="row"><span>Subtotal</span><span>${moeda(venda.subtotal)}</span></div>${Number(venda.desconto)>0?`<div class="row"><span>Desconto</span><span>-${moeda(venda.desconto)}</span></div>`:''}<div class="row forte"><span>TOTAL</span><span>${moeda(venda.total)}</span></div><div class="row"><span>${escapar(venda.formaPagamentoLabel)}</span>${venda.troco!=null?`<span>Troco ${moeda(venda.troco)}</span>`:''}</div>` : ''}
    <div class="linha"></div><div class="center pequeno">Atendente: ${escapar(venda.atendente)}<br>Este documento não possui valor fiscal.</div>`)
}

export function imprimirNotaRecebida(nota, loja) {
  const itens = nota.itens.map(item => `<div class="item"><div class="forte">${escapar(item.produto)}</div><div class="row"><span>${item.quantidade} x ${moeda(item.custoUnitario)}</span><span>${moeda(item.quantidade * item.custoUnitario)}</span></div></div>`).join('')
  imprimir(`Conferência da nota ${nota.numero}`, `
    <h1>${escapar(loja)}</h1><h2>CONFERÊNCIA DE NOTA RECEBIDA</h2>
    <div><span class="forte">Fornecedor:</span> ${escapar(nota.fornecedor)}</div>
    <div><span class="forte">Nota:</span> ${escapar(nota.numero)} ${nota.serie ? `/ série ${escapar(nota.serie)}` : ''}</div>
    <div><span class="forte">Recebimento:</span> ${new Date(`${nota.dataRecebimento}T12:00:00`).toLocaleDateString('pt-BR')}</div>
    <div><span class="forte">Status:</span> ${nota.conferida ? 'CONFERIDA' : 'PENDENTE'}</div>
    <div class="linha"></div>${itens || '<div class="center pequeno">Sem itens vinculados.</div>'}
    <div class="linha"></div><div class="row forte"><span>VALOR INFORMADO</span><span>${moeda(nota.valorTotal)}</span></div>
    <div class="linha"></div><div class="center pequeno">Relatório interno de conferência. Não substitui o documento fiscal original.</div>`)
}
