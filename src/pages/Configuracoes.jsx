import { useState, useEffect, useCallback } from 'react'
import { Sun, Moon, Database, ArchiveX, RotateCcw, UserPlus } from 'lucide-react'
import API_URL, { apiFetch as fetch } from '../config/api'
import AcessosFuncionarias from '../components/AcessosFuncionarias'
import useOperacao from '../hooks/useOperacao'

function Configuracoes({ token, role }) {
  const [isDark, setIsDark] = useState(true)
  const [lixeira, setLixeira] = useState([])
  const [novaFuncionaria, setNovaFuncionaria] = useState({ email: '', senha: '' })
  const [salvandoUsuario, setSalvandoUsuario] = useState(false)
  const [erroLixeira, setErroLixeira] = useState('')
  const { enviando, executar } = useOperacao()

  const carregarLixeira = useCallback(() => {
    setErroLixeira('')
    fetch(API_URL + '/produtos/lixeira', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setLixeira(data))
    .catch(err => setErroLixeira(err.message))
  }, [token])

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    carregarLixeira()
  }, [carregarLixeira])

  const handleRestaurar = (id) => {
    executar(async () => {
      await fetch(API_URL + `/produtos/${id}/restaurar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
      })
      carregarLixeira()
      alert('Produto restaurado e de volta ao inventário.')
    })
  }

  const toggleTheme = () => {
    const root = document.documentElement
    if (root.classList.contains('dark')) {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  const cadastrarFuncionaria = async (event) => {
    event.preventDefault()
    setSalvandoUsuario(true)
    try {
      const response = await fetch(API_URL + '/auth/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...novaFuncionaria, role: 'FUNCIONARIA' })
      })

      if (!response.ok) {
        const mensagem = await response.text()
        throw new Error(mensagem || 'Não foi possível cadastrar a funcionária.')
      }

      setNovaFuncionaria({ email: '', senha: '' })
      window.dispatchEvent(new Event('usuarios-alterados'))
      alert('Funcionária cadastrada com sucesso.')
    } catch (error) {
      alert(error.message)
    } finally {
      setSalvandoUsuario(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 text-current relative z-10 pb-24 md:pb-8">
      
      <header className="flex justify-between items-end border-b border-current pb-4 opacity-90">
        <div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">
            Ajustes do Sistema
          </h1>
          <p className="text-[11px] uppercase tracking-widest font-mono opacity-50 mt-1">
            Preferências • Manutenção • Segurança
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-current pb-4 opacity-80">
            <Database size={16} className="opacity-70" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Interface</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">Modo de Exibição</p>
              <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Alternar entre Stealth e Light</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="flex items-center justify-center w-12 h-12 border border-current opacity-70 hover:opacity-100 transition-all bg-transparent cursor-pointer"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {role === 'ADMIN' && (
          <form onSubmit={cadastrarFuncionaria} className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-current pb-4 opacity-80">
              <UserPlus size={16} className="opacity-70" />
              <h2 className="text-xs font-bold uppercase tracking-widest">Nova Funcionária</h2>
            </div>
            <input
              type="email"
              required
              value={novaFuncionaria.email}
              onChange={event => setNovaFuncionaria(atual => ({ ...atual, email: event.target.value }))}
              placeholder="funcionaria@loja.com"
              className="bg-transparent border border-current/20 p-3 text-sm"
            />
            <input
              type="password"
              required
              minLength={10}
              maxLength={72}
              value={novaFuncionaria.senha}
              onChange={event => setNovaFuncionaria(atual => ({ ...atual, senha: event.target.value }))}
              placeholder="Senha com pelo menos 10 caracteres"
              className="bg-transparent border border-current/20 p-3 text-sm"
            />
            <button
              type="submit"
              disabled={salvandoUsuario}
              className="border border-current px-4 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {salvandoUsuario ? 'Cadastrando...' : 'Criar acesso'}
            </button>
          </form>
        )}

        {role === 'ADMIN' && <AcessosFuncionarias token={token} />}

        <div className="glass-panel p-6 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-current/20 pb-4 mb-4 opacity-90">
            <ArchiveX size={16} className="opacity-70" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Arquivo Morto (Inativos)</h2>
          </div>

          {erroLixeira ? <p role="alert">{erroLixeira} <button className="underline" onClick={carregarLixeira}>Tentar novamente</button></p> : lixeira.length === 0 ? (
            <div className="text-center py-8 opacity-40">
              <p className="font-mono text-[10px] uppercase tracking-widest">Nenhum ativo na lixeira.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lixeira.map(item => (
                <div key={item.id} className="flex flex-col md:flex-row justify-between md:items-center p-4 border border-current/10 bg-current/5 hover:bg-current/10 transition-colors rounded-sm gap-4">
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider opacity-90">{item.nome}</p>
                    <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mt-1">
                      {item.categoria?.nome || 'S/ CAT'} • Último Estoque: {item.quantidadeEstoque} UN
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRestaurar(item.id)}
                      disabled={enviando}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-current opacity-70 hover:opacity-100 hover:bg-current hover:text-[var(--bg-color)] transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      <RotateCcw size={14} /> Restaurar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Configuracoes
