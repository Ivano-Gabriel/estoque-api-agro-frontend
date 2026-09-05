import { useState, useEffect } from 'react'
import { Sun, Moon, ShieldAlert, Database, Trash2, ArchiveX, RotateCcw } from 'lucide-react'

function Configuracoes({ token }) {
  const [isDark, setIsDark] = useState(true)
  const [lixeira, setLixeira] = useState([])

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    carregarLixeira()
  }, [token])

  const carregarLixeira = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + '/produtos/lixeira', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setLixeira(data))
    .catch(err => console.log('Erro ao carregar lixeira', err))
  }

  const handleRestaurar = (id) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
    fetch(apiUrl + `/produtos/${id}/restaurar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.ok) {
        carregarLixeira()
        alert("Ativo restaurado e de volta ao inventário principal.")
      } else {
        alert("Erro ao restaurar ativo.")
      }
    })
    .catch(() => alert("Falha na conexão ao restaurar."))
  }

  // NOVA FUNÇÃO: Exclusão Permanente
  const handleDeletarPermanente = (id) => {
    const confirmacao = window.confirm("CUIDADO: Isso vai aniquilar o produto e o histórico dele para sempre. Continuar?");
    if (confirmacao) {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
      fetch(apiUrl + `/produtos/${id}/permanente`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) {
          carregarLixeira()
          alert("Produto obliterado do banco de dados com sucesso.")
        } else {
          alert("Erro ao purgar produto.")
        }
      })
      .catch(() => alert("Falha na conexão ao purgar."))
    }
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

  const handleResetFinanceiro = () => {
    const confirmacao = window.confirm("ATENÇÃO: Isso apagará TODO o histórico de Vendas e Compras.\n\nTem certeza absoluta?");
    if (confirmacao) {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://estoque-api-agro.onrender.com'
      fetch(apiUrl + '/produtos/reset-financeiro', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        if (res.ok) {
          alert("Histórico financeiro purgado com sucesso.")
          window.location.reload(); 
        } else {
          alert(`Erro do Servidor HTTP: ${res.status}`);
        }
      })
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

        <div className="glass-panel !border-l-rose-600 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-rose-500/30 pb-4">
            <ShieldAlert size={16} className="text-rose-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600">Zona Restrita</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-rose-600">Reset Financeiro</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1 text-rose-600">Ação irreversível no banco</p>
            </div>
            <button 
              onClick={handleResetFinanceiro}
              className="flex items-center justify-center w-12 h-12 border border-rose-600 hover:bg-rose-600/10 transition-colors text-rose-600 cursor-pointer"
              title="Apagar Histórico"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-current/20 pb-4 mb-4 opacity-90">
            <ArchiveX size={16} className="opacity-70" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Arquivo Morto (Inativos)</h2>
          </div>

          {lixeira.length === 0 ? (
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
                  
                  {/* BOTOÕES LADO A LADO */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRestaurar(item.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-current opacity-70 hover:opacity-100 hover:bg-current hover:text-[var(--bg-color)] transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      <RotateCcw size={14} /> Restaurar
                    </button>
                    <button 
                      onClick={() => handleDeletarPermanente(item.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-rose-600 text-rose-600 opacity-70 hover:opacity-100 hover:bg-rose-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer"
                      title="Apagar Definitivo"
                    >
                      <Trash2 size={14} /> Purgar
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