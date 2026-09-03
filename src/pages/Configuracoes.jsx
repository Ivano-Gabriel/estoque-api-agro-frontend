import { useState, useEffect } from 'react'
import { Sun, Moon, ShieldAlert, Database, Trash2 } from 'lucide-react'

function Configuracoes({ token }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081'
      fetch(apiUrl + '/produtos/reset-financeiro', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        if (res.ok) {
          alert("Histórico financeiro resetado com sucesso.")
          window.location.reload(); 
        } else {
          alert(`Erro do Servidor HTTP: ${res.status}`);
        }
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
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
        
        {/* Painel de Preferências (Sol/Lua) */}
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
              className="flex items-center justify-center w-12 h-12 border border-current opacity-70 hover:opacity-100 transition-all bg-transparent"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Zona de Perigo */}
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
              className="flex items-center justify-center w-12 h-12 border border-rose-600 hover:bg-rose-600/10 transition-colors text-rose-600"
              title="Apagar Histórico"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Configuracoes