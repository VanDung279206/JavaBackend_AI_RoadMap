-- ============================================================
-- Migration: Khởi tạo database cho JavaBackend_AI_RoadMap
-- Phiên bản: V1
-- Áp dụng: Supabase SQL Editor (chạy một lần, theo thứ tự)
-- Tác giả: VanDung279206
-- ============================================================
--
-- LƯU Ý QUAN TRỌNG:
-- File database/schema.sql cũ dùng user_id INT và percentage.
-- Nếu bạn đã chạy schema cũ đó, dữ liệu cũ không tự chuyển sang cấu trúc
-- này. Hãy xác minh bảng nào đang tồn tại trước khi chạy migration này.
--
-- Kiểm tra bảng hiện tại:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--
-- Nếu bảng progress cũ có user_id INT: bảng đó không tương thích.
-- Đổi tên bảng cũ trước: ALTER TABLE progress RENAME TO progress_old;
-- ============================================================

-- ─── 1. Bảng profiles ────────────────────────────────────────────────────────
-- Mỗi người dùng có một profile tương ứng, tạo tự động khi đăng ký.
-- is_admin chỉ được đặt bởi quản trị viên qua SQL Editor, không phải từ frontend.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  github_username text,
  avatar_url  text,
  display_name text,
  is_admin    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. RLS cho profiles ─────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc thông tin cơ bản của tất cả người dùng (cho leaderboard)
-- CHỈ các cột được chỉ định trong view leaderboard; không công khai toàn bộ hồ sơ
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Người dùng chỉ được cập nhật hồ sơ của chính mình
-- is_admin được loại trừ — không cho người dùng tự nâng quyền
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- ─── 3. Trigger tạo profile khi đăng ký ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, github_username, avatar_url, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotent nếu chạy lại
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── 4. Bảng progress ────────────────────────────────────────────────────────
-- Lưu trạng thái từng bài tập của từng người dùng.
-- user_id là UUID khớp với auth.users.id (Supabase Auth).
-- Ràng buộc duy nhất cho phép upsert an toàn.

CREATE TABLE IF NOT EXISTS public.progress (
  id           bigserial    PRIMARY KEY,
  user_id      uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase        text         NOT NULL,          -- Ví dụ: '01_Java'
  exercise_id  text         NOT NULL,          -- Ví dụ: 'P1.1'
  done         boolean      NOT NULL DEFAULT false,
  updated_at   timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT progress_unique UNIQUE (user_id, phase, exercise_id)
);

-- Index tăng tốc truy vấn theo user (dùng cho leaderboard và dashboard)
CREATE INDEX IF NOT EXISTS progress_user_idx ON public.progress (user_id, done);

-- ─── 5. RLS cho progress ─────────────────────────────────────────────────────
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Người dùng chỉ thấy tiến độ của mình
DROP POLICY IF EXISTS "progress_select_own" ON public.progress;
CREATE POLICY "progress_select_own"
  ON public.progress FOR SELECT
  USING (auth.uid() = user_id);

-- Admin thấy tất cả tiến độ (đọc qua bảng profiles để kiểm tra is_admin)
DROP POLICY IF EXISTS "progress_select_admin" ON public.progress;
CREATE POLICY "progress_select_admin"
  ON public.progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Chỉ chèn tiến độ của chính mình
DROP POLICY IF EXISTS "progress_insert_own" ON public.progress;
CREATE POLICY "progress_insert_own"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Chỉ cập nhật tiến độ của chính mình; không được thay đổi user_id
DROP POLICY IF EXISTS "progress_update_own" ON public.progress;
CREATE POLICY "progress_update_own"
  ON public.progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 6. View leaderboard ─────────────────────────────────────────────────────
-- Chỉ công khai: github_username, avatar_url, display_name, số bài done, last_active.
-- KHÔNG công khai: tiến độ chi tiết, email, is_admin.
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = true)  -- Dùng quyền của người gọi, không bypass RLS
AS
SELECT
  p.github_username,
  p.avatar_url,
  p.display_name,
  COUNT(pr.id) FILTER (WHERE pr.done = true) AS completed,
  MAX(pr.updated_at)                          AS last_active
FROM public.profiles p
LEFT JOIN public.progress pr ON pr.user_id = p.id
GROUP BY p.id, p.github_username, p.avatar_url, p.display_name
ORDER BY completed DESC;

-- ─── 7. Quyền truy cập ───────────────────────────────────────────────────────
-- anon role được dùng bởi Supabase publishable key (frontend)
GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.progress TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ─── 8. Đặt admin cho tài khoản đầu tiên ────────────────────────────────────
-- Chạy SAU KHI admin đã đăng nhập vào website ít nhất một lần:
--
--   UPDATE public.profiles
--   SET is_admin = true
--   WHERE github_username = 'VanDung279206';
--
-- Chỉ người có quyền truy cập Supabase dashboard mới chạy được lệnh này.
-- Frontend không thể tự nâng is_admin do policy update_own có WITH CHECK.

-- ─── Tổng kết ─────────────────────────────────────────────────────────────────
-- Sau khi chạy migration này:
--   ✓ Profiles tự tạo khi đăng ký GitHub OAuth
--   ✓ Progress lưu exercise_id + done + updated_at (khớp với website)
--   ✓ Upsert an toàn nhờ UNIQUE (user_id, phase, exercise_id)
--   ✓ RLS ngăn người dùng sửa tiến độ người khác
--   ✓ Người dùng không tự nâng is_admin được
--   ✓ Leaderboard chỉ công khai thông tin cần thiết
