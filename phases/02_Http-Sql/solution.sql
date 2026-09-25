-- Synthetic fixture. Temporary tables disappear when this connection closes.
CREATE TEMP TABLE app_user (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL
);
CREATE TEMP TABLE document (
    id BIGINT PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES app_user(id),
    title TEXT NOT NULL CHECK (title ~ '[^[:space:]]'),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE TEMP TABLE audit_log (
    document_id BIGINT NOT NULL REFERENCES document(id),
    action TEXT NOT NULL
);
INSERT INTO app_user VALUES (1, 'An'), (2, 'Bình'), (3, 'Chi');
INSERT INTO document VALUES
    (101, 1, 'Spring Basics', 'A', '2026-09-01 00:00:00+00'),
    (102, 1, 'Java Map', 'B', '2026-09-02 00:00:00+00'),
    (201, 2, 'SQL', 'C', '2026-09-03 00:00:00+00');

-- P2.2: expected counts 2, 1, 0.
SELECT u.id, u.name, COUNT(d.id) AS document_count
FROM app_user u LEFT JOIN document d ON d.owner_id = u.id
GROUP BY u.id, u.name ORDER BY u.id;

-- P2.3: expected first page 102, next page 101.
CREATE INDEX ON document (owner_id, created_at DESC, id DESC);
SELECT id, title, created_at FROM document
WHERE owner_id = 1 ORDER BY created_at DESC, id DESC LIMIT 1;
SELECT id, title, created_at FROM document
WHERE owner_id = 1
  AND (created_at, id) < (TIMESTAMPTZ '2026-09-02 00:00:00+00', 102)
ORDER BY created_at DESC, id DESC LIMIT 1;

-- P2.4: expected zero documents/audit rows for 103 after rollback.
BEGIN;
INSERT INTO document VALUES (103, 1, 'Rollback demo', 'D', CURRENT_TIMESTAMP);
INSERT INTO audit_log VALUES (103, 'CREATED');
ROLLBACK;
SELECT COUNT(*) AS count_103 FROM document WHERE id = 103;
SELECT COUNT(*) AS audit_103 FROM audit_log WHERE document_id = 103;