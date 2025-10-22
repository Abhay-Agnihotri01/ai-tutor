import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesDirectly() {
  try {
    console.log('Creating tables directly...');

    // Create text_lecture_notes table using raw SQL
    const notesTableSQL = `
      DROP TABLE IF EXISTS text_lecture_notes CASCADE;
      
      CREATE TABLE text_lecture_notes (
          id SERIAL PRIMARY KEY,
          "textLectureId" UUID NOT NULL,
          "courseId" UUID NOT NULL,
          "userId" UUID NOT NULL,
          content TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'text',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_text_lecture_notes_text_lecture_id ON text_lecture_notes("textLectureId");
      CREATE INDEX idx_text_lecture_notes_user_id ON text_lecture_notes("userId");
      CREATE INDEX idx_text_lecture_notes_course_id ON text_lecture_notes("courseId");
    `;

    // Create bookmarks table
    const bookmarksTableSQL = `
      DROP TABLE IF EXISTS text_lecture_bookmarks CASCADE;
      
      CREATE TABLE text_lecture_bookmarks (
          id SERIAL PRIMARY KEY,
          "textLectureId" UUID NOT NULL,
          "courseId" UUID NOT NULL,
          "userId" UUID NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_text_lecture_bookmarks_text_lecture_id ON text_lecture_bookmarks("textLectureId");
      CREATE INDEX idx_text_lecture_bookmarks_user_id ON text_lecture_bookmarks("userId");
      CREATE INDEX idx_text_lecture_bookmarks_course_id ON text_lecture_bookmarks("courseId");
    `;

    console.log('SQL to run in Supabase SQL Editor:');
    console.log('\n--- NOTES TABLE ---');
    console.log(notesTableSQL);
    console.log('\n--- BOOKMARKS TABLE ---');
    console.log(bookmarksTableSQL);

    // Test if we can create a simple table
    try {
      const { error } = await supabase
        .from('text_lecture_notes')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log('\n❌ Tables do not exist. Please run the SQL above in Supabase SQL Editor.');
      } else if (error) {
        console.log('\n❌ Table exists but has issues:', error.message);
      } else {
        console.log('\n✅ Tables exist and are accessible');
      }
    } catch (e) {
      console.log('\n❌ Error checking tables:', e.message);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createTablesDirectly();