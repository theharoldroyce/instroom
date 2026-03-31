require('dotenv').config();

const mysql = require('mysql2');

const dbUrl = new URL(process.env.DATABASE_URL);

const connection = mysql.createConnection({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  port: dbUrl.port
});

connection.connect(err => {
  if (err) throw err;
  connection.end();
});