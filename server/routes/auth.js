import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, refresh, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { normalizeRole } from '../utils/userMetadata.js';

const router = express.Router();

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain a special character'),
  body('role')
    .isIn(['Content Creator','Video Editor','Graphic Designer','Consumer','Other'])
    .withMessage('Invalid role selected')
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
]

router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)
router.post('/logout', logout)
router.post('/refresh', refresh)
router.get('/me', authMiddleware, getMe)
router.get('/health', (req, res) => res.json({ status: 'ok' }))

export default router;
