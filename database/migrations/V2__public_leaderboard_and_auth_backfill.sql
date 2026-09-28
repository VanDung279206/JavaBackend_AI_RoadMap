-- V2: upgrade an installation that already ran the original V1.
-- Safe to run after the new schema.sql or canonical V1 as well.

-- Remove the old invoker view before renaming its source column or creating the table.
DO $$
DECLARE
  object_kind "char";
BEGIN
  SELECT c.relkind INTO object_kind
  FROM pg_class AS c
  JOIN pg_namespace AS n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'leaderboard';
  IF object_kind = 'v' THEN
    DROP VIEW public.leaderboard;
  END IF;
END;
$$;

-- Normalize the previous github_username profile field without touching is_admin.
DO $$
DECLARE
  has_old_name boolean;
  has_new_name boolean;
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN RETURN; END IF;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'github_username'
  ) INTO has_old_name;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username'
  ) INTO has_new_name;
  IF has_old_name AND NOT has_new_name THEN
    ALTER TABLE public.profiles RENAME COLUMN github_username TO username;
  ELSIF has_old_name AND has_new_name THEN
    UPDATE public.profiles SET username = COALESCE(username, github_username);
    ALTER TABLE public.profiles DROP COLUMN github_username;
  END IF;
END;
$$;

-- Keep legacy integer-keyed progress for manual account mapping instead of discarding it.
DO $$
DECLARE
  user_id_type text;
  archived_constraint record;
  archived_index record;
  archived_name text;
BEGIN
  IF to_regclass('public.progress') IS NULL THEN RETURN; END IF;
  SELECT data_type INTO user_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'progress' AND column_name = 'user_id';
  IF user_id_type IS NOT NULL AND user_id_type <> 'uuid' THEN
    IF to_regclass('public.progress_legacy_unmapped') IS NOT NULL THEN
      RAISE EXCEPTION 'public.progress has a non-UUID user_id and progress_legacy_unmapped already exists; resolve the archived data before retrying';
    END IF;
    ALTER TABLE public.progress RENAME TO progress_legacy_unmapped;
    -- Index names are schema-wide. Rename archived constraints and standalone
    -- indexes so they cannot shadow indexes created for the new progress table.
    FOR archived_constraint IN
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public.progress_legacy_unmapped'::regclass
    LOOP
      archived_name := 'progress_legacy_' || substr(md5(archived_constraint.conname), 1, 32);
      EXECUTE format(
        'ALTER TABLE public.progress_legacy_unmapped RENAME CONSTRAINT %I TO %I',
        archived_constraint.conname,
        archived_name
      );
    END LOOP;

    FOR archived_index IN
      SELECT ns.nspname AS schema_name, idx.relname AS index_name
      FROM pg_index AS pi
      JOIN pg_class AS idx ON idx.oid = pi.indexrelid
      JOIN pg_namespace AS ns ON ns.oid = idx.relnamespace
      WHERE pi.indrelid = 'public.progress_legacy_unmapped'::regclass
        AND NOT EXISTS (
          SELECT 1 FROM pg_constraint AS con WHERE con.conindid = pi.indexrelid
        )
    LOOP
      archived_name := 'progress_legacy_idx_' || substr(md5(archived_index.index_name), 1, 32);
      EXECUTE format(
        'ALTER INDEX %I.%I RENAME TO %I',
        archived_index.schema_name,
        archived_index.index_name,
        archived_name
      );
    END LOOP;

    ALTER TABLE public.progress_legacy_unmapped ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.progress_legacy_unmapped FROM PUBLIC, anon, authenticated;
  END IF;
END;
$$;

-- The former V1 used bigserial for progress.id; replace only that surrogate key.
DO $$
DECLARE
  id_type text;
  primary_key_name text;
BEGIN
  IF to_regclass('public.progress') IS NULL THEN RETURN; END IF;
  SELECT data_type INTO id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'progress' AND column_name = 'id';
  IF id_type IS NOT NULL AND id_type <> 'uuid' THEN
    ALTER TABLE public.progress ADD COLUMN id_uuid uuid;
    UPDATE public.progress SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;
    SELECT conname INTO primary_key_name
    FROM pg_constraint
    WHERE conrelid = 'public.progress'::regclass AND contype = 'p';
    IF primary_key_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.progress DROP CONSTRAINT %I', primary_key_name);
    END IF;
    ALTER TABLE public.progress DROP COLUMN id;
    ALTER TABLE public.progress RENAME COLUMN id_uuid TO id;
    ALTER TABLE public.progress ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE public.progress ALTER COLUMN id SET NOT NULL;
    ALTER TABLE public.progress ADD CONSTRAINT progress_pkey PRIMARY KEY (id);
  END IF;
END;
$$;

-- Fresh Supabase schema (PostgreSQL 15+).

CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text,
  avatar_url   text,
  display_name text,
  is_admin     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.progress (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase       text        NOT NULL,
  exercise_id text        NOT NULL,
  done        boolean     NOT NULL DEFAULT false,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT progress_unique UNIQUE (user_id, phase, exercise_id)
);

CREATE INDEX IF NOT EXISTS progress_user_phase_idx
  ON public.progress (user_id, phase);
CREATE INDEX IF NOT EXISTS progress_user_done_idx
  ON public.progress (user_id, done);

-- Public projection contains profile labels and aggregate counts only; progress rows stay private.
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  username        text,
  avatar_url      text,
  display_name    text,
  completed_count integer     NOT NULL DEFAULT 0 CHECK (completed_count >= 0),
  last_active     timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leaderboard_rank_idx
  ON public.leaderboard (completed_count DESC, updated_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    is_admin = (SELECT p.is_admin FROM public.profiles AS p WHERE p.id = auth.uid())
  );

DROP POLICY IF EXISTS "progress_select_own" ON public.progress;
CREATE POLICY "progress_select_own" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_select_admin" ON public.progress;
CREATE POLICY "progress_select_admin" ON public.progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "progress_insert_own" ON public.progress;
CREATE POLICY "progress_insert_own" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_update_own" ON public.progress;
CREATE POLICY "progress_update_own" ON public.progress
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "leaderboard_select_public" ON public.leaderboard;
CREATE POLICY "leaderboard_select_public" ON public.leaderboard
  FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'preferred_username'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_leaderboard_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.leaderboard AS lb
    (user_id, username, avatar_url, display_name, completed_count, last_active, updated_at)
  SELECT
    NEW.id,
    NEW.username,
    NEW.avatar_url,
    NEW.display_name,
    (COUNT(pr.id) FILTER (WHERE pr.done))::integer,
    MAX(pr.updated_at),
    COALESCE(MAX(pr.updated_at), NEW.created_at)
  FROM public.progress AS pr
  WHERE pr.user_id = NEW.id
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = GREATEST(lb.updated_at, EXCLUDED.updated_at);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_leaderboard_progress_change(
  p_user_id uuid,
  p_delta integer,
  p_activity_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.leaderboard AS lb
    (user_id, username, avatar_url, display_name, completed_count, last_active, updated_at)
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.display_name,
    GREATEST(p_delta, 0),
    p_activity_at,
    p_activity_at
  FROM public.profiles AS p
  WHERE p.id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    completed_count = GREATEST(lb.completed_count + p_delta, 0),
    last_active = GREATEST(lb.last_active, p_activity_at),
    updated_at = GREATEST(lb.updated_at, p_activity_at);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_leaderboard_progress_change(uuid, integer, timestamptz)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_leaderboard_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  delta integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.apply_leaderboard_progress_change(
      NEW.user_id,
      CASE WHEN NEW.done THEN 1 ELSE 0 END,
      COALESCE(NEW.updated_at, now())
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      PERFORM public.apply_leaderboard_progress_change(
        OLD.user_id,
        CASE WHEN OLD.done THEN -1 ELSE 0 END,
        now()
      );
      delta := CASE WHEN NEW.done THEN 1 ELSE 0 END;
    ELSE
      delta := CASE WHEN NEW.done THEN 1 ELSE 0 END -
               CASE WHEN OLD.done THEN 1 ELSE 0 END;
    END IF;
    PERFORM public.apply_leaderboard_progress_change(
      NEW.user_id,
      delta,
      COALESCE(NEW.updated_at, now())
    );
    RETURN NEW;
  ELSE
    PERFORM public.apply_leaderboard_progress_change(
      OLD.user_id,
      CASE WHEN OLD.done THEN -1 ELSE 0 END,
      now()
    );
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS profiles_sync_leaderboard_insert ON public.profiles;
CREATE TRIGGER profiles_sync_leaderboard_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_leaderboard_profile();

DROP TRIGGER IF EXISTS profiles_sync_leaderboard_update ON public.profiles;
CREATE TRIGGER profiles_sync_leaderboard_update
  AFTER UPDATE OF username, avatar_url, display_name ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_leaderboard_profile();

DROP TRIGGER IF EXISTS progress_sync_leaderboard ON public.progress;
CREATE TRIGGER progress_sync_leaderboard
  AFTER INSERT OR UPDATE OR DELETE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.sync_leaderboard_progress();

-- Backfill every Supabase Auth account; the conflict update deliberately leaves is_admin unchanged.
INSERT INTO public.profiles (id, username, avatar_url, display_name)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'user_name', u.raw_user_meta_data->>'preferred_username'),
  u.raw_user_meta_data->>'avatar_url',
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name')
FROM auth.users AS u
ON CONFLICT (id) DO UPDATE SET
  username = COALESCE(public.profiles.username, EXCLUDED.username),
  avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
  display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);

-- Recompute exact totals while writes that feed the aggregate are paused. Keeping
-- the lock and rebuild in one statement also works in SQL editors that autocommit
-- each statement in the migration file.
DO $$
BEGIN
  LOCK TABLE public.profiles, public.progress IN SHARE ROW EXCLUSIVE MODE;

  INSERT INTO public.leaderboard AS lb
    (user_id, username, avatar_url, display_name, completed_count, last_active, updated_at)
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.display_name,
    (COUNT(pr.id) FILTER (WHERE pr.done))::integer,
    MAX(pr.updated_at),
    COALESCE(MAX(pr.updated_at), p.created_at)
  FROM public.profiles AS p
  LEFT JOIN public.progress AS pr ON pr.user_id = p.id
  GROUP BY p.id, p.username, p.avatar_url, p.display_name, p.created_at
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    completed_count = EXCLUDED.completed_count,
    last_active = EXCLUDED.last_active,
    updated_at = EXCLUDED.updated_at;
END;
$$;

REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
REVOKE ALL ON public.progress FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.progress TO authenticated;
REVOKE ALL ON public.leaderboard FROM anon, authenticated;
GRANT SELECT ON public.leaderboard TO anon, authenticated;
