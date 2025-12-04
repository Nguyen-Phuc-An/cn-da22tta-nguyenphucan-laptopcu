const express = require('express');
const cors = require('cors'); // added
require('dotenv').config();
const api = require('./routes/index');
const { initializeSocketHandlers } = require('./socket');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true })); // allow dev frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded files
app.use('/public', express.static(require('path').join(__dirname, '..', 'public')));

// mount API
app.use('/api', api);

// ensure admin user exists on startup
try {
  const ensureAdmin = require('./scripts/ensureAdmin');
  if (require.main === module) {
    ensureAdmin().catch(err => console.error('ensureAdmin failed:', err));
  }
} catch (e) {
  // ignore if script missing
}

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'server error' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  const server = require('http').createServer(app);
  const { Server } = require('socket.io');
  
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      credentials: true
    }
  });

  // Initialize Socket.IO handlers
  initializeSocketHandlers(io);

  server.listen(port, () => console.log(`API listening on http://localhost:${port}/api with WebSocket support`));
}

module.exports = app;