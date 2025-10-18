import supabase from '../config/supabase.js';

const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection by trying to query users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      throw error;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📝 To create tables, run the SQL schema in Supabase dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of supabase-schema.sql');
    console.log('   4. Run the SQL script');
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
};

testConnection();