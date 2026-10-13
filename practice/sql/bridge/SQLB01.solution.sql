CREATE TEMP VIEW bridge_filtered AS
SELECT d.id, d.created_at
FROM bridge_document d CROSS JOIN bridge_request r
WHERE d.owner_id = r.owner_id AND d.created_at >= r.since_at;
