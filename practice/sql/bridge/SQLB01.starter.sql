-- Complete the WHERE predicate. Use both fields from bridge_request, not constants.
CREATE TEMP VIEW bridge_filtered AS
SELECT d.id, d.created_at
FROM bridge_document d CROSS JOIN bridge_request r
WHERE FALSE; -- TODO SQLB01: matching owner AND created_at >= since_at
