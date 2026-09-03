import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, DollarSign, Settings, Menu, X, LogOut } from 'lucide-react'

function Layout({ token, onLogout }) {
  const [menuAberto, setMenuAberto] = useState(false)

  const menuItems = [
    { to: '/', label: 'Início', icon: LayoutDashboard }, 
    { to: '/produtos', label: 'Produtos', icon: Package },
    { to: '/gerenciar', label: 'Gerenciar', icon: ShoppingCart },
    { to: '/lucro', label: 'Financeiro', icon: DollarSign },
    { to: '/config', label: 'Configurações', icon: Settings },
  ]

  const bottomNavItems = menuItems

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* ================= DESKTOP SIDEBAR (Aparece apenas em telas médias/grandes 'md') ================= */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <p className="font-bold text-lg text-blue-600 tracking-tight">Estoque Inteligente</p> 
          <p className="text-xs text-slate-400 mt-1">Version • v2.0</p>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <NavLink end={to === '/'} key={to} to={to} 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full p-3 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer">
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* ================= CONTEÚDO PRINCIPAL & MOBILE HEADER ================= */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Header Mobile (Aparece apenas em telas pequenas, some em 'md') */}
        <header className="md:hidden flex justify-between items-center p-4 bg-white border-b border-slate-200 shrink-0 z-20 shadow-sm">
          <span className="font-bold text-lg text-blue-600">Estoque Inteligente</span>
          <button onClick={() => setMenuAberto(true)} className="text-slate-600 hover:text-blue-600 cursor-pointer p-1">
            <Menu size={26} />
          </button>
        </header>

        {/* Área onde as páginas rodam */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Bottom Nav Mobile (Aparece apenas em celulares na parte inferior) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {bottomNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink end={to === '/'} key={to} to={to} 
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 w-full h-full text-[11px] font-medium transition-colors
                ${isActive ? 'text-blue-600 font-bold' : 'text-slate-500'}
              `}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ================= MENU DESLIZANTE LATERAL MOBILE (Drawer) ================= */}
      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMenuAberto(false)} />
          <aside className="relative w-64 bg-white h-full flex flex-col shadow-2xl z-10">
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <span className="font-bold text-lg text-slate-800">Menu</span>
              <button onClick={() => setMenuAberto(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <nav className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
              {menuItems.map(({ to, label, icon: Icon }) => (
                <NavLink end={to === '/'} key={to} to={to} onClick={() => setMenuAberto(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 active:bg-slate-50'}
                  `}>
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="p-5 border-t border-slate-100">
              <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full p-3 rounded-lg text-sm font-medium text-red-600 border border-red-200 active:bg-red-50 cursor-pointer">
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