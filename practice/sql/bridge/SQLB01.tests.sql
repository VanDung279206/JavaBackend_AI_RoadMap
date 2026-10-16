DO $$ BEGIN
    IF ARRAY(SELECT id FROM bridge_filtered ORDER BY created_at DESC,id DESC) <> ARRAY[105,104,102]::bigint[] THEN
        RAISE EXCEPTION 'SQLB01: expected [105,104,102]; include the exact date boundary and exclude another owner';
    END IF;
    UPDATE bridge_request SET owner_id=2;
    IF ARRAY(SELECT id FROM bridge_filtered) <> ARRAY[201]::bigint[] THEN
        RAISE EXCEPTION 'SQLB01: use the requested owner, not owner 1';
    END IF;
    UPDATE bridge_request SET owner_id=3;
    IF EXISTS(SELECT 1 FROM bridge_filtered) THEN RAISE EXCEPTION 'SQLB01: empty owner must return no rows'; END IF;
    UPDATE bridge_request SET owner_id=1,since_at='2026-09-04 00:00:00+00';
    IF EXISTS(SELECT 1 FROM bridge_filtered) THEN RAISE EXCEPTION 'SQLB01: no rows after the last date'; END IF;
    INSERT INTO bridge_document VALUES(106,1,'New','2026-09-04 00:00:00+00');
    IF ARRAY(SELECT id FROM bridge_filtered) <> ARRAY[106]::bigint[] THEN
        RAISE EXCEPTION 'SQLB01: do not hardcode the sample IDs';
    END IF;
END $$;
SELECT 'PASS SQLB01' AS result;
