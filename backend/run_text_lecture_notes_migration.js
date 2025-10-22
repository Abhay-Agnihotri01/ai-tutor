import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Starting text lecture notes migration...');

    // Read and execute text lecture notes table migration
    const notesTableSQL = fs.readFileSync(
      path.join(process.cwd(), 'migrations', 'create_text_lecture_notes_table.sql'),
      'utf8'
    );

    console.log('Creating text_lecture_notes table...');
    const { error: notesError } = await supabase.rpc('exec_sql', { sql: notesTableSQL });
    
    if (notesError) {
      console.error('Error creating text_lecture_notes table:', notesError);
    } else {
      console.log('✅ text_lecture_notes table created successfully');
    }

    // Read and execute text lecture bookmarks table migration
    const bookmarksTableSQL = fs.readFileSync(
      path.join(process.cwd(), 'migrations', 'create_text_lecture_bookmarks_table.sql'),
      'utf8'
    );

    console.log('Creating text_lecture_bookmarks table...');
    const { error: bookmarksError } = await supabase.rpc('exec_sql', { sql: bookmarksTableSQL });
    
    if (bookmarksError) {
      console.error('Error creating text_lecture_bookmarks table:', bookmarksError);
    } else {
      console.log('✅ text_lecture_bookmarks table created successfully');
    }

    console.log('Text lecture notes migration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();