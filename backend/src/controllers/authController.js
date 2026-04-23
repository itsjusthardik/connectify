import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for an admin
 * @param {String} id - Admin MongoDB ID
 * @returns {String} JWT token that expires in 30 days
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Register a new admin
 * @route POST /api/admin/register
 * @body {name, email, password}
 * @returns {token, admin object}
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if admin already exists with this email
    const adminExists = await Admin.findOne({ email: normalizedEmail });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create admin (password auto-hashed via pre-save hook in schema)
    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // Generate JWT token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Login an admin
 * @route POST /api/admin/login
 * @body {email, password}
 * @returns {token, admin object}
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fetch admin and explicitly include password field (normally hidden)
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get current authenticated admin
 * @route GET /api/admin/me
 * @middleware auth (requires valid JWT token)
 * @returns {admin object}
 */
export const getMe = async (req, res) => {
  try {
    // req.admin is set by the protect middleware after JWT verification
    const admin = await Admin.findById(req.admin.id);
    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
