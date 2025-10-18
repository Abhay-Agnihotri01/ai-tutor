import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import supabase from './config/supabase.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import chapterRoutes from './routes/chapterRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';

import passport from './config/passport.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'self'", "http://localhost:5173", "http://localhost:3000"]
    }
  }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for development
  skip: (req) => req.path.includes('/mock/') // skip rate limiting for mock endpoints
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for existing thumbnails (legacy support)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Set proper MIME types for different file types
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Passport middleware
app.use(passport.initialize());

// Debug endpoints (before auth middleware)
app.get('/api/debug/question-table', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(1);
    
    res.json({ 
      success: true,
      message: 'Questions table accessible',
      sampleData: data
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to access questions table'
    });
  }
});

app.post('/api/debug/test-submission', (req, res) => {
  console.log('=== TEST SUBMISSION RECEIVED ===');
  console.log('Body:', req.body);
  res.json({ success: true, message: 'Test submission received' });
});

app.get('/api/debug/test-question-model', async (req, res) => {
  try {
    const { Question, Quiz } = await import('./models/index.js');
    
    // First check if we have a valid quiz
    const quiz = await Quiz.findOne();
    if (!quiz) {
      return res.status(400).json({ error: 'No quiz found to test with' });
    }
    
    // Test basic question creation
    const testData = {
      quizId: quiz.id,
      question: 'Test question',
      type: 'mcq',
      options: ['Option A', 'Option B'],
      correctAnswer: 'Option A',
      marks: 1,
      order: 1
    };
    
    console.log('Testing question creation with:', testData);
    
    const question = await Question.create(testData);
    
    res.json({ 
      success: true, 
      question,
      message: 'Question model test successful'
    });
  } catch (error) {
    console.error('Question model test error:', error);
    res.status(500).json({ 
      error: error.message,
      name: error.name,
      sql: error.sql,
      stack: error.stack
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug quiz creation
app.get('/api/debug/quiz/:quizId', async (req, res) => {
  try {
    const { Quiz, Question, Chapter, Course } = await import('./models/index.js');
    const quiz = await Quiz.findByPk(req.params.quizId, {
      include: [{
        model: Chapter,
        as: 'chapter',
        include: [{
          model: Course,
          as: 'course'
        }]
      }, {
        model: Question,
        as: 'questions'
      }]
    });
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug database tables
app.get('/api/debug/tables', async (req, res) => {
  try {
    const tables = ['users', 'courses', 'chapters', 'videos', 'resources', 'enrollments', 'quizzes', 'questions', 'quiz_attempts', 'question_responses'];
    
    res.json({ 
      tables,
      message: 'Supabase tables listed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test question creation
app.post('/api/debug/test-question', async (req, res) => {
  try {
    const { Question, Quiz } = await import('./models/index.js');
    const testQuestion = await Question.create({
      quizId: req.body.quizId,
      question: 'Test question',
      type: 'single_correct',
      options: ['Option 1', 'Option 2'],
      correctAnswer: 'Option 1',
      marks: 1,
      order: 1
    });
    
    // Update quiz total marks
    const quiz = await Quiz.findByPk(req.body.quizId);
    if (quiz) {
      await quiz.increment('totalMarks', { by: 1 });
    }
    
    res.json({ success: true, question: testQuestion });
  } catch (error) {
    console.error('Test question error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Test quiz readiness
app.get('/api/debug/quiz-ready/:quizId', async (req, res) => {
  try {
    const { Quiz, Question } = await import('./models/index.js');
    const quiz = await Quiz.findByPk(req.params.quizId, {
      include: [{
        model: Question,
        as: 'questions'
      }]
    });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const isReady = quiz.type === 'assignment' || (quiz.type === 'quiz' && quiz.questions && quiz.questions.length > 0);
    
    res.json({ 
      quiz: {
        id: quiz.id,
        title: quiz.title,
        type: quiz.type,
        totalMarks: quiz.totalMarks,
        questionCount: quiz.questions?.length || 0,
        isReady
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// Debug rating route (before other routes)
app.get('/api/ratings/test', (req, res) => {
  res.json({ message: 'Rating routes working', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/api/debug/user/:id', async (req, res) => {
  try {
    const { User } = await import('./models/index.js');
    const user = await User.findByPk(req.params.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug video files
app.get('/api/debug/videos', (req, res) => {
  const fs = require('fs');
  const videoDir = path.join(process.cwd(), 'uploads', 'videos');
  try {
    const files = fs.readdirSync(videoDir);
    res.json({ videoFiles: files, videoDir });
  } catch (error) {
    res.json({ error: error.message, videoDir });
  }
});

// Debug assignment files
app.get('/api/debug/assignments', (req, res) => {
  const fs = require('fs');
  const assignmentDir = path.join(process.cwd(), 'uploads', 'assignments');
  try {
    const files = fs.readdirSync(assignmentDir);
    const fileDetails = files.map(file => {
      const filePath = path.join(assignmentDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        url: `/uploads/assignments/${file}`,
        fullUrl: `http://localhost:5000/uploads/assignments/${file}`
      };
    });
    res.json({ assignmentFiles: fileDetails, assignmentDir });
  } catch (error) {
    res.json({ error: error.message, assignmentDir });
  }
});

// Debug quiz totalMarks (public endpoint)
app.get('/api/debug/quiz-marks/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id, title, type, totalMarks, createdAt, updatedAt')
      .eq('id', quizId)
      .single();
    
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('id, userId, score, totalMarks, status, createdAt')
      .eq('quizId', quizId);
    
    res.json({
      quiz: quiz || null,
      attempts: attempts || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug assignment issue (public endpoint)
app.get('/api/debug/assignment/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id, title, type, totalMarks, createdAt, updatedAt')
      .eq('id', quizId)
      .single();
    
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('id, userId, score, totalMarks, status, createdAt')
      .eq('quizId', quizId);
    
    const { data: submissions } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        users (
          firstName,
          lastName,
          email
        ),
        quizzes (
          totalMarks
        )
      `)
      .eq('quizId', quizId)
      .in('status', ['completed', 'graded'])
      .order('submittedAt', { ascending: false });
    
    res.json({
      quiz: quiz || null,
      attempts: attempts || [],
      submissionsForGrading: submissions || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fix assignment totalMarks (public endpoint)
app.get('/api/debug/fix-assignment/:quizId/:totalMarks', async (req, res) => {
  try {
    const { quizId, totalMarks } = req.params;
    const marks = parseInt(totalMarks);
    
    if (isNaN(marks) || marks <= 0) {
      return res.status(400).json({ error: 'Invalid totalMarks value' });
    }
    
    // Update quiz totalMarks
    await supabase
      .from('quizzes')
      .update({ totalMarks: marks })
      .eq('id', quizId);
    
    // Get all attempts for this quiz
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('id, score')
      .eq('quizId', quizId);
    
    // Update all attempts with new totalMarks and recalculated percentage
    for (const attempt of attempts || []) {
      const percentage = marks > 0 ? (attempt.score / marks) * 100 : 0;
      await supabase
        .from('quiz_attempts')
        .update({ 
          totalMarks: marks,
          percentage
        })
        .eq('id', attempt.id);
    }
    
    res.json({ 
      success: true, 
      message: `Assignment totalMarks updated to ${marks}` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api', chapterRoutes);

// Debug enrollments
app.get('/api/debug/enrollments', async (req, res) => {
  try {
    const { Enrollment, Course, User } = await import('./models/index.js');
    const enrollments = await Enrollment.findAll({
      include: [{
        model: Course,
        include: [{
          model: User,
          as: 'instructor',
          attributes: ['firstName', 'lastName']
        }]
      }]
    });
    res.json({ 
      count: enrollments.length,
      enrollments: enrollments.map(e => ({
        id: e.id,
        userId: e.userId,
        courseId: e.courseId,
        courseTitle: e.Course?.title,
        coursePublished: e.Course?.isPublished,
        enrolledAt: e.enrolledAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug specific user enrollments
app.get('/api/debug/enrollments/:userId', async (req, res) => {
  try {
    const { Enrollment, Course, User } = await import('./models/index.js');
    const { userId } = req.params;
    
    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [{
        model: Course,
        include: [{
          model: User,
          as: 'instructor',
          attributes: ['firstName', 'lastName']
        }]
      }]
    });
    
    res.json({ 
      userId,
      count: enrollments.length,
      enrollments: enrollments.map(e => ({
        id: e.id,
        courseTitle: e.Course?.title,
        coursePublished: e.Course?.isPublished,
        enrolledAt: e.enrolledAt,
        progress: e.progress
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multer error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// General error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist, which is fine
      throw error;
    }
    console.log('Supabase connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Note: Make sure to run the database migration script to create tables');
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();