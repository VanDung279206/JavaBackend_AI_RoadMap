SET search_path=roadmap_analytics;
-- TODO Q01: three-table JOIN -> per-document CTE -> ranking, retain learners with no document.
CREATE OR REPLACE VIEW learner_report AS
SELECT id AS learner_id,0::bigint AS document_count,0::bigint AS total_minutes,0::bigint AS rank
FROM learners;
