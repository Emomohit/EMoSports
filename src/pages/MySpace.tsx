export default function MySpace() {
  return (
    <div className="content-pad" style={{ paddingTop: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>My Space</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
        Manage your profile, watchlist, and subscriptions.
      </p>
      
      <div style={{
        background: 'var(--bg-card)',
        padding: '3rem',
        borderRadius: '20px',
        textAlign: 'center',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'var(--accent-primary)',
          margin: '0 auto 1.5rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: 'bold'
        }}>
          M
        </div>
        <h2>Mohit</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>Premium Subscriber</p>
        <button className="btn-primary" style={{ margin: '0 auto' }}>Edit Profile</button>
      </div>
    </div>
  );
}
