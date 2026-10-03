# Nâng cấp RoadMap_v3

Không chạy migration trên production trước khi sao lưu và kiểm tra trên staging.
Các migration cũ giữ nguyên. Schema khởi tạo cũ cần chạy V2/V3 như trước.

1. Sao lưu PostgreSQL bằng `pg_dump --format=custom --file=before-v3.dump "$DATABASE_URL"` trong môi trường quản trị riêng; không commit dump.
2. Chạy V4, `database/catalogue_seed.sql`, V5, V6 theo đúng thứ tự trong một database Supabase thử nghiệm. V4 thêm schema; seed lấy từ catalogue; V5 đặt FK; V6 mở rộng kho tài liệu.
3. `progress_unmapped_v3` giữ toàn bộ hàng không khớp phase/ID cũ, chỉ quản trị DB đọc được. Ánh xạ bằng tay vào catalogue sau khi xác minh, không tự đổi ID gần giống. Không xóa archive sau nâng cấp.
4. `done=true` cũ trở thành `self_completed`, tuyệt đối không nâng thành PASS. Quyền cập nhật profile chỉ cho username/avatar/display_name; is_admin chỉ quản trị DB thay đổi.
5. Frontend gọi RPC `save_learning_progress`, không upsert trực tiếp. Revision cũ gây `PROGRESS_CONFLICT`; UI yêu cầu chọn bản máy chủ hoặc giữ bản thiết bị. Bản khách chỉ nhập khi bấm nút; bài đã có ở tài khoản được giữ nguyên.
6. Thêm URL `/JavaBackend_AI_RoadMap/auth/reset` vào Supabase Auth Redirect URLs. Không đặt service-role key trong `NEXT_PUBLIC_*`.
7. Chạy regression SQL trong `database/tests/rls.sql` bằng database thử nghiệm và runner ngoài web theo [runner](../runner/README.md).

`learning/catalogue.json` là nguồn ID/phase/prerequisite/check. `learning/hints.json` và `sessions.json` tham chiếu ID đó. Sau chỉnh nội dung chạy `node scripts/build_catalogue.mjs`; CI dùng `--check` phát hiện bản sinh lệch.

Hai RPC tiến độ/nộp bài yêu cầu `p_owner` khớp `auth.uid()`; token đổi tài khoản trong khi request đang gửi bị từ chối bằng `ACCOUNT_CHANGED`. Client không thể dùng tham số này để mạo danh.

`python3 scripts/check_database.py` tạo container PostgreSQL 17 riêng, chạy V1–V6, regression quyền, Q01 và dump/restore vào DB trống rồi hủy container. Không nhận DATABASE_URL production. Fixture đã PASS; vẫn cần diễn tập staging với dữ liệu và Auth/Storage gateway thực trước nâng cấp.

Giữ nguyên localStorage v2. Bản nháp code cũ chỉ được sao chép vào khách qua nút “Nhập bản nháp v2”, không tự gán cho tài khoản đang đăng nhập. Tiến độ v3 dùng namespace tài khoản riêng. JSON dự phòng hỏng bị khóa ghi; sao lưu giá trị gốc trước khi sửa. Ghi chú và bookmark hiện cần mạng; hàng đợi offline chỉ áp dụng cho tiến độ.

Rollback ứng dụng cần giữ V4–V6; bản web cũ ghi trực tiếp progress sẽ bị từ chối. Không rollback quyền ghi để cứu frontend cũ. Khôi phục database bằng `pg_restore --dbname="$RESTORE_DATABASE_URL" before-v3.dump` vào DB trống, đối chiếu số hàng và chạy RLS trước khi đổi cấu hình.
