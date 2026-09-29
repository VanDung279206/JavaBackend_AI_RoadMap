-- Community resource library. Apply after V2 in Supabase SQL Editor.
-- Files stay private until an administrator approves the resource row.

CREATE TABLE IF NOT EXISTS public.community_resources (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL CHECK (char_length(title) BETWEEN 5 AND 120),
  purpose         text        NOT NULL CHECK (purpose IN ('lesson', 'notes', 'exercise', 'reference', 'project')),
  phase_slug      text        NOT NULL CHECK (phase_slug IN ('00_Setup', '01_Java', '02_Http-Sql', '03_Spring', '04_Quality', '05_AI', '06_RAG')),
  description     text        NOT NULL CHECK (char_length(description) BETWEEN 20 AND 1200),
  resource_type   text        NOT NULL CHECK (resource_type IN ('file', 'link')),
  file_path       text        UNIQUE,
  source_url      text,
  submitted_by    uuid        NOT NULL CONSTRAINT community_resources_submitted_by_fkey REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderation_note text,
  reviewed_by     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_resources_source_matches_type CHECK (
    (resource_type = 'file' AND file_path IS NOT NULL AND source_url IS NULL)
    OR
    (resource_type = 'link' AND file_path IS NULL AND source_url ~ '^https://')
  )
);

CREATE INDEX IF NOT EXISTS community_resources_public_idx
  ON public.community_resources (phase_slug, purpose, created_at DESC)
  WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS community_resources_submitter_idx
  ON public.community_resources (submitted_by, created_at DESC);
CREATE INDEX IF NOT EXISTS community_resources_review_idx
  ON public.community_resources (status, created_at)
  WHERE status = 'pending';

ALTER TABLE public.community_resources ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_resources FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.community_resources TO anon, authenticated;
GRANT INSERT, UPDATE ON public.community_resources TO authenticated;

DROP POLICY IF EXISTS "community_resources_read_visible" ON public.community_resources;
CREATE POLICY "community_resources_read_visible" ON public.community_resources
  FOR SELECT TO anon, authenticated USING (
    status = 'approved'
    OR submitted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "community_resources_submit_pending" ON public.community_resources;
CREATE POLICY "community_resources_submit_pending" ON public.community_resources
  FOR INSERT TO authenticated WITH CHECK (
    submitted_by = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND moderation_note IS NULL
    AND (
      (resource_type = 'link' AND file_path IS NULL)
      OR (resource_type = 'file' AND file_path LIKE (auth.uid()::text || '/%'))
    )
  );

DROP POLICY IF EXISTS "community_resources_admin_review" ON public.community_resources;
CREATE POLICY "community_resources_admin_review" ON public.community_resources
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-resources',
  'community-resources',
  false,
  15728640,
  ARRAY[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "community_resource_files_upload_own" ON storage.objects;
CREATE POLICY "community_resource_files_upload_own" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'community-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "community_resource_files_read_allowed" ON storage.objects;
CREATE POLICY "community_resource_files_read_allowed" ON storage.objects
  FOR SELECT TO anon, authenticated USING (
    bucket_id = 'community-resources'
    AND (
      EXISTS (
        SELECT 1 FROM public.community_resources AS r
        WHERE r.file_path = storage.objects.name
          AND (r.status = 'approved' OR r.submitted_by = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles AS p
        WHERE p.id = auth.uid() AND p.is_admin = true
      )
    )
  );

DROP POLICY IF EXISTS "community_resource_files_delete_allowed" ON storage.objects;
CREATE POLICY "community_resource_files_delete_allowed" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'community-resources'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles AS p
        WHERE p.id = auth.uid() AND p.is_admin = true
      )
    )
  );

