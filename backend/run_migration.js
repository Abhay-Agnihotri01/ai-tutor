import supabase from './src/config/supabase.js';
import fs from 'fs';

async function runMigration() {
  try {
    console.log('Starting Phase 1 migration...');
    
    // Read the migration file
    const sql = fs.readFileSync('phase1_supabase_migration.sql', 'utf8');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
          console.log(statement.substring(0, 100) + '...');
          
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (error) {
            console.error('❌ Error:', error.message);
            if (error.message.includes('already exists')) {
              console.log('⚠️  Table/column already exists, continuing...');
            } else {
              throw error;
            }
          } else {
            console.log('✅ Success');
          }
        } catch (err) {
          console.error('❌ Failed:', err.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();