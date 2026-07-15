import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'

function Layout({ token, onLogout }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const menuItems = [
    { to: '/', label: 'Início', icon: 'ti-home' }, 
    { to: '/produtos', label: 'Produtos', icon: 'ti-box' },
    { to: '/gerenciar', label: 'Gerenciar', icon: 'ti-package' },
    { to: '/lucro', label: 'Lucro', icon: 'ti-chart-bar' },
    { to: '/config', label: 'Config', icon: 'ti-settings' },
  ]

  if (!isMobile) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#0f172a' }}>
        <aside style={{
          width: '240px', flexShrink: 0, background: '#1e293b',
          borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
            <p style={{ fontWeight: '800', margin: 0, color: '#38bdf8', fontSize: '18px' }}>Estoque Inteligente</p> 
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>v1.0</p>
          </div>
          <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map(({ to, label, icon }) => (
              <NavLink end={to === '/'} key={to} to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px', fontSize: '14px', textDecoration: 'none',
                background: isActive ? '#0f172a' : 'transparent', color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? '600' : '500', transition: 'all 0.2s'
              })}>
                <i className={`ti ${icon}`} style={{ fontSize: '18px' }} />
                {label === 'Config' ? 'Configurações' : label}
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
            <button onClick={onLogout} style={{
              width: '100%', padding: '12px', borderRadius: '10px', background: 'transparent',
              border: '1px solid #ef4444', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontWeight: '600',
              transition: 'all 0.2s'
            }}>Sair da Conta</button>
          </div>
        </aside>
        <main style={{ flex: 1, overflow: 'auto', background: '#0f172a' }}>
          <Outlet />
        </main>
      </div>
    )
  }

  const bottomNavItems = menuItems.filter(item => item.label !== 'Config')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', background: '#1e293b', borderBottom: '1px solid #334155', zIndex: 10
      }}>
        <span style={{ fontWeight: '800', fontSize: '18px', color: '#38bdf8' }}>Estoque Inteligente</span>
        <button onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#f8fafc', cursor: 'pointer' }}>
          ☰
        </button>
      </header>

      <main style={{ flex: 1, overflow: 'auto', paddingBottom: '70px', background: '#0f172a' }}>
        <Outlet />
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px',
        background: '#1e293b', borderTop: '1px solid #334155',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 100
      }}>
        {bottomNavItems.map(({ to, label, icon }) => (
          <NavLink end={to === '/'} key={to} to={to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            textDecoration: 'none', color: isActive ? '#38bdf8' : '#94a3b8',
            fontSize: '11px', fontWeight: isActive ? '600' : '500', width: `${100 / bottomNavItems.length}%`
          })}>
            <i className={`ti ${icon}`} style={{ fontSize: '22px' }} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {menuAberto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
          <div onClick={() => setMenuAberto(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.8)' }} />
          <aside style={{
            position: 'relative', width: '260px', background: '#1e293b', height: '100%',
            display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
              <span style={{ fontWeight: '800', fontSize: '18px', color: '#38bdf8' }}>Menu</span>
              <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8' }}>✕</button>
            </div>
            
            <nav style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {menuItems.map(({ to, label, icon }) => (
                <NavLink end={to === '/'} key={to} to={to} onClick={() => setMenuAberto(false)} style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
                  fontSize: '15px', textDecoration: 'none', background: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#38bdf8' : '#e2e8f0', fontWeight: isActive ? '600' : '500',
                })}>
                  <i className={`ti ${icon}`} style={{ fontSize: '20px' }} />
                  {label === 'Config' ? 'Configurações' : label}
                </NavLink>
              ))}
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
              <button onClick={onLogout} style={{
                width: '100%', padding: '12px', borderRadius: '10px', background: 'transparent',
                border: '1px solid #ef4444', color: '#ef4444', fontSize: '14px', cursor: 'pointer', fontWeight: '600'
              }}>Sair da Conta</button>
            </div>
          </aside>
          <style>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
        </div>
      )}
    </div>
  )
}

export default Layout