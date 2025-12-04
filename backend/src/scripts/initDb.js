const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('Initializing database...');
  
  // Connect without specifying database first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('Creating database and tables...');
    await connection.query(schema);
    console.log('✓ Database initialized successfully');

  } catch (err) {
    console.error('✗ Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  initDatabase().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = initDatabase;
