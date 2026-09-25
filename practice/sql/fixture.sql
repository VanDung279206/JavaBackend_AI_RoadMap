-- Temporary tables: run fixture, your solution and checks in ONE psql session.
CREATE TEMP TABLE app_user(id BIGINT PRIMARY KEY,name TEXT NOT NULL);
CREATE TEMP TABLE document(id BIGINT PRIMARY KEY,owner_id BIGINT NOT NULL REFERENCES app_user(id),title TEXT NOT NULL CHECK(title ~ '[^[:space:]]'),created_at TIMESTAMPTZ NOT NULL);
CREATE TEMP TABLE audit_log(document_id BIGINT REFERENCES document(id),action TEXT NOT NULL);
INSERT INTO app_user VALUES(1,'An'),(2,'Bình'),(3,'Chi');
INSERT INTO document VALUES(101,1,'Java','2026-09-01 00:00:00+00'),(102,1,'SQL','2026-09-02 00:00:00+00'),(201,2,'AI','2026-09-03 00:00:00+00');
