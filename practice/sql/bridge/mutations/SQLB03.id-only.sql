-- Intentionally incorrect query: the integration verifier must reject it.
CREATE TEMP VIEW bridge_page AS
SELECT d.id, d.created_at
FROM bridge_document d CROSS JOIN bridge_request r
WHERE d.owner_id=r.owner_id AND d.id<r.cursor_id
ORDER BY d.id DESC
LIMIT (SELECT page_size FROM bridge_request);
