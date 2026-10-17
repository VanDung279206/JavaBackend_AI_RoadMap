-- Additive migration after V6. Existing device drafts are migrated lazily by
-- the client, never by a database backfill. See docs/PROJECT_SYNC.md for rollback.
BEGIN;
CREATE FUNCTION public.valid_project_draft(value jsonb) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,pg_temp AS $$
DECLARE field text;
BEGIN
 IF value IS NULL OR jsonb_typeof(value) IS DISTINCT FROM 'object' THEN RETURN false; END IF;
 IF octet_length(value::text) > 33554432 THEN RETURN false; END IF;
 IF (SELECT count(*) FROM jsonb_object_keys(value)) <> 29 THEN RETURN false; END IF;
 FOREACH field IN ARRAY ARRAY['name','audience','problem','objective','feature1','feature2','feature3','difference','later','stories','data','rules','api','errors','java','sql','spring','quality','ai','rag','repository','tests','run','demo','decisions'] LOOP
  IF jsonb_typeof(value->field) IS DISTINCT FROM 'string' OR char_length(value->>field)>50000 THEN RETURN false; END IF;
 END LOOP;
 FOREACH field IN ARRAY ARRAY['outline','previousOutline'] LOOP
  IF jsonb_typeof(value->field) IS DISTINCT FROM 'string' OR char_length(value->>field)>1710000 THEN RETURN false; END IF;
 END LOOP;
 IF jsonb_typeof(value->'ragMode') IS DISTINCT FROM 'string' OR value->>'ragMode' NOT IN ('lab','project') THEN RETURN false; END IF;
 IF jsonb_typeof(value->'checklist') IS DISTINCT FROM 'array' THEN RETURN false; END IF;
 IF jsonb_array_length(value->'checklist')<>6 THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(value->'checklist') AS entries(item) WHERE jsonb_typeof(item) IS DISTINCT FROM 'boolean') THEN RETURN false; END IF;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.valid_project_draft(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.valid_project_draft(jsonb) TO service_role;

CREATE TABLE public.project_drafts (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 content jsonb NOT NULL CHECK(public.valid_project_draft(content)),
 revision bigint NOT NULL CHECK(revision BETWEEN 1 AND 9007199254740991),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_drafts_own_read ON public.project_drafts FOR SELECT TO authenticated USING(user_id=auth.uid());
REVOKE ALL ON public.project_drafts FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.project_drafts TO authenticated;
GRANT ALL ON public.project_drafts TO service_role;

CREATE FUNCTION public.save_project_draft(p_owner uuid,p_revision bigint,p_content jsonb)
RETURNS public.project_drafts LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,pg_temp AS $$
DECLARE result public.project_drafts;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
 IF p_owner IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'ACCOUNT_CHANGED'; END IF;
 IF p_revision IS NULL OR p_revision<0 OR p_revision>=9007199254740991 THEN RAISE EXCEPTION 'INVALID_REVISION'; END IF;
 IF NOT public.valid_project_draft(p_content) THEN RAISE EXCEPTION 'INVALID_PROJECT'; END IF;
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
