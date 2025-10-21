import supabase from './src/config/supabase.js';

async function createPhase1Tables() {
  try {
    console.log('Creating Phase 1 tables...');
    
    // 1. Create quiz_questions table
    console.log('\n1. Creating quiz_questions table...');
    const { error: quizQuestionsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS quiz_questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "quizId" UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          "questionText" TEXT NOT NULL,
          "questionType" VARCHAR(20) DEFAULT 'multiple_choice',
          points INTEGER DEFAULT 1,
          "orderIndex" INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (quizQuestionsError) {
      console.error('Error creating quiz_questions:', quizQuestionsError);
    } else {
      console.log('✅ quiz_questions table created');
    }
    
    // 2. Create quiz_options table
    console.log('\n2. Creating quiz_options table...');
    const { error: quizOptionsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS quiz_options (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "questionId" UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
          "optionText" TEXT NOT NULL,
          "isCorrect" BOOLEAN DEFAULT false,
          "orderIndex" INTEGER DEFAULT 0
        );
      `
    });
    
    if (quizOptionsError) {
      console.error('Error creating quiz_options:', quizOptionsError);
    } else {
      console.log('✅ quiz_options table created');
    }
    
    // 3. Create course_reviews table
    console.log('\n3. Creating course_reviews table...');
    const { error: reviewsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS course_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          "reviewText" TEXT,
          "isPublished" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW(),
          UNIQUE("courseId", "userId")
        );
      `
    });
    
    if (reviewsError) {
      console.error('Error creating course_reviews:', reviewsError);
    } else {
      console.log('✅ course_reviews table created');
    }
    
    // 4. Create course_questions table
    console.log('\n4. Creating course_questions table...');
    const { error: courseQuestionsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS course_questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          "chapterId" UUID REFERENCES chapters(id) ON DELETE CASCADE,
          "videoId" UUID REFERENCES videos(id) ON DELETE CASCADE,
          "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          "questionText" TEXT NOT NULL,
          "isAnswered" BOOLEAN DEFAULT false,
          upvotes INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (courseQuestionsError) {
      console.error('Error creating course_questions:', courseQuestionsError);
    } else {
      console.log('✅ course_questions table created');
    }
    
    // 5. Create question_answers table
    console.log('\n5. Creating question_answers table...');
    const { error: questionAnswersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS question_answers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "questionId" UUID NOT NULL REFERENCES course_questions(id) ON DELETE CASCADE,
          "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "answerText" TEXT NOT NULL,
          "isInstructorAnswer" BOOLEAN DEFAULT false,
          "isBestAnswer" BOOLEAN DEFAULT false,
          upvotes INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (questionAnswersError) {
      console.error('Error creating question_answers:', questionAnswersError);
    } else {
      console.log('✅ question_answers table created');
    }
    
    // 6. Create certificates table
    console.log('\n6. Creating certificates table...');
    const { error: certificatesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS certificates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "certificateNumber" VARCHAR(50) UNIQUE NOT NULL,
          "issuedAt" TIMESTAMP DEFAULT NOW(),
          "certificateUrl" TEXT,
          "isValid" BOOLEAN DEFAULT true,
          "completionPercentage" INTEGER DEFAULT 100
        );
      `
    });
    
    if (certificatesError) {
      console.error('Error creating certificates:', certificatesError);
    } else {
      console.log('✅ certificates table created');
    }
    
    // 7. Add missing columns to existing tables
    console.log('\n7. Adding missing columns to existing tables...');
    
    // Add courseId to quizzes if it doesn't exist
    const { error: addCourseIdError } = await supabase.rpc('exec', {
      sql: `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE;`
    });
    
    if (addCourseIdError && !addCourseIdError.message.includes('already exists')) {
      console.error('Error adding courseId to quizzes:', addCourseIdError);
    } else {
      console.log('✅ courseId column added to quizzes');
    }
    
    console.log('\n🎉 All Phase 1 tables created successfully!');
    
  } catch (error) {
    console.error('Failed to create tables:', error);
    process.exit(1);
  }
}

createPhase1Tables();