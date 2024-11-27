CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  location TEXT,
  category VARCHAR(100)
);

ALTER TABLE posts
ADD COLUMN contact_info VARCHAR(255),
ADD COLUMN status VARCHAR(50); 

ALTER TABLE posts
DROP COLUMN category;


