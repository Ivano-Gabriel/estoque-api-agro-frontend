import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, LogOut, DollarSign, Menu, PackageSearch, PenTool } from 'lucide-react'
import { useState } from 'react'

function Layout({ token, onLogout }) {
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  const navItems = [
    { name: 'Hub', path: '/', icon: LayoutDashboard },
    { name: 'Catálogo', path: '/produtos', icon: PackageSearch },
    { name: 'Gerenciar', path: '/gerenciar', icon: PenTool },
    { name: 'Caixa', path: '/lucro', icon: DollarSign },
    { name: 'Ajustes', path: '/config', icon: Settings },
  ]

  const LogoI = () => (
    <div className="flex items-center justify-center w-7 h-7 border border-current bg-current/5 font-extrabold text-sm tracking-tighter">
      I
    </div>
  )

  return (
    <>
      {/* CAMADA BLINDADA DA IMAGEM DE FUNDO */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/apopo.jpeg')" }}
      ></div>

      {/* SISTEMA (Fica por cima da imagem) */}
      <div className="min-h-screen flex relative z-10 text-current">
        
        <aside className="hidden md:flex glass-panel shrink-0 w-20 lg:w-64 flex-col justify-between py-6 px-4 m-4 mr-0 transition-all duration-300 !border-l-0 border-r">
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-3 px-2 mb-12">
              <LogoI />
              <h1 className="hidden lg:block text-lg font-bold tracking-[0.2em] uppercase mt-1">
                ESTOQUE
              </h1>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const ativo = location.pathname === item.path
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-sm transition-all duration-300 group ${
                      ativo 
                      ? 'bg-current/10 border-l-2 border-current font-black' 
                      : 'opacity-60 hover:opacity-100 hover:bg-current/5 border-l-2 border-transparent'
                    }`}
                  >
                    <Icon size={18} className={ativo ? '' : 'group-hover:scale-110 transition-transform'} strokeWidth={ativo ? 2.5 : 2} />
                    <span className="hidden lg:block text-[11px] font-bold tracking-widest uppercase">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <button 
            onClick={onLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-sm opacity-60 hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 group mt-auto"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:block text-[11px] font-bold tracking-widest uppercase">Encerrar</span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto relative p-4 md:p-8 pb-24 md:pb-8">
          <div className="md:hidden flex justify-between items-center mb-6 glass-panel p-4 !border-l-0 relative">
            <div className="flex items-center gap-3">
              <LogoI />
              <span className="font-bold tracking-[0.2em] uppercase text-xs mt-1">ESTOQUE</span>
            </div>
            
            <button 
              onClick={() => setMenuAberto(!menuAberto)} 
              className="p-1 border border-transparent transition-all"
            >
              <Menu size={18} />
            </button>

            {menuAberto && (
              <div className="absolute top-16 right-4 glass-panel p-2 flex flex-col gap-2 min-w-[120px] animate-in slide-in-from-top-2 z-50">
                <button onClick={onLogout} className="flex items-center gap-2 text-xs text-rose-600 hover:bg-rose-500/10 p-2 uppercase tracking-widest font-bold text-left">
                  <LogOut size={14} /> Sair
                </button>
              </div>
            )}
          </div>

          <Outlet />
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 w-full glass-panel !border-l-0 !border-b-0 !border-x-0 !border-t border-t-current/10 flex justify-around items-center p-3 z-50">
          {navItems.map((item) => {
            const Icon = item.icon
            const ativo = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 transition-all ${
                  ativo ? 'opacity-100 font-black' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <Icon size={20} strokeWidth={ativo ? 2.5 : 1.5} />
                <span className="text-[9px] uppercase tracking-widest font-bold">{item.name}</span>
              </Link>
            )
          })}
        </nav>

      </div>
    </>
  )
}

export default Layout