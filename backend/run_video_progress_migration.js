import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  try {
    console.log('🔥 Running video progress migration...');
    
    const sql = fs.readFileSync('./create_video_progress_table.sql', 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('✅ Success');
        }
      }
    }
    
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

runMigration();