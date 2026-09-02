import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, DollarSign, Settings, Menu, X, LogOut } from 'lucide-react'

function Layout({ token, onLogout }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const menuItems = [
    { to: '/', label: 'Início', icon: LayoutDashboard }, 
    { to: '/produtos', label: 'Produtos', icon: Package },
    { to: '/gerenciar', label: 'Gerenciar', icon: ShoppingCart },
    { to: '/lucro', label: 'Financeiro', icon: DollarSign },
    { to: '/config', label: 'Configurações', icon: Settings },
  ]

  // === VERSÃO DESKTOP ===
  if (!isMobile) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100">
            <p className="font-bold text-lg text-blue-600 tracking-tight">Estoque Inteligente</p> 
            <p className="text-xs text-slate-400 mt-1">Version • v2.0</p>
          </div>
          
          <nav className="flex-1 p-4 flex flex-col gap-2">
            {menuItems.map(({ to, label, icon: Icon }) => (
              <NavLink end={to === '/'} key={to} to={to} 
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}>
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full p-3 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
              <LogOut size={18} />
              Sair da Conta
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-slate-50 p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    )
  }

  // === VERSÃO MOBILE ===
  const bottomNavItems = menuItems.filter(item => item.label !== 'Configurações')

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header Mobile */}
      <header className="flex justify-between items-center p-4 bg-white border-b border-slate-200 z-10 shadow-sm">
        <span className="font-bold text-lg text-blue-600">Estoque Inteligente</span>
        <button onClick={() => setMenuAberto(true)} className="text-slate-600 hover:text-blue-600">
          <Menu size={28} />
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto pb-20 bg-slate-50 p-4">
        <Outlet />
      </main>

      {/* Navegação Inferior (Bottom Nav) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {bottomNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink end={to === '/'} key={to} to={to} 
            className={({ isActive }) => `
              flex flex-col items-center gap-1 w-full text-xs font-medium transition-colors
              ${isActive ? 'text-blue-600' : 'text-slate-500'}
            `}>
            <Icon size={22} className={({ isActive }) => isActive ? "fill-blue-50" : ""} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Menu Lateral Deslizante Mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMenuAberto(false)} />
          <aside className="relative w-64 bg-white h-full flex flex-col shadow-xl animate-in slide-in-from-right">
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <span className="font-bold text-lg text-slate-800">Menu</span>
              <button onClick={() => setMenuAberto(false)} className="text-slate-400 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            
            <nav className="p-4 flex-1 flex flex-col gap-2">
              {menuItems.map(({ to, label, icon: Icon }) => (
                <NavLink end={to === '/'} key={to} to={to} onClick={() => setMenuAberto(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 active:bg-slate-50'}
                  `}>
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="p-5 border-t border-slate-100">
              <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full p-3 rounded-lg text-sm font-medium text-red-600 border border-red-200 active:bg-red-50">
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default Layout