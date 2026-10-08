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

## Kiểm chứng bốn lỗi trước merge — 2026-10-07

- `npm test`: 35/35 PASS. Hai tab mô phỏng dùng chung storage và khóa ghi, không gửi sự kiện `storage`: giữ JAVA01/JAVA02, ghép read/evidence trên cùng bài, ghép các trường và các ô checklist dự án. Nhập liệu hiển thị ngay và không bị bản lưu trước kéo lùi khi nhiều lần lưu đang chờ.
- Dữ liệu `data` 49.000 ký tự tạo đề cương hơn 50.000 ký tự và đọc/lưu lại được. Kiểm cả trường hợp mọi trường đạt giới hạn 50.000 ký tự, có/không có user stories tự viết; đề cương và bản trước đều hợp lệ. Các giá trị vượt giới hạn vẫn bị từ chối.
- Lỗi validation, lỗi sinh đề cương và quota đều giữ bản đã lưu và cho phép sửa/thử lại. Kiểm render `ProjectPlanner`: fieldset/textarea vẫn mở sau lỗi sinh đề cương, chỉ khóa khi bản lưu hỏng. Thiếu Web Locks từ chối ghi an toàn và giữ bản xuất.
- JP01–JP20 PASS với `--release 17`. JP15 kiểm `|`, CR/LF ở đầu, cuối và giữa tiêu đề; so byte file trước/sau để chứng minh validation lỗi không ghi một phần dữ liệu.
- Kiểm lời giải sai trên bản sao tạm: checker từ chối JP15 cũ (strip trước validation), JP13 chỉ sắp theo ID, JP13 bỏ sắp ID khi cùng tiêu đề và JP13 đảo thứ tự ID khi cùng tiêu đề.
- `npm run lint`, `npm run build` và postbuild PASS: 36 trang tĩnh, đủ 6 chặng và trang dự án riêng. `node scripts/build_catalogue.mjs --check` và `git diff --check` PASS. Đã sinh lại lời giải JP15 trong danh mục website.

Các ca đồng thời ở trên chạy bằng harness với hai ngữ cảnh độc lập và hàng đợi khóa dùng chung; không ghi nhận chúng là kiểm trình duyệt thực. Khóa ghi cần Web Locks trên HTTPS/localhost; khi hai tab sửa cùng một trường, lần ghi sau trong khóa có hiệu lực. Bản nháp vẫn lưu tại thiết bị.

## Kiểm review Dung06-tech về xuất JSON — 2026-10-08

- `npm test`: 40/40 PASS. Giữ Web Lock bằng ngữ cảnh khác, đổi `Original` → `Updated` → `Latest`, kiểm cả trang dự án và bài học: trạng thái báo đang lưu, nút tải JSON khóa, handler cũ cũng không xuất dữ liệu cũ. Giữ khóa thêm giữa hai lần ghi để xác nhận chỉ mở xuất khi hết hàng đợi; JSON sau đó chứa `Latest`.
- Bản lưu bị hỏng vẫn xuất đúng byte gốc ở cả hai trang. Lỗi ghi do quota kết thúc trạng thái đang lưu, báo lỗi và không xuất giá trị chỉ có trên giao diện.
- `npm run lint`, `npm run build` và postbuild PASS; 36 trang tĩnh. `git diff --check` và `node scripts/build_catalogue.mjs --check` PASS.

Các ca giữ khóa và click handler dùng harness trên logic thực tế và render component, chưa phải kiểm thử trình duyệt.

## Kiểm nâng cấp nhập bản lưu và bảo vệ tiến độ — 2026-10-08

- `npm test`: 48/48 PASS. Nhập dự án được kiểm định dạng trước khi ghi và đọc lại được sau reload; nhập bài học giữ các ID vắng trong file. Hai ngữ cảnh giữ khóa chứng minh bản xem trước cũ không ghi đè dữ liệu vừa sửa ở tab khác. Nhập bị từ chối khi đang lưu hoặc bản hiện tại bị hỏng.
- Component nhập JSON được kiểm chọn file → xem trước → áp dụng/hủy, file sai schema, JSON hỏng, lỗi đọc và file quá lớn; chọn file không tự sửa dữ liệu. Nhập lỗi vẫn cho chọn lại/thử lại.
- Kiểm `beforeunload`: yêu cầu cảnh báo khi còn ghi chờ; hết ghi thành công hoặc thất bại thì bỏ cảnh báo. Handler kiểm chứng từ màn hình cũ bị từ chối nếu bằng chứng đã được tab khác sửa; không ghi timestamp xác nhận cho bằng chứng chưa xem.
- `npm run lint`, `npm run build` và postbuild PASS, 36 trang tĩnh. Kiểm bằng harness và render component; chưa ghi nhận luồng chọn file/cảnh báo native là kiểm trình duyệt thực.

## Phạm vi cần biết khi triển khai

- Đọc bài học, bằng chứng tự đối chiếu và đề cương lưu trên thiết bị theo tài khoản/khách; chưa đồng bộ máy chủ. Có nút tải bản lưu. Tiến độ bài tập và verified worker tiếp tục dùng hệ thống hiện có.
- Khi triển khai tài khoản, áp dụng lại [catalogue seed](../database/catalogue_seed.sql) để đăng ký JP01–JP20; chưa sửa database từ phiên này.
- Chấm Java/Maven trên web vẫn phụ thuộc worker cô lập; tự đánh dấu hoặc chạy solution không tạo verified PASS.
- Branch đang được review trong PR #9; chưa deploy website. Chưa thí điểm với người học mới; thời lượng và độ khó cần hiệu chỉnh từ dữ liệu học thực tế trước khi tăng số bài chặng khác.

Xem [lịch học](../learning/README.md), [20 bài Java](../java-pilot/EXERCISES.md) và [tiêu chí dự án riêng](MY_PROJECT.md).
