-- Intentionally incorrect query: the integration verifier must reject it.
CREATE TEMP VIEW bridge_page AS
SELECT d.id, d.created_at + INTERVAL '1 day' AS created_at
FROM bridge_document d CROSS JOIN bridge_request r
WHERE d.owner_id=r.owner_id AND (d.created_at,d.id)<(r.cursor_at,r.cursor_id)
ORDER BY d.created_at DESC,d.id DESC
LIMIT (SELECT page_size FROM bridge_request);
