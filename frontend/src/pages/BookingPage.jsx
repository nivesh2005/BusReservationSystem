import { useEffect, useState } from 'react';
import { fetchBuses, createBooking } from '../services/api';

export default function BookingPage() {
  const [buses, setBuses] = useState([]);
  const [minDate, setMinDate] = useState('');
  const [form, setForm] = useState({
    busId: '',
    travelDate: '',
    travelTime: '',
    passengerName: '',
    passengerAge: '',
    passengerGender: '',
    pickupLocation: '',
    dropoffLocation: '',
    seatNumber: '',
  });
  const [message, setMessage] = useState('');

  function formatINR(value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formatted = today.toISOString().slice(0, 10);
    setMinDate(formatted);
    setForm((prev) => ({ ...prev, travelDate: formatted, travelTime: '10:00' }));

    fetchBuses().then((res) => setBuses(res.data)).catch(() => setMessage('Could not load buses.'));
  }, []);

  const selectedBus = buses.find((bus) => bus.id === Number(form.busId));

  function normalize(value) {
    return value?.trim().toLowerCase() || '';
  }

  function routeMatches(bus, pickup, dropoff) {
    const routeText = normalize(bus.route);
    const origin = routeText.split('→')[0]?.trim() || routeText;
    const destination = routeText.split('→')[1]?.trim() || '';
    const pick = normalize(pickup);
    const drop = normalize(dropoff);

    if (pick && drop) {
      return routeText.includes(pick) && routeText.includes(drop);
    }
    if (pick) {
      return routeText.includes(pick) || origin.includes(pick) || destination.includes(pick);
    }
    if (drop) {
      return routeText.includes(drop) || origin.includes(drop) || destination.includes(drop);
    }
    return true;
  }

  const availableBuses = buses.filter((bus) => bus.seatsAvailable > 0 && routeMatches(bus, form.pickupLocation, form.dropoffLocation));

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'busId') {
        next.seatNumber = '';
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(form.travelDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setMessage('Travel date must be today or later.');
      return;
    }

    if (!form.busId) {
      setMessage('Please select a bus route.');
      return;
    }

    if (!form.seatNumber) {
      setMessage('Please select a seat number.');
      return;
    }

    if (!form.travelTime) {
      setMessage('Please select a travel time.');
      return;
    }

    try {
      await createBooking(form);
      setMessage('Booking successful. Check your dashboard for upcoming trips.');
      setForm({ busId: '', travelDate: minDate, travelTime: '10:00', passengerName: '', passengerAge: '', passengerGender: '', pickupLocation: '', dropoffLocation: '', seatNumber: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Booking failed');
    }
  }

  return (
    <div className="page-card form-card booking-page">
      <div className="section-top">
        <div>
          <p className="eyebrow">Smooth booking</p>
          <h1>Reserve your seat in seconds</h1>
          <p className="subheading">Choose a route, set your travel date, and confirm your ticket with modern booking flow.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid-two">
          <div>
            <label>Travel Date</label>
            <input
              type="date"
              min={minDate}
              value={form.travelDate}
              onChange={(e) => updateField('travelDate', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Travel Time</label>
            <input
              type="time"
              value={form.travelTime}
              onChange={(e) => updateField('travelTime', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid-two">
          <div>
            <label>Passenger Name</label>
            <input value={form.passengerName} onChange={(e) => updateField('passengerName', e.target.value)} required />
          </div>
          <div>
            <label>Passenger Age</label>
            <input type="number" min="1" value={form.passengerAge} onChange={(e) => updateField('passengerAge', e.target.value)} required />
          </div>
        </div>

        <label>Passenger Gender</label>
        <select value={form.passengerGender} onChange={(e) => updateField('passengerGender', e.target.value)} required>
          <option value="">Choose gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label>Pickup Location</label>
        <input value={form.pickupLocation} onChange={(e) => updateField('pickupLocation', e.target.value)} required />

        <label>Dropoff Location</label>
        <input value={form.dropoffLocation} onChange={(e) => updateField('dropoffLocation', e.target.value)} required />

        {selectedBus && (
          <div className="seat-selection-panel">
            <label>Seat Number</label>
            <input
              type="number"
              min="1"
              max="40"
              value={form.seatNumber}
              onChange={(e) => updateField('seatNumber', e.target.value)}
              placeholder="Enter seat number"
              required
            />
            <p className="small-muted">Enter a seat number between 1 and 40. Seat layout diagram is hidden.</p>
          </div>
        )}

        {selectedBus && (
          <div className="route-preview">
            <p><strong>Route preview:</strong> {selectedBus.route}</p>
            <p>Duration: {selectedBus.duration}</p>
            <p>Fare: {formatINR(selectedBus.fare)}</p>
            <p>Seats available: {selectedBus.seatsAvailable}</p>
            {form.seatNumber && <p>Selected seat: {form.seatNumber} ({form.passengerGender})</p>}
          </div>
        )}

        <div className="route-preview">
          <h3>Available buses</h3>
          {form.pickupLocation && form.dropoffLocation ? (
            availableBuses.length ? (
              <div className="grid">
                {availableBuses.map((bus) => (
                  <div key={bus.id} className="card available-bus-card">
                    <h4>{bus.route}</h4>
                    <p>Seats available: {bus.seatsAvailable}</p>
                    <p>{bus.duration} · ₹{bus.fare}</p>
                    <button
                      type="button"
                      className="primary-outline"
                      onClick={() => updateField('busId', bus.id.toString())}
                    >
                      Select this bus
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No buses found for this pickup and dropoff combination.</p>
            )
          ) : (
            <p>Enter pickup and dropoff locations to see buses and available seats.</p>
          )}
        </div>

        <button type="submit" className="primary-button">Book Now</button>
        {message && <div className="info">{message}</div>}
      </form>
    </div>
  );
}
