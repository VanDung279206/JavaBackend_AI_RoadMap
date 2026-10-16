-- A V7-accepted payload can exceed the browser's UTF-16 limit. Keep this
-- legacy row to verify the forward migration and dump/restore preserve it.
BEGIN;
INSERT INTO auth.users(id) VALUES('00000000-0000-0000-0000-000000000031');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000031',true);
DO $$ DECLARE payload jsonb; result public.project_drafts; BEGIN
 SELECT jsonb_object_agg(field,'""'::jsonb) || '{"ragMode":"lab","outline":"","previousOutline":"","checklist":[false,false,false,false,false,false]}'::jsonb
 INTO payload FROM unnest(ARRAY['name','audience','problem','objective','feature1','feature2','feature3','difference','later','stories','data','rules','api','errors','java','sql','spring','quality','ai','rag','repository','tests','run','demo','decisions']) AS field;
 payload:=jsonb_set(payload,'{name}',to_jsonb(repeat(chr(128512),25001)));
 result:=public.save_project_draft(auth.uid(),0,payload);
 IF result.revision<>1 OR char_length(result.content->>'name')<>25001 THEN RAISE EXCEPTION 'V7 legacy Unicode fixture missing'; END IF;
END $$;
COMMIT;
