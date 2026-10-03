const fluxoVazio = {
  totalEntradas: 0,
  totalSaidas: 0,
  saldoLiquido: 0,
  lucroBruto: 0,
  recebimentosPorForma: {},
}

function resultadoValido(resultado, validar) {
  return resultado?.status === 'fulfilled' && validar(resultado.value)
}

function mensagem(resultado, nome) {
  if (resultado?.status === 'rejected') return `${nome}: ${resultado.reason?.message || 'não respondeu'}`
  return `${nome}: resposta inválida do servidor`
}

export function combinarResultadosFinanceiros([transacoes, fluxo, vendas]) {
  const transacoesOk = resultadoValido(transacoes, Array.isArray)
  const fluxoOk = resultadoValido(fluxo, valor => valor && typeof valor === 'object' && !Array.isArray(valor))
  const vendasOk = resultadoValido(vendas, valor => valor && Array.isArray(valor.itens))
  const falhas = []

  if (!transacoesOk) falhas.push(mensagem(transacoes, 'Histórico de movimentações'))
  if (!fluxoOk) falhas.push(mensagem(fluxo, 'Resumo financeiro'))
  if (!vendasOk) falhas.push(mensagem(vendas, 'Histórico de vendas'))

  return {
    transacoes: transacoesOk ? transacoes.value : [],
    fluxo: fluxoOk ? { ...fluxoVazio, ...fluxo.value } : fluxoVazio,
    paginaVendas: vendasOk ? vendas.value : null,
    falhas,
    falhaTotal: falhas.length === 3,
  }
}
