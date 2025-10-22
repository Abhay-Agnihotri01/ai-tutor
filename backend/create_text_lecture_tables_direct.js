import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    console.log('Creating text lecture notes and bookmarks tables...');

    // Create text_lecture_notes table
    const { error: notesError } = await supabase
      .from('text_lecture_notes')
      .select('id')
      .limit(1);

    if (notesError && notesError.code === 'PGRST116') {
      console.log('text_lecture_notes table does not exist, it needs to be created manually in Supabase SQL editor');
      console.log('\nSQL for text_lecture_notes table:');
      console.log(`
CREATE TABLE text_lecture_notes (
    id SERIAL PRIMARY KEY,
    "textLectureId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_text_lecture_notes_text_lecture_id ON text_lecture_notes("textLectureId");
CREATE INDEX idx_text_lecture_notes_user_id ON text_lecture_notes("userId");
CREATE INDEX idx_text_lecture_notes_course_id ON text_lecture_notes("courseId");
      `);
    } else {
      console.log('✅ text_lecture_notes table exists');
    }

    // Create text_lecture_bookmarks table
    const { error: bookmarksError } = await supabase
      .from('text_lecture_bookmarks')
      .select('id')
      .limit(1);

    if (bookmarksError && bookmarksError.code === 'PGRST116') {
      console.log('\ntext_lecture_bookmarks table does not exist, it needs to be created manually in Supabase SQL editor');
      console.log('\nSQL for text_lecture_bookmarks table:');
      console.log(`
CREATE TABLE text_lecture_bookmarks (
    id SERIAL PRIMARY KEY,
    "textLectureId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_text_lecture_bookmarks_text_lecture_id ON text_lecture_bookmarks("textLectureId");
CREATE INDEX idx_text_lecture_bookmarks_user_id ON text_lecture_bookmarks("userId");
CREATE INDEX idx_text_lecture_bookmarks_course_id ON text_lecture_bookmarks("courseId");
      `);
    } else {
      console.log('✅ text_lecture_bookmarks table exists');
    }

    console.log('\nPlease run the above SQL commands in your Supabase SQL editor to create the tables.');

  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();