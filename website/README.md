# Java Backend + AI Roadmap — Website

Website học tập tại **[VanDung279206.github.io/JavaBackend_AI_RoadMap](https://VanDung279206.github.io/JavaBackend_AI_RoadMap)**

## Tính năng

- 🗺️ Roadmap 7 phase từ Java cơ bản đến RAG
- 📚 Bài tập & lời giải ẩn/hiện theo từng phase
- ✅ Theo dõi tiến độ lưu cloud (đăng nhập GitHub)
- 🏆 Bảng xếp hạng người học
- 🔍 Command Palette `Ctrl+K`
- ⚙️ Admin dashboard quản lý người học

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16 (Static Export) |
| Styling | Tailwind CSS 4 |
| Auth + DB | Supabase (GitHub OAuth + PostgreSQL) |
| Deploy | GitHub Pages + GitHub Actions |
| Forum | Giscus (GitHub Discussions) |

## Cài đặt

```bash
cd website
npm install
```

## Cấu hình môi trường

```bash
cp .env.example .env.local
# Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Chạy local

```bash
npm run dev
# Mở http://localhost:3000/JavaBackend_AI_RoadMap
```

## Build

```bash
npm run build
# Output tĩnh trong website/out/
```

## Cấu trúc thư mục

```
website/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Trang chủ
│   │   ├── roadmap/          # Trang roadmap
│   │   ├── docs/[phase]/     # Bài tập theo phase
│   │   ├── leaderboard/      # Bảng xếp hạng
│   │   ├── admin/            # Dashboard quản trị
│   │   └── auth/callback/    # OAuth callback
│   ├── components/
│   │   ├── sections/         # LearningDashboard, InteractiveRoadmap, ProjectShowcase
│   │   ├── command/          # SearchCommand (Ctrl+K)
│   │   └── ui/               # shadcn components
│   └── lib/
│       ├── supabase.ts       # Supabase client + types
│       └── markdown.ts       # Đọc file markdown
├── public/
│   └── content/              # Markdown bài tập (copy từ phases/ khi build)
└── .env.example
```

## Deploy

Push lên nhánh `main` → GitHub Actions tự động build và deploy.

Cần thêm 2 GitHub Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
