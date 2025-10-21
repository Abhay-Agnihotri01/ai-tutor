import supabase from './src/config/supabase.js';

async function testAndCreateTables() {
  try {
    console.log('Testing Phase 1 table creation...');
    
    // Test 1: Check if quiz_questions table exists
    console.log('\n1. Testing quiz_questions table...');
    const { data: quizQuestionsTest, error: quizQuestionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(1);
    
    if (quizQuestionsError) {
      console.log('❌ quiz_questions table does not exist');
      console.log('Error:', quizQuestionsError.message);
      
      // Try to create it
      console.log('Creating quiz_questions table...');
      // We'll need to use raw SQL through a different approach
    } else {
      console.log('✅ quiz_questions table exists');
    }
    
    // Test 2: Check if course_reviews table exists
    console.log('\n2. Testing course_reviews table...');
    const { data: reviewsTest, error: reviewsError } = await supabase
      .from('course_reviews')
      .select('*')
      .limit(1);
    
    if (reviewsError) {
      console.log('❌ course_reviews table does not exist');
      console.log('Error:', reviewsError.message);
    } else {
      console.log('✅ course_reviews table exists');
    }
    
    // Test 3: Check if course_questions table exists
    console.log('\n3. Testing course_questions table...');
    const { data: courseQuestionsTest, error: courseQuestionsError } = await supabase
      .from('course_questions')
      .select('*')
      .limit(1);
    
    if (courseQuestionsError) {
      console.log('❌ course_questions table does not exist');
      console.log('Error:', courseQuestionsError.message);
    } else {
      console.log('✅ course_questions table exists');
    }
    
    // Test 4: Check if certificates table exists
    console.log('\n4. Testing certificates table...');
    const { data: certificatesTest, error: certificatesError } = await supabase
      .from('certificates')
      .select('*')
      .limit(1);
    
    if (certificatesError) {
      console.log('❌ certificates table does not exist');
      console.log('Error:', certificatesError.message);
    } else {
      console.log('✅ certificates table exists');
    }
    
    // Test 5: Check existing quizzes table structure
    console.log('\n5. Testing existing quizzes table...');
    const { data: quizzesTest, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(1);
    
    if (quizzesError) {
      console.log('❌ quizzes table error:', quizzesError.message);
    } else {
      console.log('✅ quizzes table exists');
      console.log('Sample data:', quizzesTest);
    }
    
    console.log('\n📋 Table existence check completed');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAndCreateTables();