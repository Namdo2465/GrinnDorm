const { verifyToken, extractTokenFromHeader } = require('../utils/jwtUtils');

// Middleware to verify JWT token on protected routes
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      console.error('Auth: No authorization header provided');
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Extract token from "Bearer <token>"
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      console.error('Auth: Invalid authorization header format');
      return res.status(401).json({ error: 'Invalid authorization header format' });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      console.error('Auth: Invalid or expired token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request object
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email
    };

    console.log(`Auth: Valid token for user ${decoded.user_id}`);
    next(); // Continue to next route handler
  } catch (err) {
    console.error('Error in authMiddleware:', err);
    res.status(500).json({ error: 'Authentication error' });
  }
}

module.exports = authMiddleware;
