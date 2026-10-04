SET search_path=roadmap_analytics;
DO $$ BEGIN
 IF EXISTS((SELECT * FROM learner_report EXCEPT VALUES(1,2::bigint,60::bigint,1::bigint),(2,1,15,2),(3,0,0,3))
 UNION ALL (VALUES(1,2::bigint,60::bigint,1::bigint),(2,1,15,2),(3,0,0,3) EXCEPT SELECT * FROM learner_report))
 THEN RAISE EXCEPTION 'FAIL Q01 expected (1,2,60,1),(2,1,15,2),(3,0,0,3)'; END IF;
 INSERT INTO reads VALUES(12,45);
 IF (SELECT rank FROM learner_report WHERE learner_id=2)<>1 THEN RAISE EXCEPTION 'FAIL tie must use dense_rank'; END IF;
 DELETE FROM reads WHERE document_id=12 AND minutes=45;
END $$;
SELECT 'PASS Q01 seeded JOIN/CTE/window, empty owner and ties';
