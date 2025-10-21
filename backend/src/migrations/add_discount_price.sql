-- Add discountPrice column to courses table
ALTER TABLE courses ADD COLUMN "discountPrice" DECIMAL(10,2) DEFAULT NULL;