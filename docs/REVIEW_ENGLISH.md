# Review khu học tiếng Anh

Nhánh: `feature/english-learning`. Nền main: `3413b866443c30c18fc30177ae3f9ca5beb61968`.

## Nội dung PR đề xuất

**Tiêu đề:** feat: add interactive English learning for developers

Trước thay đổi, nội dung tiếng Anh chủ yếu nằm trong Markdown, chưa có khu học tương tác trên website. `/english` cho phép học 72 từ, sáu đoạn đọc, tám log lỗi, 219 bài có đáp án và 16 nhiệm vụ viết; có ôn tập theo lịch, tiến độ riêng và JSON chuyển thiết bị. Menu, tìm kiếm, từng chặng và Hôm nay dẫn vào nội dung phù hợp.

Kết quả theo đáp án, tự đối chiếu và mức nhớ được phân biệt rõ. Tiến độ lưu local theo khách/tài khoản, không cấp verified PASS lập trình. Bản sao có validation, xem trước và kiểm dữ liệu hiện tại trong khóa trước khi thay thế. Không tích hợp AI hay đồng bộ tiếng Anh lên máy chủ trong bản này.

Kiểm chứng bản cuối: 81/81 test, lint, build/static export 37 trang và 15 luồng Chromium trên desktop/mobile đạt với Node 20.20.2; catalogue, liên kết nội bộ và tám fixture diagnostic đạt. Chi tiết phạm vi thực chạy và harness nằm trong [báo cáo](VALIDATION_ENGLISH.md). CI của bản khởi tạo `7e538aa` đã đạt hai workflow; trạng thái của lần nâng cấp cần xem trên PR. Chưa kiểm đăng nhập Supabase thật, Safari/Firefox hoặc âm thanh trên thiết bị.

## Vùng code cần review

| Vùng | File chính | Điều cần xác nhận |
| --- | --- | --- |
| Nội dung | `english/curriculum.json`, `scripts/english-content.mjs`, `scripts/build_english.mjs` | ID ổn định; đủ nguồn Markdown; đáp án, liên kết và diagnostic khớp fixture |
| Chấm và lịch ôn | `website/src/lib/english-core.ts` | Đáp án được chấp nhận; validation không nhận điểm giả; lịch ôn và bằng chứng tự đối chiếu riêng |
| Lưu tiến độ | `website/src/lib/useEnglishProgress.ts`, `website/src/components/DraftBackup.tsx` | Tái sử dụng cơ chế khóa hiện có; namespace khách/tài khoản; export chờ ghi; import kiểm baseline |
| Giao diện | `website/src/components/english/`, `website/src/app/english/page.tsx` | Làm trước khi mở đáp án; trạng thái lưu/lỗi/trống; không giả chấm AI hoặc PASS |
| Tích hợp | Navbar, Search, PhaseLearning, PhasePage, EnglishDaily | Menu desktop/mobile, hash trong cùng trang, tìm kiếm và basePath |
| Hồi quy | `website/tests/english-*.mjs`, `.github/workflows/website-ci.yml` | Logic thật trong harness và static export trong Chromium; deploy vẫn chỉ main |

## Kiểm nhanh giao diện

1. Mở `/JavaBackend_AI_RoadMap/english`, chọn Java → Từ vựng. Tìm `doi tuong cu the`; mở từ, làm chọn nghĩa/điền và tự viết câu.
2. Reload, xác nhận câu đã lưu. Đọc hiểu: tra từ, mở bản dịch và làm câu hỏi. Đọc lỗi: xem rõ nhãn fixture và viết mô tả lỗi.
3. Viết commit/giải thích, tự đối chiếu rồi sửa một chữ; trạng thái đối chiếu phải bị hủy. Ôn tập: nhập câu trả lời trước khi mở nghĩa, chọn mức nhớ và kiểm ngày ôn.
4. Xuất JSON. Chọn file nhập để xem trước; sửa dữ liệu ở tab thứ hai rồi áp dụng từ tab đầu: phải từ chối bản xem trước cũ. Chọn lại file và áp dụng sau khi kiểm cảnh báo thay thế.
5. Làm xong từ vựng rồi reload: Tiếp tục/Hôm nay phải mở Đọc hiểu; sau đọc/luyện câu mở Viết. Ôn hết từ đến hạn phải hiện trạng thái hoàn tất; chỉ luyện cả danh sách khi chọn “Luyện thêm tất cả từ”.
6. Với SQL/Spring, mở gợi ý rồi làm các bài `SQL-BRIDGE-*` và `SPRING-BRIDGE-*`.
7. Kiểm Hôm nay, trang học Spring, DSA và tìm kiếm → tiếng Anh. Với viewport 390px, dùng menu mobile và cả năm khu, không tràn ngang toàn trang.

## Lệnh kiểm và diff

Từ gốc repo:

```bash
node scripts/build_catalogue.mjs --check
python3 scripts/error_examples.py --verify
python3 scripts/check_links.py
git diff --check
```

Trong `website`, cấu hình `.env.local` theo `.env.example` trước build:

```bash
npm ci
npm test
npm run lint
npm run build
npx playwright install --with-deps chromium
npm run test:browser
```

Browser test phục vụ static export, chặn request ngoài localhost và không kiểm đăng nhập thật. Xem [hướng dẫn nội dung](../english/AUTHORING.md) cho biến môi trường basePath/Chromium/ảnh.

Diff bàn giao `english-learning.patch` là **diff tổng hợp** từ commit nền tới HEAD, không phải mail patch. Trên checkout sạch đúng commit nền, áp dụng bằng:

```bash
git switch -c feature/english-learning 3413b866443c30c18fc30177ae3f9ca5beb61968
git apply --check /path/to/english-learning.patch
git apply /path/to/english-learning.patch
git diff --stat
```

Nếu đã có nhánh triển khai, review bằng `git diff 3413b866443c30c18fc30177ae3f9ca5beb61968..feature/english-learning`. Source ZIP chứa file được Git quản lý, không gồm dependency, build output, cấu hình bí mật hoặc tiến độ người học. Nhánh đã đăng trên GitHub, [PR #10](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/pull/10) vào main. Commit được tạo qua GitHub API, tree được đối chiếu với bản local đã kiểm; xem SHA hiện tại và CI trên PR.
