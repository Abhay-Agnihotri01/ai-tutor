import User from './User.js';
import Course from './Course.js';
import Enrollment from './Enrollment.js';
import Chapter from './Chapter.js';
import Video from './Video.js';
import Rating from './Rating.js';
import Resource from './Resource.js';
import Quiz from './Quiz.js';
import Question from './Question.js';
import QuizAttempt from './QuizAttempt.js';
import QuestionResponse from './QuestionResponse.js';

// Define associations
User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'Course' });

Course.hasMany(Chapter, { foreignKey: 'courseId', as: 'chapters' });
Chapter.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Chapter.hasMany(Video, { foreignKey: 'chapterId', as: 'videos' });
Video.belongsTo(Chapter, { foreignKey: 'chapterId', as: 'chapter' });

Chapter.hasMany(Resource, { foreignKey: 'chapterId', as: 'resources' });
Resource.belongsTo(Chapter, { foreignKey: 'chapterId', as: 'chapter' });

// Rating associations
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Course.hasMany(Rating, { foreignKey: 'courseId', as: 'ratings' });
Rating.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Quiz associations
Chapter.hasMany(Quiz, { foreignKey: 'chapterId', as: 'quizzes' });
Quiz.belongsTo(Chapter, { foreignKey: 'chapterId', as: 'chapter' });

Video.hasMany(Quiz, { foreignKey: 'videoId', as: 'quizzes' });
Quiz.belongsTo(Video, { foreignKey: 'videoId', as: 'video' });

Quiz.hasMany(Question, { foreignKey: 'quizId', as: 'questions' });
Question.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

User.hasMany(QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

QuizAttempt.hasMany(QuestionResponse, { foreignKey: 'attemptId', as: 'responses' });
QuestionResponse.belongsTo(QuizAttempt, { foreignKey: 'attemptId', as: 'attempt' });

Question.hasMany(QuestionResponse, { foreignKey: 'questionId', as: 'responses' });
QuestionResponse.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

export { User, Course, Enrollment, Chapter, Video, Rating, Resource, Quiz, Question, QuizAttempt, QuestionResponse };