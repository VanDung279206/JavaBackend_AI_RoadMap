CREATE TABLE users(
 id SERIAL PRIMARY KEY,
 username VARCHAR(100),
 email VARCHAR(150)
);

CREATE TABLE progress(
 id SERIAL PRIMARY KEY,
 user_id INT,
 phase VARCHAR(100),
 percentage INT
);