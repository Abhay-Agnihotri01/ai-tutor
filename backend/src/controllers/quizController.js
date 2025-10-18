import supabase from '../config/supabase.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for assignment uploads
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'assignments');
    
    try {
      console.log('Assignment upload directory:', uploadDir);
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        console.log('Creating assignment directory...');
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Assignment directory created successfully');
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creating assignment directory:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'assignment-' + uniqueSuffix + path.extname(file.originalname);
      console.log('Generated assignment filename:', filename);
      cb(null, filename);
    } catch (error) {
      console.error('Error generating filename:', error);
      cb(error);
    }
  }
});

export const uploadAssignment = multer({
  storage: assignmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    console.log('File filter - mimetype:', file.mimetype, 'originalname:', file.originalname);
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export const createQuiz = async (req, res) => {
  try {
    const { chapterId, title, description, type, position, videoId, timeLimit, passingMarks, totalMarks } = req.body;
    const instructorId = req.user.id;

    console.log('=== CREATE QUIZ DEBUG ===');
    console.log('Request body:', req.body);
    console.log('totalMarks from request:', totalMarks);
    console.log('type:', type);

    // Verify chapter belongs to instructor
    const { data: chapter } = await supabase
      .from('chapters')
      .select(`
        *,
        courses!chapters_courseId_fkey (
          instructorId
        )
      `)
      .eq('id', chapterId)
      .single();

    if (!chapter || chapter.courses?.instructorId !== instructorId) {
      return res.status(404).json({ message: 'Chapter not found or unauthorized' });
    }
    
    // Ensure totalMarks is properly set for assignments
    const finalTotalMarks = type === 'assignment' ? (parseInt(totalMarks) || 0) : 0;
    console.log('Final totalMarks for database:', finalTotalMarks);
    
    // Create quiz
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        chapterId,
        title,
        description: description || null,
        type: type || 'quiz',
        position: position || 'end_of_chapter',
        videoId: position === 'after_video' ? videoId : null,
        timeLimit: timeLimit || null,
        passingMarks: passingMarks || 60,
        totalMarks: finalTotalMarks,
        order: 1
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user.id;

    // Verify quiz belongs to instructor
    const { data: quiz } = await supabase
      .from('quizzes')
      .select(`
        *,
        chapters!quizzes_chapterId_fkey (
          courses!chapters_courseId_fkey (
            instructorId
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (!quiz || quiz.chapters?.courses?.instructorId !== instructorId) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    // Get quiz attempts first
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('quizId', quizId);

    // Delete question responses for these attempts
    if (attempts && attempts.length > 0) {
      const attemptIds = attempts.map(a => a.id);
      await supabase
        .from('question_responses')
        .delete()
        .in('attemptId', attemptIds);
    }

    // Delete quiz attempts
    await supabase
      .from('quiz_attempts')
      .delete()
      .eq('quizId', quizId);

    // Delete questions
    await supabase
      .from('questions')
      .delete()
      .eq('quizId', quizId);

    // Delete the quiz
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getChapterQuizzes = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Set aggressive no-cache headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Get quizzes with questions
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (*)
      `)
      .eq('chapterId', chapterId)
      .eq('isActive', true)
      .order('order', { ascending: true });

    if (error) throw error;

    const quizzesWithQuestions = [];
    for (const quiz of quizzes || []) {
      let questions = quiz.questions || [];
      let submissionStats = null;
      
      if (quiz.type === 'assignment') {
        // Get submission statistics for assignments
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('status')
          .eq('quizId', quiz.id)
          .in('status', ['completed', 'graded']);

        const totalSubmissions = attempts?.length || 0;
        const totalGraded = attempts?.filter(a => a.status === 'graded').length || 0;
        const pendingGrading = attempts?.filter(a => a.status === 'completed').length || 0;
        
        submissionStats = {
          totalSubmissions,
          totalGraded,
          pendingGrading
        };
      }

      // For quizzes, calculate total marks from questions. For assignments, keep manual totalMarks
      let actualTotalMarks;
      if (quiz.type === 'assignment') {
        actualTotalMarks = quiz.totalMarks; // Keep manual totalMarks for assignments
      } else {
        actualTotalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
        
        // Update quiz totalMarks if it doesn't match actual total
        if (actualTotalMarks !== quiz.totalMarks) {
          await supabase
            .from('quizzes')
            .update({ totalMarks: actualTotalMarks })
            .eq('id', quiz.id);
          quiz.totalMarks = actualTotalMarks;
        }
      }

      const isReady = quiz.type === 'assignment' || (quiz.type === 'quiz' && questions.length > 0);
      
      quizzesWithQuestions.push({
        id: quiz.id,
        chapterId: quiz.chapterId,
        title: quiz.title,
        description: quiz.description,
        type: quiz.type,
        position: quiz.position,
        totalMarks: actualTotalMarks,
        passingMarks: quiz.passingMarks || 0,
        timeLimit: quiz.timeLimit,
        order: quiz.order,
        version: Math.floor(Date.now() / 1000),
        lastUpdated: quiz.updatedAt,
        isActive: quiz.isActive,
        isReady,
        questions,
        submissionStats
      });
    }

    res.json({
      success: true,
      quizzes: quizzesWithQuestions
    });
  } catch (error) {
    console.error('Get chapter quizzes error:', error);
    res.json({
      success: true,
      quizzes: []
    });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { quizId, question, type, options, correctAnswer, marks } = req.body;
    const instructorId = req.user.id;

    // Validate required fields
    if (!quizId || !question || !type) {
      return res.status(400).json({ message: 'Missing required fields: quizId, question, type' });
    }

    // Validate question type and map frontend types to database types
    const typeMapping = {
      'single_correct': 'mcq',
      'multiple_correct': 'mcq',
      'true_false': 'true_false',
      'short_answer': 'short_answer'
    };
    
    if (!typeMapping[type]) {
      return res.status(400).json({ message: 'Invalid question type' });
    }
    
    const dbType = typeMapping[type];

    // Verify quiz exists and belongs to instructor
    const { data: quiz } = await supabase
      .from('quizzes')
      .select(`
        *,
        chapters!quizzes_chapterId_fkey (
          courses!chapters_courseId_fkey (
            instructorId
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (!quiz || quiz.chapters?.courses?.instructorId !== instructorId) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    // Get question count for ordering
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('quizId', quizId);
    
    const order = (count || 0) + 1;

    // Prepare question data
    let processedOptions = null;
    let processedCorrectAnswer = correctAnswer;

    if (type === 'single_correct' || type === 'multiple_correct') {
      processedOptions = Array.isArray(options) ? options.filter(opt => opt && opt.trim()) : [];
      if (processedOptions.length === 0) {
        return res.status(400).json({ message: 'Options are required for this question type' });
      }
    }

    if (type === 'multiple_correct' && !Array.isArray(processedCorrectAnswer)) {
      processedCorrectAnswer = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer].filter(Boolean);
    }

    const finalCorrectAnswer = typeof processedCorrectAnswer === 'string' ? processedCorrectAnswer : JSON.stringify(processedCorrectAnswer);

    // Create question
    const { data: newQuestion, error: questionError } = await supabase
      .from('questions')
      .insert({
        quizId,
        question: question.trim(),
        type: dbType,
        options: processedOptions ? JSON.stringify(processedOptions) : null,
        correctAnswer: finalCorrectAnswer,
        marks: parseInt(marks) || 1,
        order
      })
      .select()
      .single();

    if (questionError) throw questionError;

    // Update quiz total marks and timestamp
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ 
        totalMarks: quiz.totalMarks + (parseInt(marks) || 1),
        updatedAt: new Date().toISOString()
      })
      .eq('id', quizId);

    if (updateError) throw updateError;

    const updatedTotalMarks = quiz.totalMarks + (parseInt(marks) || 1);

    res.status(201).json({
      success: true,
      question: {
        id: newQuestion.id,
        quizId,
        question: question.trim(),
        type: dbType,
        options: processedOptions,
        correctAnswer: finalCorrectAnswer,
        marks: parseInt(marks) || 1,
        order
      },
      quiz: {
        id: quizId,
        totalMarks: updatedTotalMarks,
        isReady: true
      }
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user.id;

    // Get quiz with questions
    const { data: quiz } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (*)
      `)
      .eq('id', quizId)
      .eq('isActive', true)
      .single();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = quiz.questions || [];

    // Check if quiz is ready
    const isReady = quiz.type === 'assignment' || (quiz.type === 'quiz' && questions.length > 0);
    if (!isReady) {
      return res.status(400).json({ message: 'Quiz is not ready yet. Please contact your instructor.' });
    }

    // Check if already attempted and if quiz was updated since last attempt
    const { data: existingAttempts } = await supabase
      .from('quiz_attempts')
      .select('id, createdAt')
      .eq('quizId', quizId)
      .eq('userId', userId)
      .in('status', ['completed', 'graded'])
      .order('createdAt', { ascending: false })
      .limit(1);

    if (existingAttempts && existingAttempts.length > 0) {
      const lastAttempt = existingAttempts[0];
      const attemptTime = new Date(lastAttempt.createdAt).getTime();
      const quizUpdateTime = new Date(quiz.updatedAt).getTime();
      
      // If quiz wasn't updated after last attempt, don't allow retake
      if (quizUpdateTime <= attemptTime) {
        return res.status(400).json({ message: 'Quiz already attempted' });
      }
    }

    // Create attempt
    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quizId,
        userId,
        totalMarks: quiz.totalMarks,
        status: 'in_progress'
      })
      .select()
      .single();

    if (error) throw error;

    // Map database types back to frontend types
    const typeMapping = {
      'mcq': 'single_correct',
      'true_false': 'true_false',
      'short_answer': 'short_answer'
    };

    const processedQuestions = questions.map(q => {
      let options = q.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch (e) {
          options = [];
        }
      }
      
      return {
        id: q.id,
        question: q.question,
        type: typeMapping[q.type] || q.type,
        options: options || [],
        marks: q.marks,
        order: q.order
      };
    });

    res.json({
      success: true,
      attempt: {
        id: attempt.id,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          totalMarks: quiz.totalMarks,
          passingMarks: quiz.passingMarks || 0,
          timeLimit: quiz.timeLimit,
          questions: processedQuestions
        }
      }
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId, responses } = req.body;
    const userId = req.user.id;

    // Get attempt with quiz info
    const { data: attempt } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          title,
          type,
          passingMarks,
          totalMarks
        )
      `)
      .eq('id', attemptId)
      .eq('userId', userId)
      .single();

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    // Get questions
    const { data: questions } = await supabase
      .from('questions')
      .select('id, question, type, correctAnswer, marks')
      .eq('quizId', attempt.quizId);

    let totalScore = 0;
    const questionResponses = [];

    // Process each response
    for (const response of responses) {
      const question = questions.find(q => q.id === response.questionId);
      if (!question) continue;

      let isCorrect = false;
      let marksAwarded = 0;
      
      // Parse correctAnswer if it's a JSON string
      let correctAnswer = question.correctAnswer;
      if (typeof correctAnswer === 'string' && (correctAnswer.startsWith('[') || correctAnswer.startsWith('{'))) {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }

      // Auto-grade different question types - map database types to frontend types
      const questionType = question.type === 'mcq' ? 'single_correct' : question.type;
      
      if (questionType === 'single_correct' || questionType === 'true_false') {
        isCorrect = response.answer === correctAnswer;
        marksAwarded = isCorrect ? question.marks : 0;
      } else if (questionType === 'multiple_correct') {
        const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [];
        const userAnswers = Array.isArray(response.answer) ? response.answer : [];
        
        // Check if arrays are equal (same elements, same length)
        isCorrect = correctAnswers.length === userAnswers.length && 
                   correctAnswers.every(ans => userAnswers.includes(ans));
        marksAwarded = isCorrect ? question.marks : 0;
      }

      totalScore += marksAwarded;

      questionResponses.push({
        attemptId,
        questionId: response.questionId,
        answer: typeof response.answer === 'object' ? JSON.stringify(response.answer) : response.answer,
        isCorrect,
        marksAwarded
      });
    }

    // Save all responses
    if (questionResponses.length > 0) {
      const { error: responseError } = await supabase
        .from('question_responses')
        .insert(questionResponses);
      
      if (responseError) throw responseError;
    }

    // Update attempt
    const percentage = attempt.quizzes.totalMarks > 0 ? (totalScore / attempt.quizzes.totalMarks) * 100 : 0;
    const status = attempt.quizzes.type === 'quiz' ? 'completed' : 'graded';
    
    const { error: updateError } = await supabase
      .from('quiz_attempts')
      .update({
        score: totalScore,
        totalMarks: attempt.quizzes.totalMarks,
        percentage,
        status,
        submittedAt: new Date().toISOString()
      })
      .eq('id', attemptId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      result: {
        score: totalScore,
        totalMarks: attempt.quizzes.totalMarks,
        percentage: percentage.toFixed(2),
        passed: totalScore >= (attempt.quizzes.passingMarks || 0)
      }
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user.id;
    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : null;

    if (!fileUrl) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if quiz exists and is assignment type
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id, type, totalMarks')
      .eq('id', quizId)
      .eq('type', 'assignment')
      .single();

    if (!quiz) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const { data: existingAttempts } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('quizId', quizId)
      .eq('userId', userId);

    if (existingAttempts && existingAttempts.length > 0) {
      // Update existing submission
      const { error } = await supabase
        .from('quiz_attempts')
        .update({
          fileUrl,
          totalMarks: quiz.totalMarks,
          submittedAt: new Date().toISOString(),
          status: 'completed'
        })
        .eq('quizId', quizId)
        .eq('userId', userId);
      
      if (error) throw error;
    } else {
      // Create new submission
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          quizId,
          userId,
          totalMarks: quiz.totalMarks,
          fileUrl,
          submittedAt: new Date().toISOString(),
          status: 'completed'
        });
      
      if (error) throw error;
    }

    res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSubmissionsForGrading = async (req, res) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user.id;

    // Verify quiz belongs to instructor and get submissions
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
          totalMarks,
          chapters (
            courseId,
            courses (
              instructorId
            )
          )
        )
      `)
      .eq('quizId', quizId)
      .in('status', ['completed', 'graded'])
      .order('submittedAt', { ascending: false });

    if (!submissions || submissions.length === 0) {
      return res.json({ success: true, submissions: [] });
    }

    // Verify instructor ownership
    const firstSubmission = submissions[0];
    if (firstSubmission.quizzes?.chapters?.courses?.instructorId !== instructorId) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    const formattedSubmissions = submissions.map(s => ({
      id: s.id,
      quizId: s.quizId,
      userId: s.userId,
      score: s.score,
      totalMarks: s.quizzes.totalMarks,
      percentage: s.percentage,
      status: s.status,
      submittedAt: s.submittedAt,
      fileUrl: s.fileUrl,
      feedback: s.feedback,
      courseId: s.quizzes.chapters.courseId,
      user: {
        firstName: s.users.firstName,
        lastName: s.users.lastName,
        email: s.users.email
      }
    }));

    res.json({
      success: true,
      submissions: formattedSubmissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { score, feedback } = req.body;
    const instructorId = req.user.id;

    // Get attempt with quiz details and verify ownership
    const { data: attempt } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          totalMarks,
          chapters (
            courses (
              instructorId
            )
          )
        )
      `)
      .eq('id', attemptId)
      .single();

    if (!attempt || attempt.quizzes?.chapters?.courses?.instructorId !== instructorId) {
      return res.status(404).json({ message: 'Submission not found or unauthorized' });
    }

    const totalMarks = attempt.quizzes.totalMarks;
    
    // Validate score doesn't exceed total marks
    if (totalMarks > 0 && score > totalMarks) {
      return res.status(400).json({ 
        message: `Score cannot exceed total marks (${totalMarks})` 
      });
    }
    
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    // Update attempt
    const { error } = await supabase
      .from('quiz_attempts')
      .update({
        score,
        totalMarks,
        percentage,
        feedback: feedback || null,
        status: 'graded'
      })
      .eq('id', attemptId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Submission graded successfully'
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user.id;

    // Verify quiz belongs to instructor and get details with questions
    const { data: quiz } = await supabase
      .from('quizzes')
      .select(`
        *,
        chapters!quizzes_chapterId_fkey (
          courses!chapters_courseId_fkey (
            instructorId
          )
        ),
        questions (*)
      `)
      .eq('id', quizId)
      .single();

    if (!quiz || quiz.chapters?.courses?.instructorId !== instructorId) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    const questions = quiz.questions || [];

    // Map database types back to frontend types for editing
    const typeMapping = {
      'mcq': 'single_correct',
      'true_false': 'true_false',
      'short_answer': 'short_answer'
    };

    const questionsWithFrontendTypes = questions.map(q => {
      let correctAnswer = q.correctAnswer;
      if (typeof correctAnswer === 'string' && (correctAnswer.startsWith('[') || correctAnswer.startsWith('{'))) {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      
      let options = q.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch (e) {
          options = [];
        }
      }
      
      return {
        id: q.id,
        question: q.question,
        type: typeMapping[q.type] || q.type,
        options: options || [],
        correctAnswer,
        marks: q.marks,
        order: q.order
      };
    });

    res.json({
      success: true,
      quiz: {
        id: quiz.id,
        chapterId: quiz.chapterId,
        title: quiz.title,
        description: quiz.description,
        type: quiz.type,
        position: quiz.position,
        videoId: quiz.videoId,
        timeLimit: quiz.timeLimit,
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        isActive: quiz.isActive,
        order: quiz.order,
        questions: questionsWithFrontendTypes
      }
    });
  } catch (error) {
    console.error('Get quiz details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, timeLimit, passingMarks, totalMarks } = req.body;
    const instructorId = req.user.id;

    // Verify quiz belongs to instructor
    const { data: quiz } = await supabase
      .from('quizzes')
      .select(`
        *,
        chapters!quizzes_chapterId_fkey (
          courses!chapters_courseId_fkey (
            instructorId
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (!quiz || quiz.chapters?.courses?.instructorId !== instructorId) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    // Update quiz with new timestamp to trigger cache invalidation
    const { data: updatedQuiz, error } = await supabase
      .from('quizzes')
      .update({
        title,
        description,
        timeLimit: timeLimit || null,
        passingMarks: passingMarks || 60,
        totalMarks,
        updatedAt: new Date().toISOString()
      })
      .eq('id', quizId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      quiz: updatedQuiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const instructorId = req.user.id;

    // Verify question belongs to instructor
    const { data: question } = await supabase
      .from('questions')
      .select(`
        *,
        quizzes!questions_quizId_fkey (
          id,
          totalMarks,
          chapters!quizzes_chapterId_fkey (
            courses!chapters_courseId_fkey (
              instructorId
            )
          )
        )
      `)
      .eq('id', questionId)
      .single();

    if (!question || question.quizzes?.chapters?.courses?.instructorId !== instructorId) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    // Update quiz total marks and timestamp
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ 
        totalMarks: question.quizzes.totalMarks - question.marks,
        updatedAt: new Date().toISOString()
      })
      .eq('id', question.quizId);

    if (updateError) throw updateError;
    
    // Delete question
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (deleteError) throw deleteError;

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};