export function novaLinhaProduto(valores = {}) {
  return {
    id: crypto.randomUUID(),
    nome: '',
    quantidade: '0',
    categoria: '',
    tipo: 'UNIDADE',
    custo: '',
    preco: '',
    dataValidade: '',
    descricao: '',
    ...valores,
  }
}

export function numeroDecimal(valor) {
  const texto = String(valor ?? '').replace(/R\$/gi, '').replace(/\s/g, '').trim()
  if (!texto) return ''
  const normalizado = texto.includes(',')
    ? texto.replace(/\./g, '').replace(',', '.')
    : texto
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : Number.NaN
}

export function parsearListaProdutos(texto, padroes, financeiroAtivo) {
  const linhas = texto.split(/\r?\n/).map(linha => linha.trim()).filter(Boolean)
  const semCabecalho = linhas.filter((linha, indice) => {
    if (indice !== 0) return true
    const primeiroCampo = linha.split(/[;\t]/)[0].trim().toLowerCase()
    return !['nome', 'produto', 'nome do produto'].includes(primeiroCampo)
  })

  return semCabecalho.map(linha => {
    const campos = linha.includes('\t') ? linha.split('\t') : linha.split(';')
    const [
      nome = '', quantidade = '', categoria = '', tipo = '', custoOuValidade = '',
      precoOuDescricao = '', validade = '', descricao = '',
    ] = campos.map(campo => campo?.trim() || '')
    return novaLinhaProduto({
      nome,
      quantidade: quantidade || padroes.quantidade || '0',
      categoria: categoria || padroes.categoria || '',
      tipo: tipo || padroes.tipo || 'UNIDADE',
      custo: financeiroAtivo ? custoOuValidade : '',
      preco: financeiroAtivo ? precoOuDescricao : '',
      dataValidade: financeiroAtivo ? validade : custoOuValidade,
      descricao: financeiroAtivo ? descricao : precoOuDescricao,
    })
  })
}

export function validarLinhaProduto(linha, financeiroAtivo) {
  const erros = []
  const quantidade = Number(linha.quantidade)
  const preco = numeroDecimal(linha.preco)
  const custo = numeroDecimal(linha.custo)
  if (!linha.nome.trim()) erros.push('Informe o nome.')
  if (linha.nome.trim().length > 120) erros.push('Nome com mais de 120 caracteres.')
  if (!linha.categoria.trim()) erros.push('Informe a categoria.')
  if (linha.categoria.trim().length > 80) erros.push('Categoria com mais de 80 caracteres.')
  if (!linha.tipo.trim()) erros.push('Informe a unidade.')
  if (linha.descricao.length > 500) erros.push('Descrição com mais de 500 caracteres.')
  if (!Number.isSafeInteger(quantidade) || quantidade < 0) erros.push('A quantidade deve ser um número inteiro igual ou maior que zero.')
  if (financeiroAtivo && (!(preco > 0))) erros.push('Informe um preço de venda maior que zero.')
  if (financeiroAtivo && quantidade > 0 && (!(custo > 0))) erros.push('Informe o preço de compra do estoque inicial.')
  if (financeiroAtivo && custo !== '' && Number.isNaN(custo)) erros.push('Preço de compra inválido.')
  if (financeiroAtivo && preco !== '' && Number.isNaN(preco)) erros.push('Preço de venda inválido.')
  return erros
}

export function produtoRequestDaLinha(linha, financeiroAtivo) {
  return {
    nome: linha.nome.trim(),
    tipo: linha.tipo.trim(),
    preco: financeiroAtivo ? numeroDecimal(linha.preco) : 0,
    custoUnitario: financeiroAtivo ? (numeroDecimal(linha.custo) || 0) : 0,
    quantidadeEstoque: Number(linha.quantidade),
    dataValidade: linha.dataValidade || null,
    categoria: { nome: linha.categoria.trim() },
    descricao: linha.descricao.trim() || null,
    imagemUrl: null,
  }
}
