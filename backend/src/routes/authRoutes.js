import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, googleCallback, completeGoogleSignup } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import passport from '../config/passport.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 })
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], login);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, uploadAvatar.single('avatar'), updateProfile);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);
router.post('/google/complete', completeGoogleSignup);

export default router;