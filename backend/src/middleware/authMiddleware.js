import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT authentication tokens on protected admin routes.
 */
export const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Bearer token is missing or malformed.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is missing.',
      });
    }

    const secret = process.env.JWT_SECRET || 'elevate_default_jwt_secret_key';
    const decoded = jwt.verify(token, secret);

    // Attach verified admin details to the request object
    req.admin = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};
