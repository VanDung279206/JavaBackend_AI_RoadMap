BEGIN;
DO $$ DECLARE payload jsonb; BEGIN
 SELECT content INTO payload FROM public.project_drafts WHERE user_id='00000000-0000-0000-0000-000000000031' AND revision=1;
 IF payload IS NULL OR char_length(payload->>'name')<>25001 THEN RAISE EXCEPTION 'V8 discarded legacy Unicode data'; END IF;
 IF public.valid_project_draft_v2(payload) THEN RAISE EXCEPTION 'V8 accepts more than 50000 UTF-16 units'; END IF;
 IF NOT public.valid_project_draft(payload) THEN RAISE EXCEPTION 'V7 constraint no longer permits restoring legacy data'; END IF;
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000031',true);
DO $$ DECLARE payload jsonb; BEGIN
 SELECT content INTO payload FROM public.project_drafts WHERE user_id=auth.uid();
 BEGIN PERFORM public.save_project_draft(auth.uid(),1,payload);RAISE EXCEPTION 'legacy over-limit replacement accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'INVALID_PROJECT' THEN RAISE; END IF; END;
END $$;
ROLLBACK;
SELECT 'PASS legacy Unicode: V7 bytes preserved, V8 rejects new over-limit writes';
