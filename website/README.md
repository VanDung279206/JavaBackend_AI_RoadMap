# Java Backend + AI Roadmap — Website

Website học tập tại **[VanDung279206.github.io/JavaBackend_AI_RoadMap](https://VanDung279206.github.io/JavaBackend_AI_RoadMap)**

## Tính năng

- “Học chặng này” tại `/learn/<phase>` với bài học, luyện tập, áp dụng dự án và đề cuối chặng; 23 ví dụ có thể kiểm bằng `py scripts/check_lessons.py`.
- Java thí điểm 20 bài tăng mức; nhánh thử thách cần đủ tiên quyết. Bài đọc/bằng chứng tự đối chiếu lưu trên thiết bị, tách tiến độ bài và verified từ worker.
- `/projects/mine`: năm bước tự thiết kế, đề cương Markdown chỉnh sửa/xuất được, sáu mốc và checklist kỹ năng; hỗ trợ chọn RAG lab riêng. Đề cương lưu trên thiết bị theo tài khoản/khách, chưa đồng bộ máy chủ.
- Nhập JSON đã tải ở trang bài học và dự án: kiểm định dạng/kích thước, xem trước, áp dụng hoặc hủy. Dự án thay thế toàn bộ bản hiện tại; bài học ghép các ID có trong file, giữ các bài khác. Nhập không cấp verified từ worker.

Lưu bài học và bản nháp dùng Web Locks trên HTTPS (hoặc localhost). Mỗi thay đổi ghép theo bài/trường với bản lưu mới nhất trong khóa ghi chung giữa các tab, kể cả khi sự kiện `storage` đến chậm. Nếu hai tab sửa cùng một trường, lần ghi sau trong khóa có hiệu lực; các trường khác được giữ. Trình duyệt thiếu Web Locks sẽ báo lỗi và từ chối ghi, bản lưu gốc vẫn xuất được. Lỗi validation/tạo đề cương/hết dung lượng không khóa form; dữ liệu lưu bị hỏng vẫn khóa ghi để bảo vệ bản gốc.

Xuất JSON bị khóa khi còn thay đổi chờ ghi. Nhập JSON kiểm bản lưu hiện tại một lần nữa trong khóa ghi; nếu thay đổi từ lúc chọn file, nhập bị từ chối và dữ liệu mới được giữ. File lỗi, quá lớn hoặc bản hiện tại bị hỏng không được dùng để ghi đè. Trình duyệt được yêu cầu cảnh báo khi rời trang lúc có ghi chờ. Xác nhận tự kiểm chứng chỉ áp dụng khi bằng chứng chưa thay đổi ở tab khác.

Mỗi trường dự án cho phép 50.000 ký tự. Đề cương và bản đề cương trước dùng giới hạn riêng đủ chứa tổng đầu vào và phần user stories sinh thêm; ô chỉnh Markdown dùng cùng giới hạn với bộ đọc dữ liệu.

Khi đưa nhánh Java_Roadmap_V2 vào môi trường đang dùng V4–V6, áp dụng lại `database/catalogue_seed.sql` để đăng ký 20 ID JP01–JP20. Không cần migration mới cho dữ liệu chỉ lưu trên thiết bị.

- 🗺️ Roadmap chính và các track mở rộng sinh từ `learning/catalogue.json`
- 📚 Bài tập & lời giải ẩn/hiện theo từng phase
- ✅ Tiến độ khách/tài khoản, dự phòng offline, nhập khách có chủ ý và xử lý xung đột
- 🏆 Tách xếp hạng tự khai báo và kết quả có bằng chứng từ worker
- 🔍 Command Palette `Ctrl+K`
- ⚙️ Admin dashboard quản lý người học
- Hôm nay học gì, lịch ôn, phòng khám lỗi, gợi ý ba cấp, ghi chú/bookmark và reset password
- Kiểm tra đầu vào, bản đồ tiên quyết, mô phỏng retrieval và luồng request

Chạy thử/nộp bài được lưu riêng; Java/Maven grading là **BLOCKED** cho đến khi có worker cô lập. Không chạy mã bài nộp trong Next.js. Xem [phạm vi kiểm chứng](../VALIDATION.md) và [nâng cấp database](../docs/UPGRADE_V3.md).

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16 (Static Export) |
| Styling | Tailwind CSS 4 |
| Auth + DB | Supabase (email/password + PostgreSQL) |
| Deploy | GitHub Pages + GitHub Actions |
| Forum | Giscus (GitHub Discussions) |

## Cài đặt

```bash
cd website
npm ci
```

## Cấu hình môi trường

```bash
cp .env.example .env.local
# Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Áp dụng V4 → `database/catalogue_seed.sql` → V5 → V6 sau V1–V3. Thêm URL `https://<host>/JavaBackend_AI_RoadMap/auth/reset` vào Supabase Auth Redirect URLs. Frontend chỉ dùng anon key; không đưa service-role key vào web. Database test chạy riêng bằng `python3 scripts/check_database.py` và Docker.

Trước build chạy `npm test` và `npm run lint`. `prebuild` sinh catalogue; CI chạy `node scripts/build_catalogue.mjs --check` từ root để phát hiện nội dung lệch. Chỉnh nguồn Markdown/catalogue, không chỉnh trực tiếp `src/generated/catalogue.json`.

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
│   │   └── auth/callback/    # Xác nhận email
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
