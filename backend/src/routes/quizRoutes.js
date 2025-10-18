import express from 'express';
import { 
  createQuiz, 
  deleteQuiz,
  getChapterQuizzes, 
  addQuestion, 
  startQuizAttempt, 
  submitQuizAttempt,
  submitAssignment,
  getSubmissionsForGrading,
  gradeSubmission,
  uploadAssignment,
  getQuizDetails,
  updateQuiz,
  deleteQuestion
} from '../controllers/quizController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
// Removed Sequelize import

const router = express.Router();

// Public routes (no authentication required)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Quiz routes working' });
});
router.get('/chapter/:chapterId', getChapterQuizzes);

// Protected routes (authentication required)
router.use(authenticate);

// Quiz management (instructors only)
router.post('/quizzes', authorize('instructor', 'admin'), createQuiz);
router.get('/quizzes/:quizId', authorize('instructor', 'admin'), getQuizDetails);
router.put('/quizzes/:quizId', authorize('instructor', 'admin'), updateQuiz);
router.delete('/quizzes/:quizId', authorize('instructor', 'admin'), deleteQuiz);
router.post('/questions', authorize('instructor', 'admin'), addQuestion);
router.delete('/questions/:questionId', authorize('instructor', 'admin'), deleteQuestion);
router.get('/submissions/:quizId', authorize('instructor', 'admin'), getSubmissionsForGrading);
router.put('/grade/:attemptId', authorize('instructor', 'admin'), gradeSubmission);

// Student quiz/assignment routes
router.post('/attempt/start', startQuizAttempt);
router.post('/attempt/submit', submitQuizAttempt);
router.post('/assignment/submit', uploadAssignment.single('assignment'), submitAssignment);
router.get('/attempt/status/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    
    // Set aggressive no-cache headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Get quiz with questions count
    const { data: quiz } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (count)
      `)
      .eq('id', quizId)
      .single();
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const currentVersion = Math.floor(new Date(quiz.updatedAt).getTime() / 1000);
    
    // Get latest attempt
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quizId', quizId)
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(1);
    
    const latestAttempt = attempts?.[0] || null;
    const hasAttempted = latestAttempt && (latestAttempt.status === 'completed' || latestAttempt.status === 'graded');
    
    // Check if quiz was updated after last attempt
    let canRetake = false;
    if (hasAttempted && latestAttempt) {
      const attemptVersion = Math.floor(new Date(latestAttempt.createdAt).getTime() / 1000);
      canRetake = currentVersion > attemptVersion;
    }
    
    res.json({
      success: true,
      hasAttempted: !!hasAttempted,
      canRetake,
      quizVersion: currentVersion,
      attempt: latestAttempt ? {
        id: latestAttempt.id,
        status: latestAttempt.status,
        score: latestAttempt.score,
        totalMarks: quiz.totalMarks,
        percentage: latestAttempt.percentage,
        submittedAt: latestAttempt.submittedAt,
        quizVersion: Math.floor(new Date(latestAttempt.createdAt).getTime() / 1000)
      } : null
    });
  } catch (error) {
    console.error('Quiz attempt status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;