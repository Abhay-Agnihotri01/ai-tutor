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

async function fixTables() {
  try {
    console.log('Fixing text lecture tables...');

    // Drop existing tables
    console.log('Dropping existing tables...');
    
    // Try to drop tables (ignore errors if they don't exist)
    await supabase.from('text_lecture_notes').delete().neq('id', 0);
    await supabase.from('text_lecture_bookmarks').delete().neq('id', 0);

    console.log('Tables cleared. Please run these SQL commands in your Supabase SQL editor:');
    
    console.log('\n1. Drop and recreate text_lecture_notes table:');
    console.log(`
DROP TABLE IF EXISTS text_lecture_notes;

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
    `);

    console.log('\n2. Drop and recreate text_lecture_bookmarks table:');
    console.log(`
DROP TABLE IF EXISTS text_lecture_bookmarks;

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
    `);

    console.log('\nAfter running these SQL commands, try saving a note again.');

  } catch (error) {
    console.error('Error:', error);
  }
}

fixTables();