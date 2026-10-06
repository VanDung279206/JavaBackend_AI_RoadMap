# Kiểm chứng Java_Roadmap_V2

Ngày thực chạy: 2026-10-06 (Asia/Bangkok), trên Windows. Đây là kiểm bản tham chiếu và công cụ của repository, không phải bằng chứng người học đã hoàn thành.

| Kiểm tra | Kết quả |
| --- | --- |
| 23 ví dụ bài học: `scripts/check_lessons.py` | PASS, so stdout với kết quả trong `learning/courses.json` |
| 20 lời giải Java: `scripts/check.py --track java-pilot --mode solution --id all` | PASS JP01–JP20, gồm UTF-8, rollback trong bộ nhớ, snapshot và hai cập nhật đồng thời |
| Starter JP01, JP17, JP18 | Bị từ chối đúng: TODO, skip blank liên tiếp và overflow; không cấp PASS cho mã chưa sửa |
| `npm test` trong website | 27/27 PASS; gồm tách tài khoản/khách, dữ liệu hỏng, gợi ý theo lỗi, tạo đề cương, xuất UTF-8 và route tĩnh |
| `npm run lint` | PASS |
| `npm run build` và postbuild | PASS, 36 trang tĩnh; đủ 6 route học chặng và `/projects/mine` |
| Python unittest trong scripts/tests | 31/31 PASS |
| `scripts/check_links.py` | PASS 436 liên kết Markdown nội bộ; không kiểm network/link nhánh GitHub chưa push |
| `node scripts/build_catalogue.mjs --check`, `git diff --check` | PASS |

JDK thực chạy là 26.0.1, các checker biên dịch với `--release 17`. Python dùng runtime đi kèm Codex. Next.js build cần chạy ngoài sandbox vì Windows sandbox từ chối canonicalize đường dẫn; build sau đó thành công.

Đã kiểm giao diện bản static export trên localhost: chuyển bốn phần học, đánh dấu đã đọc giữ sau reload, bộ lọc bài Java và khóa thử thách, tạo đề cương từ ba chức năng, sửa Markdown và giữ bản sửa sau reload. Kiểm utility xuất file bằng test Blob/anchor với nội dung UTF-8; trình duyệt tự động không xác nhận được sự kiện download hoàn tất, nên không ghi download UI là PASS. Các test không tự gửi bài nộp hoặc cấp kết quả kiểm chứng.

## Phạm vi cần biết khi triển khai

- Đọc bài học, bằng chứng tự đối chiếu và đề cương lưu trên thiết bị theo tài khoản/khách; chưa đồng bộ máy chủ. Có nút tải bản lưu. Tiến độ bài tập và verified worker tiếp tục dùng hệ thống hiện có.
- Khi triển khai tài khoản, áp dụng lại [catalogue seed](../database/catalogue_seed.sql) để đăng ký JP01–JP20; chưa sửa database từ phiên này.
- Chấm Java/Maven trên web vẫn phụ thuộc worker cô lập; tự đánh dấu hoặc chạy solution không tạo verified PASS.
- Chưa push branch hoặc deploy website. Chưa thí điểm với người học mới; thời lượng và độ khó cần hiệu chỉnh từ dữ liệu học thực tế trước khi tăng số bài chặng khác.

Xem [lịch học](../learning/README.md), [20 bài Java](../java-pilot/EXERCISES.md) và [tiêu chí dự án riêng](MY_PROJECT.md).
