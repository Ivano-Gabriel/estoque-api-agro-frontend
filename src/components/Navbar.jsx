function Navbar({ onLogout }) {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      borderBottom: '1px solid #1e1e1e',
      background: '#0a0a0a',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
          Estoque
        </span>
        <span style={{
          fontSize: '11px',
          background: '#1e1e1e',
          color: '#888',
          padding: '2px 8px',
          borderRadius: '20px'
        }}>
          v1.0
        </span>
      </div>

      <button className="btn-primary" onClick={onLogout}
        style={{ padding: '8px 16px', fontSize: '13px' }}>
        Sair
      </button>
    </nav>
  )
}

export default Navbar