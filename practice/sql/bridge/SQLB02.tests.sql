DO $$ BEGIN
    IF ARRAY(SELECT user_id FROM bridge_counts ORDER BY user_id) <> ARRAY[1,2,3]::bigint[]
        OR ARRAY(SELECT document_count FROM bridge_counts ORDER BY user_id) <> ARRAY[4,1,0]::bigint[] THEN
        RAISE EXCEPTION 'SQLB02: expected users [1,2,3], counts [4,1,0]; COUNT(*) counts the null placeholder';
    END IF;
    INSERT INTO bridge_user VALUES(4,'Dung');
    INSERT INTO bridge_document VALUES(301,3,'First','2026-09-04 00:00:00+00');
    IF ARRAY(SELECT user_id FROM bridge_counts ORDER BY user_id) <> ARRAY[1,2,3,4]::bigint[]
        OR ARRAY(SELECT document_count FROM bridge_counts ORDER BY user_id) <> ARRAY[4,1,1,0]::bigint[] THEN
        RAISE EXCEPTION 'SQLB02: counts must update for new users and documents';
    END IF;
    DELETE FROM bridge_document;
    IF (SELECT count(*) FROM bridge_counts) <> 4
        OR EXISTS(SELECT 1 FROM bridge_counts WHERE document_count IS DISTINCT FROM 0) THEN
        RAISE EXCEPTION 'SQLB02: an empty document table must retain all users with count 0';
    END IF;
END $$;
SELECT 'PASS SQLB02' AS result;
