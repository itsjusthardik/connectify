import jwt from 'jsonwebtoken';

/**
 * Protect middleware to verify JWT token
 * Extracts token from Authorization header (Bearer token)
 * Verifies token signature and expiration
 * Sets req.admin with decoded token payload
 * Used on protected routes to ensure admin is authenticated
 */
export const protect = (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found, deny access
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded payload (contains admin id) to req object
    // This makes adminId available in the route handler
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};
