const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function requireAuth(req, res, next) {
  const auth = req.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    console.log('[auth] Missing token. Authorization header:', auth);
    return res.status(401).json({ error: 'missing token' });
  }
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.log('[auth] Invalid token. Error:', err.message, 'JWT_SECRET length:', JWT_SECRET.length);
    return res.status(401).json({ error: 'invalid token', reason: err.message });
  }
}

// export the middleware function directly for simple require() usage
module.exports = requireAuth;