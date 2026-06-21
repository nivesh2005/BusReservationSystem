const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function authenticateToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, dob, address, gender } = req.body;
    if (!firstName || !lastName || !email || !password || !phone || !dob || !address) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (firstName, lastName, email, password, phone, dob, address, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, phone, dob, address, gender || '']
    );

    res.json({ message: 'Registration complete. You can now login.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const defaultBuses = [
  { route: 'Chennai → Madurai', fare: 450, duration: '5h 30m' },
  { route: 'Coimbatore → Trichy', fare: 300, duration: '3h 40m' },
  { route: 'Madurai → Rameswaram', fare: 380, duration: '4h 20m' },
  { route: 'Salem → Erode', fare: 220, duration: '2h 15m' },
];

async function ensureBookingSchema() {
  try {
    const dbName = process.env.MYSQL_DATABASE || 'bus_reservation';
    const [columns] = await pool.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, 'bookings', 'seatNumber']
    );

    if (!columns.length) {
      await pool.query('ALTER TABLE bookings ADD COLUMN seatNumber VARCHAR(10)');
      console.log('Added missing bookings.seatNumber column');
    }

    const [timeColumn] = await pool.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, 'bookings', 'travelTime']
    );

    if (!timeColumn.length) {
      await pool.query('ALTER TABLE bookings ADD COLUMN travelTime VARCHAR(5)');
      console.log('Added missing bookings.travelTime column');
    }
  } catch (error) {
    console.error('Failed to ensure bookings schema:', error.message);
  }
}

async function seedBuses() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM buses');
    if (rows[0].count === 0) {
      await pool.query(
        'INSERT INTO buses (route, fare, duration) VALUES ? ',
        [defaultBuses.map((bus) => [bus.route, bus.fare, bus.duration])]
      );
      console.log('Seeded default bus routes');
    }
  } catch (error) {
    console.error('Failed to seed buses:', error.message);
  }
}

app.get('/api/buses', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.route, b.fare, b.duration,
              GREATEST(0, 40 - COALESCE(booked.bookings_count, 0)) AS seatsAvailable
       FROM buses b
       LEFT JOIN (
         SELECT busId, COUNT(*) AS bookings_count
         FROM bookings
         GROUP BY busId
       ) booked ON booked.busId = b.id`
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to load buses:', error.message);
    res.status(500).json({ message: 'Unable to load available buses.' });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { busId, travelDate, travelTime, passengerName, passengerAge, passengerGender, pickupLocation, dropoffLocation, seatNumber } = req.body;
    if (!busId || !travelDate || !travelTime || !passengerName || !passengerAge || !passengerGender || !pickupLocation || !dropoffLocation || !seatNumber) {
      return res.status(400).json({ message: 'Please complete all booking fields, including seat selection.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(travelDate);
    requestedDate.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ message: 'Travel date must be today or later.' });
    }

    const [busRows] = await pool.query('SELECT * FROM buses WHERE id = ?', [busId]);
    if (!busRows.length) {
      return res.status(400).json({ message: 'Selected bus route is not valid.' });
    }

    const route = busRows[0].route;
    const fare = busRows[0].fare;

    await pool.query(
      `INSERT INTO bookings (userId, busId, travelDate, travelTime, passengerName, passengerAge, passengerGender, pickupLocation, dropoffLocation, route, fare, seatNumber, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [req.user.userId, busId, travelDate, travelTime, passengerName, passengerAge, passengerGender, pickupLocation, dropoffLocation, route, fare, seatNumber]
    );

    res.json({ message: 'Booking completed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings/history', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE userId = ? ORDER BY travelDate DESC', [req.user.userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!rows.length) return res.status(404).json({ message: 'Booking not found.' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ? AND userId = ?', [bookingId, req.user.userId]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    await pool.query('DELETE FROM bookings WHERE id = ?', [bookingId]);
    res.json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, firstName, lastName, email, phone, dob, address, gender FROM users WHERE id = ?', [req.user.userId]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 4000;

async function initializeDatabase() {
  await ensureBookingSchema();
  await seedBuses();
}

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
});
