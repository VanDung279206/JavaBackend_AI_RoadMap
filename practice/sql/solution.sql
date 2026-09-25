CREATE TEMP VIEW counts AS SELECT u.id AS user_id,COUNT(d.id) AS document_count
FROM app_user u LEFT JOIN document d ON d.owner_id=u.id GROUP BY u.id;
CREATE INDEX ON document(owner_id,created_at DESC,id DESC);
CREATE TEMP VIEW next_page AS SELECT id FROM document WHERE owner_id=1
AND (created_at,id)<(TIMESTAMPTZ '2026-09-02 00:00:00+00',102) ORDER BY created_at DESC,id DESC LIMIT 1;
BEGIN;
INSERT INTO document VALUES(103,1,'Rollback','2026-09-04 00:00:00+00');
INSERT INTO audit_log VALUES(103,'CREATED');
ROLLBACK;
BEGIN;
INSERT INTO document VALUES(104,1,'Commit','2026-09-04 00:00:00+00');
INSERT INTO audit_log VALUES(104,'CREATED');
COMMIT;
