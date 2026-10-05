-- Dedicated practice schema, not an application database.
DROP SCHEMA IF EXISTS roadmap_analytics CASCADE;
CREATE SCHEMA roadmap_analytics;
SET search_path=roadmap_analytics;
CREATE TABLE learners(id integer PRIMARY KEY,name text NOT NULL);
CREATE TABLE documents(id integer PRIMARY KEY,owner_id integer REFERENCES learners,title text NOT NULL);
CREATE TABLE reads(document_id integer REFERENCES documents,minutes integer CHECK(minutes>=0));
INSERT INTO learners VALUES(1,'An'),(2,'Binh'),(3,'Chi');
INSERT INTO documents VALUES(10,1,'Java'),(11,1,'SQL'),(12,2,'Spring');
INSERT INTO reads VALUES(10,20),(10,10),(11,30),(12,15);
-- Scale fixture for EXPLAIN; these rows belong to a separate benchmark table.
CREATE TABLE events AS SELECT n AS id,(n%100)::integer AS owner_id,('2026-01-01'::date+n%300) AS day FROM generate_series(1,100000) n;
ANALYZE events;
