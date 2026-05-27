const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection FAILED:", err.message);
  } else {
    console.log("Database connected successfully!");
    connection.release();
  }
});

module.exports = pool.promise();