const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT token for verified user
function generateToken(userId, email) {
  const token = jwt.sign(
    {
      user_id: userId,
      email: email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d", // Token valid for 7 days
    }
  );
  return token;
}

// Verify JWT token and extract user info
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // Returns { user_id, email, iat, exp }
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return null; // Token invalid or expired
  }
}

// Extract token from Authorization header
function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

// Middleware to authenticate requests using JWT token
function authenticateToken(req, res, next) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ error: "Invalid token" });
  }

  req.user = decoded;
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  authenticateToken,
};
