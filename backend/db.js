const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'bus_reservation',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const database = process.env.MYSQL_DATABASE || 'bus_reservation';
  try {
    const conn = await pool.getConnection();
    console.log(`✅ Database connection successful: ${host}/${database}`);
    conn.release();
  } catch (error) {
    console.error(`❌ Database connection failed: ${host}/${database} -`, error.message);
  }
}

testConnection();

module.exports = pool;
