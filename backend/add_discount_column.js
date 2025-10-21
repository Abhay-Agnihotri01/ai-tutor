import supabase from './src/config/supabase.js';

const addDiscountColumn = async () => {
  try {
    // Add discountPrice column to courses table
    const { error } = await supabase
      .from('courses')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return;
    }

    console.log('Please run this SQL command in your Supabase SQL editor:');
    console.log('ALTER TABLE courses ADD COLUMN "discountPrice" DECIMAL(10,2) DEFAULT NULL;');
    console.log('Then restart the server.');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

addDiscountColumn();