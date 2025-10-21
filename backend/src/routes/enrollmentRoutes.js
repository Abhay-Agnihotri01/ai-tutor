import express from 'express';
import { enrollInCourse, getUserEnrollments, updateProgress, markVideoComplete, getVideoProgress } from '../controllers/enrollmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/enroll', authenticate, enrollInCourse);
router.get('/my-courses', authenticate, getUserEnrollments);
router.put('/progress', authenticate, updateProgress);
router.post('/video-complete', authenticate, markVideoComplete);
router.get('/video-progress/:courseId', authenticate, getVideoProgress);

export default router;