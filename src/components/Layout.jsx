import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, LogOut, DollarSign, Menu, PackageSearch, PenTool, Users, ReceiptText, MoreHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import RelatorioWhatsapp from './RelatorioWhatsapp'

function Layout({ role, loja, token, onLogout }) {
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  const [maisAberto, setMaisAberto] = useState(false)

  const navItems = [
    { name: 'Hub', path: '/', icon: LayoutDashboard, adminOnly: true },
    { name: 'Catálogo', path: '/produtos', icon: PackageSearch },
    { name: 'Gerenciar', path: '/gerenciar', icon: PenTool },
    { name: 'Caixa', path: '/lucro', icon: DollarSign, adminOnly: true },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Notas fiscais', path: '/notas', icon: ReceiptText, adminOnly: true, notasOnly: true },
    { name: 'Ajustes', path: '/config', icon: Settings },
  ].filter(item => (!item.adminOnly || role === 'ADMIN') && (item.path !== '/lucro' || loja?.financeiroAtivo) && (!item.notasOnly || loja?.notasFiscaisAtivas))
  const principaisMobile = navItems.filter(item => ['/', '/produtos', '/gerenciar', '/clientes'].includes(item.path))
  const extrasMobile = navItems.filter(item => !principaisMobile.includes(item))

  const LogoI = () => (
    <div className="flex items-center justify-center w-7 h-7 border border-current bg-current/5 font-extrabold text-sm tracking-tighter">
      I
    </div>
  )

  return (
    <>
      {/* CAMADA BLINDADA QUE TROCA DE FOTO SOZINHA */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-dinamico transition-all duration-700"
      ></div>

      {/* SISTEMA (Fica por cima da imagem) */}
      <div className="min-h-screen flex relative z-10 text-current">
        
        <aside className="hidden md:flex glass-panel shrink-0 w-20 lg:w-64 flex-col justify-between py-6 px-4 m-4 mr-0 transition-all duration-300 !border-l-0 border-r">
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-3 px-2 mb-12">
              <LogoI />
              <h1 className="hidden lg:block text-lg font-bold tracking-[0.2em] uppercase mt-1">
                {loja?.nome || 'ESTOQUE'}
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

        <main className="app-content flex-1 overflow-y-auto relative p-3 md:p-8 pb-32 md:pb-8">
          <div className="md:hidden flex justify-between items-center mb-6 glass-panel p-4 !border-l-0 relative">
            <div className="flex items-center gap-3">
              <LogoI />
              <span className="font-bold tracking-[0.12em] uppercase text-xs mt-1">{loja?.nome || 'ESTOQUE'}</span>
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

        <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 w-full glass-panel !border-l-0 !border-b-0 !border-x-0 !border-t border-t-current/10 flex justify-around items-stretch z-50">
          {principaisMobile.map((item) => {
            const Icon = item.icon
            const ativo = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`mobile-nav-item flex flex-col items-center justify-center gap-1 transition-all ${
                  ativo ? 'opacity-100 font-black' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <Icon size={24} strokeWidth={ativo ? 2.5 : 1.8} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <button onClick={() => setMaisAberto(true)} className={`mobile-nav-item flex flex-col items-center justify-center gap-1 ${extrasMobile.some(item => location.pathname === item.path) ? 'font-black opacity-100' : 'opacity-60'}`}><MoreHorizontal size={25}/><span>Mais</span></button>
        </nav>

        {maisAberto && <div className="md:hidden fixed inset-0 z-[65] bg-black/75 flex items-end" onClick={() => setMaisAberto(false)}><div className="glass-panel !bg-[var(--bg-color)] w-full rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><strong className="text-xl">Mais opções</strong><button onClick={() => setMaisAberto(false)} className="touch-button"><X size={24}/></button></div><div className="grid grid-cols-2 gap-3">{extrasMobile.map(item => { const Icon=item.icon; return <Link key={item.path} to={item.path} onClick={() => setMaisAberto(false)} className={`mobile-menu-card ${location.pathname===item.path?'active':''}`}><Icon size={25}/><span>{item.name}</span></Link>})}<button onClick={onLogout} className="mobile-menu-card text-rose-500"><LogOut size={25}/><span>Sair</span></button></div></div></div>}

        <RelatorioWhatsapp token={token} />

      </div>
    </>
  )
}

export default Layout
