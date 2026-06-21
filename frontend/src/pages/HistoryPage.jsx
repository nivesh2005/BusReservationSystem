import { useEffect, useState } from 'react';
import { deleteBooking, fetchHistory } from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHistory()
      .then((res) => setHistory(res.data))
      .catch(() => setMessage('Unable to load journey history.'));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await deleteBooking(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      setMessage('Booking deleted successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete booking.');
    }
  }

  return (
    <div className="page-card">
      <h2>Journey History</h2>
      {message && <div className="error">{message}</div>}
      {!history.length ? (
        <p>No journeys yet. Book a trip to see history.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div><strong>Route:</strong> {item.route}</div>
              <div><strong>Date:</strong> {new Date(item.travelDate).toLocaleDateString()}</div>
              <div><strong>Passenger:</strong> {item.passengerName} ({item.passengerAge}/{item.passengerGender})</div>
              <div><strong>Pickup:</strong> {item.pickupLocation}</div>
              <div><strong>Dropoff:</strong> {item.dropoffLocation}</div>
              <div><strong>Status:</strong> {item.status}</div>
              <button className="delete-button" type="button" onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
