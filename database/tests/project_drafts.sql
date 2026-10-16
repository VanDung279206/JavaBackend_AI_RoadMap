-- Real PostgreSQL grants, RLS, validation and optimistic revisions; no persistent fixtures.
BEGIN;
INSERT INTO auth.users(id) VALUES('00000000-0000-0000-0000-000000000011'),('00000000-0000-0000-0000-000000000012');
CREATE TEMP TABLE project_fixture(content jsonb);
INSERT INTO project_fixture SELECT jsonb_object_agg(field,'""'::jsonb) || '{"ragMode":"lab","outline":"","previousOutline":"","checklist":[false,false,false,false,false,false]}'::jsonb
 FROM unnest(ARRAY['name','audience','problem','objective','feature1','feature2','feature3','difference','later','stories','data','rules','api','errors','java','sql','spring','quality','ai','rag','repository','tests','run','demo','decisions']) AS field;
GRANT SELECT ON project_fixture TO authenticated;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000011',true);
DO $$ DECLARE payload jsonb; result public.project_drafts; invalid jsonb; BEGIN
 SELECT content INTO payload FROM project_fixture;
 result:=public.save_project_draft(auth.uid(),0,payload || '{"name":"My project"}');
 IF result.revision<>1 OR result.content->>'name'<>'My project' THEN RAISE EXCEPTION 'first save failed'; END IF;
 BEGIN PERFORM public.save_project_draft(auth.uid(),0,payload);RAISE EXCEPTION 'stale create accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'PROJECT_CONFLICT' THEN RAISE; END IF; END;
 result:=public.save_project_draft(auth.uid(),1,payload || '{"name":"Updated"}');
 IF result.revision<>2 OR result.content->>'name'<>'Updated' THEN RAISE EXCEPTION 'update failed'; END IF;
 BEGIN PERFORM public.save_project_draft(auth.uid(),1,payload);RAISE EXCEPTION 'stale update accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'PROJECT_CONFLICT' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_project_draft('00000000-0000-0000-0000-000000000012',0,payload);RAISE EXCEPTION 'wrong owner accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'ACCOUNT_CHANGED' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_project_draft(NULL,2,payload);RAISE EXCEPTION 'null owner accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'ACCOUNT_CHANGED' THEN RAISE; END IF; END;
 FOREACH invalid IN ARRAY ARRAY['null'::jsonb,'[]'::jsonb,'{}'::jsonb,payload-'name',payload||'{"verified":true}',payload||'{"ragMode":"invalid"}',payload||'{"checklist":[true]}',payload||'{"checklist":[false,false,false,false,false,"yes"]}',jsonb_set(payload,'{name}',to_jsonb(repeat('x',50001))),jsonb_set(payload,'{name}',to_jsonb(repeat(chr(128512),25001))),jsonb_set(payload,'{outline}',to_jsonb(repeat('x',1710001))),jsonb_set(payload,'{outline}',to_jsonb(repeat(chr(128512),855001))),jsonb_set(payload,'{previousOutline}',to_jsonb(repeat(chr(128512),855001)))] LOOP
  BEGIN PERFORM public.save_project_draft(auth.uid(),2,invalid);RAISE EXCEPTION 'invalid project accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'INVALID_PROJECT' THEN RAISE; END IF; END;
 END LOOP;
 BEGIN PERFORM public.save_project_draft(auth.uid(),NULL,payload);RAISE EXCEPTION 'null revision accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'INVALID_REVISION' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_project_draft(auth.uid(),-1,payload);RAISE EXCEPTION 'negative revision accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'INVALID_REVISION' THEN RAISE; END IF; END;
 BEGIN UPDATE public.project_drafts SET revision=99 WHERE user_id=auth.uid();RAISE EXCEPTION 'direct update allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.project_drafts(user_id,content,revision) VALUES(auth.uid(),payload,1);RAISE EXCEPTION 'direct insert allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN DELETE FROM public.project_drafts WHERE user_id=auth.uid();RAISE EXCEPTION 'direct delete allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000012',true);
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.project_drafts) THEN RAISE EXCEPTION 'cross-account project read'; END IF; END $$;
SELECT public.save_project_draft(auth.uid(),0,(SELECT jsonb_set(content,'{name}',to_jsonb(repeat(chr(128512),25000))) FROM project_fixture));
SELECT set_config('request.jwt.claim.sub','',true);
DO $$ BEGIN
 BEGIN PERFORM public.save_project_draft(NULL,0,(SELECT content FROM project_fixture));RAISE EXCEPTION 'unauthenticated save accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'AUTH_REQUIRED' THEN RAISE; END IF; END;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM * FROM public.project_drafts;RAISE EXCEPTION 'anonymous read allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.save_project_draft(NULL,0,'{}');RAISE EXCEPTION 'anonymous RPC allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.project_drafts WHERE user_id IN ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012'))<>2 THEN RAISE EXCEPTION 'project rows lost'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.project_drafts WHERE user_id='00000000-0000-0000-0000-000000000011' AND revision=2 AND content->>'name'='Updated') THEN RAISE EXCEPTION 'rejected request changed project'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS project drafts: owner, grants, stale revisions, payload validation and preserved data';
