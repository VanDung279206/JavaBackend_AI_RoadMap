SET search_path=roadmap_analytics;
CREATE OR REPLACE VIEW learner_report AS
WITH per_document AS (
 SELECT d.owner_id,d.id,COALESCE(sum(r.minutes),0)::bigint AS minutes
 FROM documents d LEFT JOIN reads r ON r.document_id=d.id GROUP BY d.owner_id,d.id
), totals AS (
 SELECT l.id AS learner_id,count(d.id) AS document_count,COALESCE(sum(d.minutes),0)::bigint AS total_minutes
 FROM learners l LEFT JOIN per_document d ON d.owner_id=l.id GROUP BY l.id
)
SELECT *,dense_rank() OVER(ORDER BY total_minutes DESC) AS rank FROM totals;
