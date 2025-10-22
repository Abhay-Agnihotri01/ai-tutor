import express from 'express';
import {
  createLiveClass,
  getLiveClasses,
  getLiveClass,
  updateLiveClass,
  startLiveClass,
  endLiveClass,
  joinLiveClass,
  leaveLiveClass,
  deleteLiveClass,
  sendSignal,
  getSignals,
  uploadRecording
} from '../controllers/liveClassController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create live class
router.post('/', authenticate, createLiveClass);

// Get live classes for course
router.get('/course/:courseId', authenticate, getLiveClasses);

// Get single live class
router.get('/:id', authenticate, getLiveClass);

// Update live class
router.put('/:id', authenticate, updateLiveClass);

// Start live class
router.patch('/:id/start', authenticate, startLiveClass);

// End live class
router.patch('/:id/end', authenticate, endLiveClass);

// Join live class
router.post('/:id/join', authenticate, joinLiveClass);

// Leave live class
router.post('/:id/leave', authenticate, leaveLiveClass);

// Delete live class
router.delete('/:id', authenticate, deleteLiveClass);

// Upload recording
router.post('/upload-recording', authenticate, uploadRecording);

// WebRTC Signaling
router.post('/signal', authenticate, sendSignal);
router.get('/signals/:meetingId/:userId', authenticate, getSignals);

export default router;