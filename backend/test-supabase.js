import supabase from './src/config/supabase.js';

const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('Ready to create tables.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();