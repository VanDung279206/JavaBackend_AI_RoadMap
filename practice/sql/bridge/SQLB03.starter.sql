-- Complete owner + strict cursor predicate and stable order BEFORE LIMIT.
-- This exercise handles a next page with an existing, non-null cursor.
CREATE TEMP VIEW bridge_page AS
SELECT d.id, d.created_at
FROM bridge_document d CROSS JOIN bridge_request r
WHERE FALSE -- TODO SQLB03: owner and (created_at,id) < (cursor_at,cursor_id)
ORDER BY d.created_at DESC,d.id DESC
LIMIT (SELECT page_size FROM bridge_request);
