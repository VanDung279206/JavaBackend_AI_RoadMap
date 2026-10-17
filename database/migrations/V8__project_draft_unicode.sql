-- Forward-only fix for the browser's UTF-16 length limits. No legacy rows
-- are rewritten or deleted. Keep the V7 CHECK valid for dump/restore, and
-- tighten the only browser write path (RPC) for new/replacement content.
BEGIN;
CREATE FUNCTION public.valid_project_draft_v2(value jsonb) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,public,pg_temp AS $$
DECLARE field text;
BEGIN
 IF NOT public.valid_project_draft(value) THEN RETURN false; END IF;
 FOREACH field IN ARRAY ARRAY['name','audience','problem','objective','feature1','feature2','feature3','difference','later','stories','data','rules','api','errors','java','sql','spring','quality','ai','rag','repository','tests','run','demo','decisions'] LOOP
  IF char_length(regexp_replace((value->>field) COLLATE "C", U&'[\+010000-\+10FFFF]', 'xx', 'g'))>50000 THEN RETURN false; END IF;
 END LOOP;
 FOREACH field IN ARRAY ARRAY['outline','previousOutline'] LOOP
  IF char_length(regexp_replace((value->>field) COLLATE "C", U&'[\+010000-\+10FFFF]', 'xx', 'g'))>1710000 THEN RETURN false; END IF;
 END LOOP;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.valid_project_draft_v2(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.valid_project_draft_v2(jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.save_project_draft(p_owner uuid,p_revision bigint,p_content jsonb)
RETURNS public.project_drafts LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,pg_temp AS $$
DECLARE result public.project_drafts;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
 IF p_owner IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'ACCOUNT_CHANGED'; END IF;
 IF p_revision IS NULL OR p_revision<0 OR p_revision>=9007199254740991 THEN RAISE EXCEPTION 'INVALID_REVISION'; END IF;
 IF NOT public.valid_project_draft_v2(p_content) THEN RAISE EXCEPTION 'INVALID_PROJECT'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('project-draft:' || auth.uid()::text,0));
 SELECT * INTO result FROM public.project_drafts WHERE user_id=auth.uid() FOR UPDATE;
 IF COALESCE(result.revision,0)<>p_revision THEN RAISE EXCEPTION 'PROJECT_CONFLICT'; END IF;
 INSERT INTO public.project_drafts(user_id,content,revision) VALUES(auth.uid(),p_content,1)
 ON CONFLICT(user_id) DO UPDATE SET content=EXCLUDED.content,revision=project_drafts.revision+1,updated_at=now()
 RETURNING * INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.save_project_draft(uuid,bigint,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_project_draft(uuid,bigint,jsonb) TO authenticated;
COMMIT;
