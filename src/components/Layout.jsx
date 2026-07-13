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
    { to: '/produtos', label: 'Produtos', icon: 'ti-box' },
    { to: '/repor', label: 'Repor', icon: 'ti-refresh' },
    { to: '/lucro', label: 'Lucro', icon: 'ti-chart-bar' },
    { to: '/config', label: 'Config', icon: 'ti-settings' },
  ]

  // ==================== VISÃO DESKTOP ====================
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#f8f8f7' }}>
        <aside style={{
          width: '240px', flexShrink: 0, background: '#fff',
          borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid #f0f0f0' }}>
            <p style={{ fontWeight: '700', margin: 0, color: '#1a1a1a', fontSize: '16px' }}>Estoque Agro</p>
            <p style={{ fontSize: '12px', color: '#aaa', margin: '4px 0 0' }}>v1.0</p>
          </div>
          <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '10px', fontSize: '14px', textDecoration: 'none',
                background: isActive ? '#f0f0ff' : 'transparent', color: isActive ? '#4f46e5' : '#666',
                fontWeight: isActive ? '600' : '400',
              })}>
                <i className={`ti ${icon}`} style={{ fontSize: '18px' }} />
                {label === 'Config' ? 'Configurações' : label}
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
            <button onClick={onLogout} style={{
              width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent',
              border: '1px solid #e0e0e0', color: '#666', fontSize: '13px', cursor: 'pointer', fontWeight: '500'
            }}>Sair da Conta</button>
          </div>
        </aside>
        <main style={{ flex: 1, overflow: 'auto', background: '#f8f8f7' }}>
          <Outlet />
        </main>
      </div>
    )
  }

  // ==================== VISÃO MOBILE (MESCLADA) ====================
  // Os 3 principais vão pro rodapé
  const bottomNavItems = menuItems.filter(item => item.label !== 'Config')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f8f7' }}>
      
      {/* HEADER: Título e Hambúrguer */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', background: '#fff', borderBottom: '1px solid #f0f0f0', zIndex: 10
      }}>
        <span style={{ fontWeight: '700', fontSize: '18px', color: '#1a1a1a' }}>Estoque Agro</span>
        <button onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#1a1a1a', cursor: 'pointer' }}>
          ☰
        </button>
      </header>

      {/* CONTEÚDO PRINCIPAL (Espaço de 65px pro rodapé não cobrir conteúdo) */}
      <main style={{ flex: 1, overflow: 'auto', paddingBottom: '65px' }}>
        <Outlet />
      </main>

      {/* BOTTOM NAV: Os 3 atalhos principais */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
        background: '#ffffff', borderTop: '1px solid #f0f0f0',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
      }}>
        {bottomNavItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            textDecoration: 'none', color: isActive ? '#4f46e5' : '#888',
            fontSize: '11px', fontWeight: isActive ? '600' : '400', width: '33%'
          })}>
            <i className={`ti ${icon}`} style={{ fontSize: '20px' }} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* MENU HAMBÚRGUER (DRAWER) */}
      {menuAberto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
          <div onClick={() => setMenuAberto(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <aside style={{
            position: 'relative', width: '260px', background: '#fff', height: '100%',
            display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontWeight: '700', fontSize: '18px', color: '#4f46e5' }}>Menu</span>
              <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#666' }}>✕</button>
            </div>
            
            <nav style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* O Hambúrguer exibe todos os itens, útil para a aba Config */}
              {menuItems.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} onClick={() => setMenuAberto(false)} style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
                  fontSize: '15px', textDecoration: 'none', background: isActive ? '#f0f0ff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#444', fontWeight: isActive ? '600' : '500',
                })}>
                  <i className={`ti ${icon}`} style={{ fontSize: '20px' }} />
                  {label === 'Config' ? 'Configurações' : label}
                </NavLink>
              ))}
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #f0f0f0' }}>
              <button onClick={onLogout} style={{
                width: '100%', padding: '12px', borderRadius: '8px', background: '#fff0f0',
                border: '1px solid #fed7d7', color: '#e53e3e', fontSize: '14px', cursor: 'pointer', fontWeight: '600'
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