import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTextLectureColumn() {
  try {
    console.log('Adding textLectureId column to student_notes table...');
    
    console.log('\nRun this SQL in your Supabase SQL Editor:');
    console.log(`
-- Add textLectureId column to student_notes table
ALTER TABLE student_notes 
ADD COLUMN IF NOT EXISTS "textLectureId" UUID;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_student_notes_text_lecture_id 
ON student_notes("textLectureId");

-- Make videoId nullable since text lecture notes won't have videoId
ALTER TABLE student_notes 
ALTER COLUMN "videoId" DROP NOT NULL;
    `);

    // Test if the column exists
    try {
      const { data, error } = await supabase
        .from('student_notes')
        .select('textLectureId')
        .limit(1);
      
      if (error && error.message.includes('column "textLectureId" does not exist')) {
        console.log('\n❌ Column does not exist. Please run the SQL above.');
      } else if (error) {
        console.log('\n❌ Error:', error.message);
      } else {
        console.log('\n✅ Column already exists or was added successfully');
      }
    } catch (e) {
      console.log('\n❌ Error checking column:', e.message);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

addTextLectureColumn();