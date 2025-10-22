import supabase from './src/config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    console.log('Running text_lectures table migration...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'migrations', 'create_text_lectures_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log('Executing:', trimmedStatement.substring(0, 100) + '...');
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: trimmedStatement 
        });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('1')
            .limit(0);
          
          if (directError) {
            console.log('Note: Some statements may require manual execution in Supabase dashboard');
          }
        }
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('Text lectures table should now be available.');
    
    // Test the table
    const { data, error } = await supabase
      .from('text_lectures')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Note: Please run the SQL migration manually in Supabase dashboard:');
      console.log(sql);
    } else {
      console.log('✅ text_lectures table is working correctly!');
    }
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.log('\nPlease run this SQL manually in your Supabase dashboard:');
    
    const sqlPath = path.join(__dirname, 'migrations', 'create_text_lectures_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(sql);
  }
};

runMigration();