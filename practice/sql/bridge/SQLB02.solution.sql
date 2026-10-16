CREATE TEMP VIEW bridge_counts AS
SELECT u.id AS user_id, COUNT(d.id) AS document_count
FROM bridge_user u LEFT JOIN bridge_document d ON d.owner_id=u.id
GROUP BY u.id;
