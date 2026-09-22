export function imagemProdutoUrl(url, tamanho = 600) {
  if (!url || !url.startsWith('https://res.cloudinary.com/')) return url
  const marcador = '/image/upload/'
  if (!url.includes(marcador)) return url
  return url.replace(marcador, `${marcador}c_fill,w_${tamanho},h_${tamanho},q_auto,f_auto/`)
}
