-- Create Quiz tables manually to avoid Sequelize sync issues

-- Create Quizzes table
CREATE TABLE IF NOT EXISTS `Quizzes` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `chapterId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `type` ENUM('quiz', 'assignment') NOT NULL DEFAULT 'quiz',
  `position` ENUM('after_video', 'end_of_chapter') NOT NULL DEFAULT 'end_of_chapter',
  `videoId` VARCHAR(36),
  `timeLimit` INT,
  `totalMarks` INT DEFAULT 0,
  `passingMarks` INT DEFAULT 0,
  `isActive` BOOLEAN DEFAULT TRUE,
  `order` INT NOT NULL DEFAULT 1,
  `version` INT DEFAULT 1,
  `lastUpdated` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_chapter_id` (`chapterId`),
  INDEX `idx_video_id` (`videoId`)
);

-- Create Questions table
CREATE TABLE IF NOT EXISTS `Questions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `quizId` VARCHAR(36) NOT NULL,
  `question` TEXT NOT NULL,
  `type` ENUM('mcq', 'true_false', 'short_answer') NOT NULL DEFAULT 'mcq',
  `options` JSON,
  `correctAnswer` TEXT,
  `marks` INT DEFAULT 1,
  `order` INT NOT NULL DEFAULT 1,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_quiz_id` (`quizId`)
);

-- Create QuizAttempts table
CREATE TABLE IF NOT EXISTS `QuizAttempts` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `quizId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `score` INT DEFAULT 0,
  `totalMarks` INT DEFAULT 0,
  `percentage` DECIMAL(5,2) DEFAULT 0,
  `status` ENUM('in_progress', 'completed', 'graded') DEFAULT 'in_progress',
  `fileUrl` VARCHAR(500),
  `feedback` TEXT,
  `submittedAt` DATETIME,
  `gradedAt` DATETIME,
  `quizVersion` INT DEFAULT 1,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_quiz_user` (`quizId`, `userId`),
  INDEX `idx_user_id` (`userId`)
);

-- Create QuestionResponses table
CREATE TABLE IF NOT EXISTS `QuestionResponses` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  `attemptId` VARCHAR(36) NOT NULL,
  `questionId` VARCHAR(36) NOT NULL,
  `answer` TEXT,
  `isCorrect` BOOLEAN DEFAULT FALSE,
  `marksAwarded` INT DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_attempt_id` (`attemptId`),
  INDEX `idx_question_id` (`questionId`)
);