-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "addedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("userId", "courseId")
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "addedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("userId", "courseId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart("userId");
CREATE INDEX IF NOT EXISTS idx_cart_course_id ON cart("courseId");
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist("userId");
CREATE INDEX IF NOT EXISTS idx_wishlist_course_id ON wishlist("courseId");