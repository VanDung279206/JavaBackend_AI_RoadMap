-- ============================================================
-- JavaBackend AI Roadmap — Database Schema
-- Tương thích: Supabase (PostgreSQL 15+)
-- Cập nhật: thay thế schema cũ (user_id INT, percentage)
-- ============================================================
-- Chạy toàn bộ file này trong Supabase SQL Editor.
-- File migrations/V1__website_schema.sql chứa hướng dẫn chi tiết
-- cho trường hợp nâng cấp từ schema cũ.
-- ============================================================

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id               uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         text,
  avatar_url       text,
  display_name     text,
  is_admin         boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Đọc công khai (leaderboard dùng)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- Chỉ cập nhật hồ sơ của chính mình; không tự nâng is_admin
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- Trigger tự tạo profile khi đăng ký GitHub OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── Progress ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.progress (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase        text        NOT NULL,          -- 'phase_1', '01_Java', v.v.
  exercise_id  text        NOT NULL,          -- 'P1.1', 'P2.3', v.v.
  done         boolean     NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT progress_unique UNIQUE (user_id, phase, exercise_id)
);

-- Covers the phase progress lookup used by the website and dashboard totals.
CREATE INDEX IF NOT EXISTS progress_user_phase_idx ON public.progress (user_id, phase);
CREATE INDEX IF NOT EXISTS progress_user_done_idx ON public.progress (user_id, done);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_select_own" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "progress_select_admin" ON public.progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "progress_insert_own" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update_own" ON public.progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Leaderboard (view) ───────────────────────────────────────────────────────
-- Chỉ hiển thị: username, avatar, display_name, số bài done, last_active.
-- Không lộ tiến độ chi tiết, email, hay is_admin.
CREATE OR REPLACE VIEW public.leaderboard
AS
SELECT
  p.id               AS id,
  p.id               AS user_id,
  p.username         AS github_username,
  p.avatar_url,
  p.display_name,
  COUNT(pr.id) FILTER (WHERE pr.done = true) AS completed_count,
  COUNT(pr.id) FILTER (WHERE pr.done = true) AS completed,
  COALESCE(MAX(pr.updated_at), p.created_at)  AS updated_at,
  MAX(pr.updated_at)                          AS last_active
FROM public.profiles p
LEFT JOIN public.progress pr ON pr.user_id = p.id
GROUP BY p.id, p.username, p.avatar_url, p.display_name
ORDER BY completed DESC;

-- ─── Grants ──────────────────────────────────────────────────────────────────
GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.progress TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ─── Đặt admin (chạy sau khi admin đã đăng nhập lần đầu) ─────────────────────
-- UPDATE public.profiles SET is_admin = true WHERE username = 'VanDung279206';
