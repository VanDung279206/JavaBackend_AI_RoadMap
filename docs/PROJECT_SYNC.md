# Đồng bộ bản nháp dự án — bước đầu của đồng bộ giữa thiết bị

Chỉ áp dụng cho khu Dự án của tôi. Bài học và tiếng Anh vẫn lưu riêng trên thiết bị, có xuất/nhập JSON; đây chưa phải hoàn tất toàn bộ hạng mục 2 của backlog.

## Hành vi

- Khách giữ bản riêng trên thiết bị. Đăng nhập không tự nhập bản khách; dùng JSON nếu muốn chuyển. Bản cũ đã gắn tài khoản được giữ và đồng bộ khi mở dự án.
- Mỗi thay đổi lưu bằng Web Locks trên thiết bị trước. Sau 750 ms ngừng sửa, hoặc khi kết nối lại/bấm đồng bộ, client kiểm tra máy chủ. Khi đang mở, kiểm tra thêm mỗi 30 giây. Đóng trang rồi mở lại tiếp tục từ bản lưu; không cần một hàng đợi chỉ tồn tại trong RAM.
- Metadata gồm phiên bản, revision máy chủ và SHA-256 của nội dung đã xác nhận, tách theo owner. Không dùng đồng hồ của thiết bị để chọn bên thắng. Khóa đồng bộ mạng tách khỏi khóa lưu bản nháp để mạng chậm không khóa nhập liệu.
- Thiết bị sạch nhận bản mới từ máy chủ. Thiết bị có thay đổi và máy chủ cũng đổi sẽ dừng để chọn; có thể tải cả hai JSON. Trước lựa chọn thay thế, lưu cả hai vào bản dự phòng xung đột gần nhất. Không đủ bộ nhớ để lưu dự phòng thì không thay thế. Một lựa chọn cũ không được ghi đè thay đổi xuất hiện sau màn hình so sánh.
- Chỉ báo đã đồng bộ sau khi máy chủ xác nhận, hoặc đọc được nội dung giống hệt. Nếu đang gửi mà người học tiếp tục sửa, phần mới vẫn chờ lượt tiếp theo. Mất response sau commit được nhận ra bằng nội dung, tránh gửi trùng revision.
- Dữ liệu máy chủ sai cấu trúc, bản lưu/metadata hỏng, đổi tài khoản hoặc lỗi mạng không được ghi đè bản trên thiết bị. Kết quả verified không thuộc bảng này; checklist chỉ là tự khai báo.

## Triển khai và migration

Chạy `database/migrations/V7__project_drafts.sql` sau V6, trước khi deploy website mới. Migration chỉ tạo bảng/hàm/policy mới, không sửa các migration đã chạy, không cập nhật/xóa dữ liệu cũ. Database không có V7: soạn dự án và xuất/nhập JSON vẫn hoạt động; trạng thái đồng bộ báo chưa xác nhận.

Bảng `project_drafts` có một hàng mỗi owner, revision và JSON có schema cố định. RPC kiểm auth.uid và p_owner, kiểm schema/kích thước, dùng advisory transaction lock cộng revision để từ chối ghi cũ. Browser chỉ có SELECT hàng của chính mình và quyền EXECUTE RPC; không có INSERT/UPDATE/DELETE trực tiếp. Anon không đọc/ghi; quyền admin trình duyệt không mở dữ liệu người khác. Mỗi trường 50.000 ký tự, mỗi đề cương 1.710.000 ký tự, payload tối đa 32 MiB; chỉ 29 khóa định nghĩa, checklist sáu boolean. Không lưu secrets hoặc thông tin riêng không cần thiết vào đề cương.

Rollback vận hành bằng deploy lại website cũ: bản trên thiết bị vẫn có cùng key/định dạng. Giữ nguyên V7 và dữ liệu máy chủ để nâng cấp lại; không DROP bảng khi rollback. Nếu cần ngừng RPC, dùng migration tiến mới để thu hồi EXECUTE, sau khi sao lưu. Không có down migration phá hủy dữ liệu; việc xóa bản cloud là thay đổi riêng cần chính sách giữ dữ liệu.

## Kiểm chứng

`npm test` chạy production sync engine với adapter mạng/lưu trữ giả lập: legacy migration, thiết bị mới, offline/reload, mất ACK, nhập trong lúc gửi/tải, hai writer, revision cũ, quota, lựa chọn xung đột cũ và đổi tài khoản. Playwright chạy bản export với hai browser context độc lập và API giả lập; không gọi tài khoản Supabase thật.

`scripts/check_database.py` áp dụng V7 và `database/tests/project_drafts.sql` trên PostgreSQL 17, rồi chạy lại assertion sau dump/restore. Kiểm quyền anon/owner, account-change, revision cũ, schema/độ dài sai và cấm ghi trực tiếp. Migration tạo bảng mới nên không có backfill khối lượng lớn hoặc khóa ghi bảng tiến độ cũ. Cần staging với cấu hình Supabase triển khai thực trước phát hành; kiểm ở container không thay cho thử nghiệm đăng nhập/network production.
