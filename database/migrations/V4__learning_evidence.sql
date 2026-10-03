-- Apply V1,V2,V3 first. Then V4, ../catalogue_seed.sql, V5 in that order.
BEGIN;
CREATE TABLE public.learning_phases (slug text PRIMARY KEY, title text NOT NULL);
ALTER TABLE public.learning_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY phases_read ON public.learning_phases FOR SELECT USING (true);
REVOKE ALL ON public.learning_phases FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.learning_phases TO anon,authenticated;
CREATE TABLE public.exercise_catalogue (
 phase text NOT NULL REFERENCES public.learning_phases(slug), exercise_id text NOT NULL, title text NOT NULL,
 PRIMARY KEY (phase, exercise_id), UNIQUE(exercise_id)
);
ALTER TABLE public.exercise_catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalogue_read ON public.exercise_catalogue FOR SELECT USING (true);
REVOKE ALL ON public.exercise_catalogue FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.exercise_catalogue TO anon, authenticated;

ALTER TABLE public.progress ADD COLUMN status text NOT NULL DEFAULT 'not_started'
 CHECK (status IN ('not_started','in_progress','self_completed','needs_review'));
ALTER TABLE public.progress ADD COLUMN revision bigint NOT NULL DEFAULT 1;
ALTER TABLE public.progress ADD COLUMN due_at timestamptz;
ALTER TABLE public.progress ADD COLUMN hint_level integer NOT NULL DEFAULT 0 CHECK (hint_level BETWEEN 0 AND 3);
ALTER TABLE public.progress ADD COLUMN error_tags text[] NOT NULL DEFAULT '{}';
UPDATE public.progress SET status = CASE WHEN done THEN 'self_completed' ELSE 'not_started' END;
-- Preserve the old done projection for existing dashboard/admin consumers.
CREATE FUNCTION public.progress_derive_done() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.done := NEW.status = 'self_completed'; RETURN NEW; END $$;
CREATE TRIGGER progress_derive_done BEFORE INSERT OR UPDATE ON public.progress
 FOR EACH ROW EXECUTE FUNCTION public.progress_derive_done();
REVOKE INSERT, UPDATE, DELETE ON public.progress FROM anon, authenticated;

-- Column privileges, rather than a client-side role check, prevent self-promotion.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE(username, avatar_url, display_name) ON public.profiles TO authenticated;
DROP POLICY profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
 USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE FUNCTION public.save_learning_progress(p_phase text, p_exercise_id text,
 p_status text, p_revision bigint, p_due_at timestamptz DEFAULT NULL,
 p_hint_level integer DEFAULT 0, p_error_tags text[] DEFAULT '{}', p_owner uuid DEFAULT NULL)
RETURNS public.progress LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE result public.progress;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
 IF p_owner IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'ACCOUNT_CHANGED'; END IF;
 IF p_revision IS NULL OR p_revision < 0 THEN RAISE EXCEPTION 'INVALID_REVISION'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.exercise_catalogue WHERE phase=p_phase AND exercise_id=p_exercise_id)
 THEN RAISE EXCEPTION 'INVALID_EXERCISE'; END IF;
 IF p_status NOT IN ('not_started','in_progress','self_completed','needs_review') OR p_status IS NULL
 THEN RAISE EXCEPTION 'INVALID_STATUS'; END IF;
 IF cardinality(p_error_tags)>14 OR length(array_to_string(p_error_tags,','))>500 THEN RAISE EXCEPTION 'INVALID_TAGS'; END IF;
 -- Serializes initial creation as well as updates for this exact account/exercise.
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text || ':' || p_exercise_id,0));
 SELECT * INTO result FROM public.progress WHERE user_id=auth.uid() AND phase=p_phase AND exercise_id=p_exercise_id FOR UPDATE;
 IF COALESCE(result.revision,0) <> p_revision THEN RAISE EXCEPTION 'PROGRESS_CONFLICT'; END IF;
 INSERT INTO public.progress(user_id,phase,exercise_id,status,revision,due_at,hint_level,error_tags,updated_at)
 VALUES(auth.uid(),p_phase,p_exercise_id,p_status,1,p_due_at,p_hint_level,p_error_tags,now())
 ON CONFLICT(user_id,phase,exercise_id) DO UPDATE SET status=EXCLUDED.status,
 revision=progress.revision+1,due_at=EXCLUDED.due_at,
 hint_level=GREATEST(progress.hint_level,EXCLUDED.hint_level),error_tags=EXCLUDED.error_tags,updated_at=now()
 RETURNING * INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.save_learning_progress(text,text,text,bigint,timestamptz,integer,text[],uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_learning_progress(text,text,text,bigint,timestamptz,integer,text[],uuid) TO authenticated;

CREATE TABLE public.submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
 phase text NOT NULL, exercise_id text NOT NULL, source text NOT NULL CHECK(length(source) BETWEEN 1 AND 120000),
 intent text NOT NULL CHECK(intent IN ('run','submit')),
 verdict text NOT NULL DEFAULT 'BLOCKED' CHECK(verdict IN ('BLOCKED','QUEUED','RUNNING','PASS','FAIL','COMPILE_ERROR','TIMEOUT','ERROR')),
 diagnostics jsonb NOT NULL DEFAULT '{"reason":"Isolated runner not configured"}',
 test_version text, created_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
 FOREIGN KEY(phase,exercise_id) REFERENCES public.exercise_catalogue(phase,exercise_id)
);
CREATE INDEX submissions_user_created ON public.submissions(user_id,created_at DESC);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY submissions_own_read ON public.submissions FOR SELECT TO authenticated USING(user_id=auth.uid());
REVOKE ALL ON public.submissions FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.submissions TO authenticated;
-- Even an admin's browser cannot issue a verified result. Only a private worker may write verdicts.
GRANT ALL ON public.submissions TO service_role;
CREATE FUNCTION public.submit_learning_attempt(p_phase text,p_exercise_id text,p_source text,p_intent text,p_owner uuid DEFAULT NULL)
RETURNS public.submissions LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE result public.submissions;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
 IF p_owner IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'ACCOUNT_CHANGED'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('submission:' || auth.uid()::text,0));
 IF EXISTS(SELECT 1 FROM public.submissions WHERE user_id=auth.uid() AND created_at>now()-interval '2 seconds')
 THEN RAISE EXCEPTION 'RATE_LIMIT'; END IF;
 INSERT INTO public.submissions(user_id,phase,exercise_id,source,intent)
 VALUES(auth.uid(),p_phase,p_exercise_id,p_source,p_intent) RETURNING * INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.submit_learning_attempt(text,text,text,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_learning_attempt(text,text,text,text,uuid) TO authenticated;

CREATE VIEW public.verified_leaderboard WITH (security_barrier=true) AS
 SELECT p.id AS user_id,p.username,p.display_name,p.avatar_url,
 count(DISTINCT s.exercise_id)::integer AS completed_count,max(s.finished_at) AS updated_at
 FROM public.profiles p JOIN public.submissions s ON s.user_id=p.id
 WHERE s.intent='submit' AND s.verdict='PASS' AND s.test_version IS NOT NULL AND s.finished_at IS NOT NULL
 GROUP BY p.id,p.username,p.display_name,p.avatar_url;
REVOKE ALL ON public.verified_leaderboard FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.verified_leaderboard TO anon,authenticated;

CREATE TABLE public.learning_notes (
 user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
 resource_key text NOT NULL CHECK(length(resource_key) BETWEEN 1 AND 200),
 bookmarked boolean NOT NULL DEFAULT false, note text NOT NULL DEFAULT '' CHECK(length(note)<=10000),
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,resource_key)
);
ALTER TABLE public.learning_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY notes_own ON public.learning_notes TO authenticated
 USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
REVOKE ALL ON public.learning_notes FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.learning_notes TO authenticated;
COMMIT;
