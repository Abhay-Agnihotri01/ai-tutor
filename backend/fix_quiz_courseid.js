import supabase from './src/config/supabase.js';

async function fixQuizCourseId() {
  try {
    console.log('🔧 Fixing quiz courseId...');
    
    // Get all quizzes with null courseId
    const { data: quizzes, error: fetchError } = await supabase
      .from('quizzes')
      .select(`
        id, 
        chapterId,
        courseId,
        chapters!inner (
          courseId
        )
      `)
      .is('courseId', null);
    
    if (fetchError) {
      console.error('Error fetching quizzes:', fetchError);
      return;
    }
    
    console.log(`Found ${quizzes?.length || 0} quizzes with null courseId`);
    
    // Update each quiz with the correct courseId from its chapter
    for (const quiz of quizzes || []) {
      const correctCourseId = quiz.chapters.courseId;
      
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({ courseId: correctCourseId })
        .eq('id', quiz.id);
      
      if (updateError) {
        console.error(`Error updating quiz ${quiz.id}:`, updateError);
      } else {
        console.log(`✅ Updated quiz ${quiz.id} with courseId: ${correctCourseId}`);
      }
    }
    
    console.log('🎉 Quiz courseId fix completed!');
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
}

fixQuizCourseId();