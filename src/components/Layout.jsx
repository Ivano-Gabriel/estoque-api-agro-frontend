import { Outlet, NavLink } from 'react-router-dom'

function Layout({ token, onLogout }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      
      <aside style={{
        width: '200px', flexShrink: 0,
        background: 'var(--surface-1)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '0.5px solid var(--border)' }}>
          <p style={{ fontWeight: '500', margin: 0, color: 'var(--text-primary)' }}>Estoque Agro</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>v1.0</p>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { to: '/produtos', label: 'Produtos', icon: 'ti-box' },
            { to: '/repor', label: 'Repor', icon: 'ti-refresh' },
            { to: '/lucro', label: 'Lucro', icon: 'ti-chart-bar' },
            { to: '/config', label: 'Configurações', icon: 'ti-settings' },
          ].map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '8px',
              fontSize: '14px', textDecoration: 'none',
              background: isActive ? 'var(--bg-accent)' : 'transparent',
              color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
            })}>
              <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: '16px' }} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '0.5px solid var(--border)' }}>
          <button onClick={onLogout} style={{
            width: '100%', padding: '8px', borderRadius: '8px',
            background: 'transparent', border: '0.5px solid var(--border)',
            color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer'
          }}>
            Sair
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--surface-0)' }}>
        <Outlet />
      </main>

    </div>
  )
}

export default Layout