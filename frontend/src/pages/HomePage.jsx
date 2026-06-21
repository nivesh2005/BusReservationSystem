import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="container">
      <div className="page-card hero">
        <div className="hero-text">
          <p className="small-muted">Modern fleet management</p>
          <h1>Move smarter with bus reservations designed for professionals.</h1>
          <p className="small-muted">Reserve seats, track upcoming routes, and keep your travel history organized in a refined and reliable interface.</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <Link className="cta" to="/register">Create account</Link>
            <Link className="primary-outline" to="/login">Login</Link>
          </div>
        </div>

        <div style={{ minWidth: 300 }}>
          <div className="card">
            <h3>Smart dashboard</h3>
            <p className="small-muted">View upcoming trips and completed journeys at a glance.</p>
          </div>
          <div style={{ height: 12 }} />
          <div className="card">
            <h3>Fast bookings</h3>
            <p className="small-muted">Select routes, choose dates, and confirm tickets with modern speed.</p>
          </div>
          <div style={{ height: 12 }} />
          <div className="card">
            <h3>Secure access</h3>
            <p className="small-muted">Login safely and manage bookings by user account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
