-- Check existing table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Check existing table structure for other tables
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name IN ('users', 'chapters', 'videos', 'enrollments')
ORDER BY table_name, ordinal_position;