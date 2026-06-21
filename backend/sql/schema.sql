CREATE DATABASE  bus_reservation2;
USE bus_reservation2;

CREATE TABLE  users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  dob DATE NOT NULL,
  address VARCHAR(255) NOT NULL,
  gender VARCHAR(25),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE  buses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route VARCHAR(255) NOT NULL,
  fare DECIMAL(10,2) NOT NULL,
  duration VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  busId INT NOT NULL,
  travelDate DATE NOT NULL,
  passengerName VARCHAR(150) NOT NULL,
  passengerAge INT NOT NULL,
  passengerGender VARCHAR(20) NOT NULL,
  pickupLocation VARCHAR(255) NOT NULL,
  dropoffLocation VARCHAR(255) NOT NULL,
  route VARCHAR(255) NOT NULL,
  fare DECIMAL(10,2) NOT NULL,
  seatNumber VARCHAR(10),
  status VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (busId) REFERENCES buses(id) ON DELETE CASCADE
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seatNumber VARCHAR(10);

INSERT INTO buses (route, fare, duration) VALUES
  ('Chennai → Madurai', 450.00, '5h 30m'),
  ('Coimbatore → Trichy', 300.00, '3h 40m'),
  ('Madurai → Rameswaram', 380.00, '4h 20m'),
  ('Salem → Erode', 220.00, '2h 15m')
ON DUPLICATE KEY UPDATE route = route;
