-- Keep every user, including Chi. Replace -1 and the missing join/grouping.
CREATE TEMP VIEW bridge_counts AS
SELECT u.id AS user_id, -1::bigint AS document_count
FROM bridge_user u; -- TODO SQLB02: LEFT JOIN documents and COUNT(d.id)
