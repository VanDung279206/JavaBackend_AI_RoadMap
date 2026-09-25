-- P2.2: create TEMP VIEW counts(user_id,document_count).
-- TODO: include the user who has zero documents; use COUNT(d.id).
CREATE TEMP VIEW counts AS SELECT id AS user_id, -1::bigint AS document_count FROM app_user;
-- P2.3: create TEMP VIEW next_page(id) for owner 1, after (2026-09-02+00,102), size=1.
CREATE TEMP VIEW next_page AS SELECT id FROM document WHERE FALSE;
-- P2.4: create document 103 and matching audit record, then ROLLBACK.
-- Also prove COMMIT by creating document 104 and matching audit record.
-- TODO: write both transactions; tests check both branches.
