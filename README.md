# Bus Reservation System

Full-stack ticket reservation app with:
- React frontend
- Express backend
- MySQL database

## Setup

1. Install dependencies:

```bash
cd c:\Users\nives\OneDrive\Desktop\dev\BusReservationSystem
npm run install-all
```

2. Copy backend environment variables:

```bash
cd backend
copy .env.example .env
```

3. Create MySQL tables using `backend/sql/schema.sql`.
4. Start both apps:

```bash
npm run dev
```

## Features
- User register and login
- Passenger details collection
- Bus booking with date validation (today or later)
- Booking history for completed journeys
