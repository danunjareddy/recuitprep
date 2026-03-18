import mysql from 'mysql2/promise';

async function setupDB() {
  let connection;
  try {
    // Connect without DB to create it
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'system'
    });

    // Create database
    await connection.execute('CREATE DATABASE IF NOT EXISTS `recruitprep`');
    console.log('Database `recruitprep` created/ready.');

    // Connect to DB and create users table
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'system',
      database: 'recruitprep'
    });

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Users table created/ready.');
    console.log('Setup complete! Ready for npm run dev');
  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

setupDB();

