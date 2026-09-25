DO $$
BEGIN
 IF (SELECT array_agg(document_count ORDER BY user_id) FROM counts) IS DISTINCT FROM ARRAY[3,1,0]::bigint[] THEN
   RAISE EXCEPTION 'P2.2: expected [3,1,0] after P2.4 commits document 104';
 END IF;
 IF (SELECT array_agg(id) FROM next_page) IS DISTINCT FROM ARRAY[101]::bigint[] THEN RAISE EXCEPTION 'P2.3: expected [101]'; END IF;
 IF EXISTS(SELECT 1 FROM document WHERE id=103) OR EXISTS(SELECT 1 FROM audit_log WHERE document_id=103) THEN RAISE EXCEPTION 'P2.4 rollback failed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM document WHERE id=104) OR NOT EXISTS(SELECT 1 FROM audit_log WHERE document_id=104) THEN RAISE EXCEPTION 'P2.4 commit failed'; END IF;
END $$;
SELECT 'PASS P2.2 P2.3 P2.4' AS result;
