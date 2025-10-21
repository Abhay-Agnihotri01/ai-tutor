import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  generateCertificate,
  getUserCertificates,
  verifyCertificate
} from '../controllers/certificateController.js';

const router = express.Router();

// Public routes
router.get('/verify/:certificateNumber', verifyCertificate);

// Protected routes
router.use(authenticate);
router.post('/generate/:courseId', generateCertificate);
router.get('/user', getUserCertificates);

export default router;