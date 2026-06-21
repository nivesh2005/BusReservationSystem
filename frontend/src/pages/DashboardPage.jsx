import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHistory, deleteBooking, fetchProfile } from '../services/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage('');
    Promise.all([fetchProfile(), fetchHistory()])
      .then(([userRes, historyRes]) => {
        setUser(userRes.data);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const allBookings = historyRes.data || [];
        const upcomingBookings = allBookings.filter((booking) => {
          const travel = new Date(booking.travelDate);
          travel.setHours(0, 0, 0, 0);
          return travel >= today;
        });

        const pastBookings = allBookings.filter((booking) => {
          const travel = new Date(booking.travelDate);
          travel.setHours(0, 0, 0, 0);
          return travel < today;
        });

        setUpcoming(upcomingBookings);
        setPast(pastBookings);
      })
      .catch(() => setMessage('Unable to load dashboard data.'));
  }, []);

  async function removeBooking(id) {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await deleteBooking(id);
      setUpcoming((prev) => prev.filter((booking) => booking.id !== id));
      setMessage('Booking canceled successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not cancel booking.');
    }
  }

  const nextTrip = upcoming[0];

  return (
    <div className="page-card dashboard-page container">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Your travel cockpit</p>
          <h1>Welcome back{user ? `, ${user.firstName}` : ''}.</h1>
          <p className="small-muted">See your next journey, track booking activity, and reserve new trips in one place.</p>
        </div>
        <div className="status-cards">
          <div className="status-card">
            <h3>Total Trips</h3>
            <p>{upcoming.length + past.length}</p>
          </div>
          <div className="status-card">
            <h3>Upcoming</h3>
            <p>{upcoming.length}</p>
          </div>
          <div className="status-card">
            <h3>Completed</h3>
            <p>{past.length}</p>
          </div>
        </div>
      </div>

      {message && <div className="info">{message}</div>}

      <div className="highlight-card card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
        {nextTrip ? (
          <>
            <div>
              <p className="eyebrow">Next trip</p>
              <h2>{nextTrip.route}</h2>
              <p>{new Date(nextTrip.travelDate).toLocaleDateString()} · {nextTrip.pickupLocation} → {nextTrip.dropoffLocation}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="primary-outline" onClick={() => removeBooking(nextTrip.id)}>
                Cancel trip
              </button>
              <Link className="cta" to="/booking">
                Book new trip
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="eyebrow">No upcoming trips</p>
              <h2>Plan your next adventure</h2>
              <p>Choose your route and reserve a seat for the next available travel date.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link className="cta" to="/booking">
                Book now
              </Link>
            </div>
          </>
        )}
      </div>

      <section>
        <div className="section-header">
          <h2>Upcoming trips</h2>
          <p>Your confirmed bookings scheduled from today onwards.</p>
        </div>
        {!upcoming.length ? (
          <div className="empty-state">No upcoming trips yet. Reserve your next journey today.</div>
        ) : (
          <div className="history-list">
            {upcoming.map((booking) => (
              <div key={booking.id} className="history-item">
                <div><strong>Route:</strong> {booking.route}</div>
                <div><strong>Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</div>
                <div><strong>Passenger:</strong> {booking.passengerName} ({booking.passengerAge}/{booking.passengerGender})</div>
                <div><strong>Pickup:</strong> {booking.pickupLocation}</div>
                <div><strong>Dropoff:</strong> {booking.dropoffLocation}</div>
                <button type="button" className="delete-button" onClick={() => removeBooking(booking.id)}>
                  Cancel trip
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-header">
          <h2>Past journeys</h2>
          <p>Completed bookings and travel history.</p>
        </div>
        {!past.length ? (
          <div className="empty-state">No completed journeys yet. Completed trips will appear here.</div>
        ) : (
          <div className="history-list">
            {past.map((booking) => (
              <div key={booking.id} className="history-item">
                <div><strong>Route:</strong> {booking.route}</div>
                <div><strong>Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</div>
                <div><strong>Passenger:</strong> {booking.passengerName} ({booking.passengerAge}/{booking.passengerGender})</div>
                <div><strong>Pickup:</strong> {booking.pickupLocation}</div>
                <div><strong>Dropoff:</strong> {booking.dropoffLocation}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
