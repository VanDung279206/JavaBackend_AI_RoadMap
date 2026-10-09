# Bổ sung nội dung học tiếng Anh

Nguồn nội dung cũ vẫn là `GLOSSARY.md`, `READING_PRACTICE.md`, `CODING_TASKS.md`, `ERROR_CLINIC.md` và `observed-errors.json`. Website không duy trì một bản dịch riêng. `curriculum.json` bổ sung mục tiêu/tiên quyết/áp dụng, câu hỏi, đáp án và liên kết bài lập trình. `scripts/build_english.mjs` kết hợp các nguồn thành `website/src/generated/english.json`; không sửa file generated trực tiếp.

## ID và liên kết

- Giữ nguyên ID bài đang có: `EN-1`, `READ-1`, `WRITE-1`, `P1-FILL`, `E01`…; không tái sử dụng một ID cho nội dung khác.
- Từ vựng có ID đăng ký rõ trong `curriculum.json.termIds` theo khóa `phase:term`. Khi đổi cách viết thuật ngữ hoặc chuyển nhóm, đổi khóa nhưng **giữ giá trị ID** để giữ tiến độ. Từ mới cần ID mới. Không xóa ID đã phát hành nếu chưa có migration bản lưu. Nếu đổi đáp án của bài đã phát hành, cũng cần migration kết quả cũ: validator kiểm lại kết quả theo đáp án hiện tại và khóa ghi khi bản lưu mâu thuẫn.
- Nhóm phải có trong `learning/catalogue.json` và một unit tiếng Anh. `exerciseIds` trỏ tới ID bài lập trình thật. Sáu unit chính có `number` và bắt buộc một đoạn đọc, ít nhất ba bài luyện với các mục tiêu khác nhau.
- Bài Java mở nhóm Java; foundations/debug/concurrency dùng Java; mixed/variants dùng DSA; advanced dùng RAG. Nhóm setup có mẫu compile/run và lỗi compiler, DSA giữ 12 thuật ngữ và mẫu giải thích thuật toán.

## Soạn bài tăng dần

Mỗi unit cần `objective`, `prerequisite`, `explanation` tiếng Việt và `application` yêu cầu áp dụng vào code người học. Đi từ nhận diện từ, hiểu câu, điền có gợi ý, đọc đoạn đến tự viết và giải thích 3–5 câu. Câu mẫu phải nêu hành vi/đầu ra và kết quả đã kiểm; không mặc định một đề xuất sửa đã PASS.

- `choice`: mỗi option có ID riêng, đáp án chứa ID option. Thêm lựa chọn sai có lý do; đừng luôn đặt đáp án đúng đầu tiên.
- `fill`/`correct`: `answers` liệt kê những cách trả lời được hỗ trợ. So khớp bỏ khác biệt hoa/thường, khoảng trắng, dấu kết thúc `. ! ?`, apostrophe cong và chuẩn hóa Unicode NFKC. Không nhận mọi câu đồng nghĩa: câu khác cần tự đối chiếu.
- `reorder`: mỗi phần tử `tokens` là một token; lời giải chứa đủ token. Chấm bằng chỉ số token để từ lặp không bị mất. Không bỏ `not` hoặc đảo điều kiện làm sai nghĩa.
- Từ vựng tự sinh bài chọn nghĩa và điền từ từ glossary. Bài tự viết một câu luôn là **tự đối chiếu**, không tự chấm ngữ pháp.
- Mỗi lỗi cần `type`, `detail`, `detailMeaning`, `cause`, câu hỏi xử lý và lựa chọn. Type/detail phải có trong log `observed-errors.json`; compiler dùng tiền tố `compiler error: `. Fixture chỉ chứng minh diagnostic được tái hiện, không chứng nhận sửa code của người học.
- Đọc giữ tiếng Anh trước, bản dịch trong phần mở theo thao tác; glossary của phase được liên kết để tra tại chỗ. Các bảng cấu trúc câu, debug và mẫu DSA cũng lấy từ Markdown gốc.
- Không thêm IPA thiếu nguồn kiểm chứng. Speech dùng giọng English có trên thiết bị. Không gắn nhãn “AI feedback” nếu chưa có tích hợp và cấu hình thực tế.

Nếu thay cấu trúc heading/bảng Markdown, cập nhật parser và test cùng lúc; bộ build cố ý từ chối nguồn thiếu hoặc sai liên kết.

## Kiểm tra trước PR

Từ gốc repo:

```bash
node scripts/build_catalogue.mjs
node scripts/build_catalogue.mjs --check
python3 scripts/error_examples.py --verify
python3 scripts/check_links.py
```

Trong `website`:

```bash
npm ci
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:browser
```

Build cần `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` như website hiện có; dùng `.env.local` theo `.env.example`. Không ghi khóa vào repo. Kiểm giao diện mặc định dưới `/JavaBackend_AI_RoadMap`; nếu build với basePath khác, chạy browser test với cùng `NEXT_PUBLIC_BASE_PATH`.

Browser test tự phục vụ `out/`, chặn request ra ngoài và kiểm tiến độ khách bằng localStorage/Web Locks thật. Có thể đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE` để dùng Chromium đã cài, `ENGLISH_SCREENSHOTS_DIR` để lưu ảnh. Không coi mô phỏng viewport là kiểm điện thoại vật lý, hay kiểm khách là kiểm đăng nhập Supabase thật.
