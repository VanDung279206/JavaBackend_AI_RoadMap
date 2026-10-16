DO $$ BEGIN
    IF ARRAY(SELECT id FROM bridge_page ORDER BY created_at DESC,id DESC) <> ARRAY[102,101]::bigint[] THEN
        RAISE EXCEPTION 'SQLB03: expected [102,101]; time-only comparison skips the tied row 102';
    END IF;
    INSERT INTO bridge_document VALUES(103,1,'Tie','2026-09-02 00:00:00+00'),(106,1,'Before cursor','2026-09-04 00:00:00+00');
    IF ARRAY(SELECT id FROM bridge_page ORDER BY created_at DESC,id DESC) <> ARRAY[103,102]::bigint[] THEN
        RAISE EXCEPTION 'SQLB03: apply descending tie-break before LIMIT; insertion before cursor must not shift the page';
    END IF;
    UPDATE bridge_request SET page_size=1;
    IF ARRAY(SELECT id FROM bridge_page) <> ARRAY[103]::bigint[] THEN
        RAISE EXCEPTION 'SQLB03: select the largest tied ID before LIMIT 1';
    END IF;
    UPDATE bridge_request SET cursor_id=102,page_size=2;
    IF ARRAY(SELECT id FROM bridge_page) <> ARRAY[101]::bigint[] THEN
        RAISE EXCEPTION 'SQLB03: exclude cursor itself and return a short last page';
    END IF;
    UPDATE bridge_request SET cursor_at='2026-09-05 00:00:00+00',cursor_id=999,page_size=1,owner_id=2;
    IF ARRAY(SELECT id FROM bridge_page) <> ARRAY[201]::bigint[] THEN
        RAISE EXCEPTION 'SQLB03: scope and limit must use the request parameters';
    END IF;
    UPDATE bridge_request SET owner_id=1;
    IF ARRAY(SELECT id FROM bridge_page) <> ARRAY[106]::bigint[] THEN
        RAISE EXCEPTION 'SQLB03: choose newest row before applying LIMIT';
    END IF;
    -- IDs can be imported/backfilled and need not increase with creation time.
    INSERT INTO bridge_document VALUES(10,1,'New low ID','2026-09-06 00:00:00+00'),(999,1,'Old high ID','2026-09-01 00:00:00+00');
    UPDATE bridge_request SET owner_id=1,cursor_at='2026-09-07 00:00:00+00',cursor_id=1,page_size=1;
    IF ARRAY(SELECT id FROM bridge_page) <> ARRAY[10]::bigint[] THEN
        RAISE EXCEPTION 'SQLB03: cursor time must take precedence over ID';
    END IF;
    IF EXISTS(SELECT 1 FROM bridge_page p JOIN bridge_document d ON d.id=p.id WHERE p.created_at IS DISTINCT FROM d.created_at) THEN
        RAISE EXCEPTION 'SQLB03: return each document timestamp unchanged';
    END IF;
    UPDATE bridge_request SET cursor_at='2026-09-02 00:00:00+00',cursor_id=104,page_size=3;
    IF ARRAY(SELECT id FROM bridge_page ORDER BY created_at DESC,id DESC) <> ARRAY[103,102,999]::bigint[] THEN
        RAISE EXCEPTION 'SQLB03: keep older high IDs and exclude newer low IDs after the cursor';
    END IF;
    IF EXISTS(SELECT 1 FROM bridge_page p JOIN bridge_document d ON d.id=p.id WHERE p.created_at IS DISTINCT FROM d.created_at) THEN
        RAISE EXCEPTION 'SQLB03: return each document timestamp unchanged';
    END IF;
    UPDATE bridge_request SET owner_id=3;
    IF EXISTS(SELECT 1 FROM bridge_page) THEN RAISE EXCEPTION 'SQLB03: empty owner must return no rows'; END IF;
    DELETE FROM bridge_document;
    IF EXISTS(SELECT 1 FROM bridge_page) THEN RAISE EXCEPTION 'SQLB03: empty dataset must return no rows'; END IF;
END $$;
SELECT 'PASS SQLB03' AS result;
