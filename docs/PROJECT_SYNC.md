# Đồng bộ bản nháp dự án — bước đầu của đồng bộ giữa thiết bị

Chỉ áp dụng cho khu Dự án của tôi. Bài học và tiếng Anh vẫn lưu riêng trên thiết bị, có xuất/nhập JSON; đây chưa phải hoàn tất toàn bộ hạng mục 2 của backlog.

## Hành vi

- Khách giữ bản riêng trên thiết bị. Đăng nhập không tự nhập bản khách; dùng JSON nếu muốn chuyển. Bản cũ đã gắn tài khoản được giữ và đồng bộ khi mở dự án.
- Mỗi thay đổi lưu bằng Web Locks trên thiết bị trước. Sau 750 ms ngừng sửa, hoặc khi kết nối lại/bấm đồng bộ, client kiểm tra máy chủ. Khi đang mở, kiểm tra thêm mỗi 30 giây. Đóng trang rồi mở lại tiếp tục từ bản lưu; không cần một hàng đợi chỉ tồn tại trong RAM.
- Metadata gồm phiên bản, revision máy chủ và SHA-256 của nội dung đã xác nhận, tách theo owner. Không dùng đồng hồ của thiết bị để chọn bên thắng. Khóa đồng bộ mạng tách khỏi khóa lưu bản nháp để mạng chậm không khóa nhập liệu. Hạn chờ 15 giây bao cả bước SDK chuẩn bị xác thực/header, kể cả khi SDK không phản hồi tín hiệu hủy. Không phụ thuộc AbortSignal.any/timeout. Gỡ component (kể cả đăng xuất/đổi tài khoản) hủy yêu cầu đang chờ khóa và request mạng bằng cùng tín hiệu vòng đời.
- Thiết bị sạch nhận bản mới từ máy chủ. Thiết bị có thay đổi và máy chủ cũng đổi sẽ dừng để chọn; có thể tải cả hai JSON. Trước lựa chọn thay thế, lưu cả hai vào bản dự phòng xung đột gần nhất. Không đủ bộ nhớ để lưu dự phòng thì không thay thế. Một lựa chọn cũ không được ghi đè thay đổi xuất hiện sau màn hình so sánh.
- Chỉ báo đã đồng bộ sau khi máy chủ xác nhận, hoặc đọc được nội dung giống hệt. Nếu đang gửi mà người học tiếp tục sửa, phần mới vẫn chờ lượt tiếp theo. Mất response sau commit được nhận ra bằng nội dung, tránh gửi trùng revision.
- Dữ liệu máy chủ sai cấu trúc, bản lưu/metadata hỏng, đổi tài khoản hoặc lỗi mạng không được ghi đè bản trên thiết bị. Kết quả verified không thuộc bảng này; checklist chỉ là tự khai báo.

## Triển khai và migration

Chạy `database/migrations/V7__project_drafts.sql` rồi `database/migrations/V8__project_draft_unicode.sql` sau V6, trước khi deploy website mới. Migration chỉ tạo bảng/hàm/policy mới, không sửa các migration đã chạy, không cập nhật/xóa dữ liệu cũ. Database không có V7: soạn dự án và xuất/nhập JSON vẫn hoạt động; trạng thái đồng bộ báo chưa xác nhận. Regression trình duyệt trả lỗi PostgREST 404 khi thiếu bảng/RPC và kiểm soạn, reload, tải JSON vẫn giữ dữ liệu.

Bảng `project_drafts` có một hàng mỗi owner, revision và JSON có schema cố định. RPC kiểm auth.uid và p_owner, kiểm schema/kích thước, dùng advisory transaction lock cộng revision để từ chối ghi cũ. Browser chỉ có SELECT hàng của chính mình và quyền EXECUTE RPC; không có INSERT/UPDATE/DELETE trực tiếp. Anon không đọc/ghi; quyền admin trình duyệt không mở dữ liệu người khác. Mỗi trường 50.000 đơn vị UTF-16, mỗi đề cương 1.710.000 đơn vị UTF-16, payload tối đa 32 MiB; chỉ 29 khóa định nghĩa, checklist sáu boolean. Không lưu secrets hoặc thông tin riêng không cần thiết vào đề cương.

Rollback vận hành bằng deploy lại website cũ: bản trên thiết bị vẫn có cùng key/định dạng. Giữ nguyên V7/V8 và dữ liệu máy chủ để nâng cấp lại; không DROP bảng khi rollback. Nếu cần ngừng RPC, dùng migration tiến mới để thu hồi EXECUTE, sau khi sao lưu. Không có down migration phá hủy dữ liệu; việc xóa bản cloud là thay đổi riêng cần chính sách giữ dữ liệu.

## Kiểm chứng

`npm test` chạy production sync engine với adapter mạng/lưu trữ giả lập: legacy migration, thiết bị mới, offline/reload, mất ACK, nhập trong lúc gửi/tải, hai writer, revision cũ, quota, lựa chọn xung đột cũ và đổi tài khoản. Playwright chạy bản export với hai browser context độc lập và API giả lập; không gọi tài khoản Supabase thật.

`scripts/check_database.py` áp dụng V7/V8 và `database/tests/project_drafts.sql` trên PostgreSQL 17, rồi chạy lại assertion sau dump/restore. Kiểm quyền anon/owner, account-change, revision cũ, schema/độ dài sai và cấm ghi trực tiếp. Migration tạo bảng mới nên không có backfill khối lượng lớn hoặc khóa ghi bảng tiến độ cũ. Cần staging với cấu hình Supabase triển khai thực trước phát hành; kiểm ở container không thay cho thử nghiệm đăng nhập/network production.


## Review Unicode và vòng đời đồng bộ ngày 16/10/2026

- Parser từ chối NUL và surrogate lẻ vì JSONB không lưu được các chuỗi này. Cặp surrogate hợp lệ (emoji/ký tự ngoài BMP) vẫn dùng được đúng giới hạn. Bản lưu cũ không hợp lệ được giữ nguyên để xuất; không thay ký tự hoặc tự cắt nội dung.
- V7 đếm Unicode code point, khác `String.length`/maxlength của trình duyệt. V8 thêm validator UTF-16 tại RPC; không thay hàm/constraint V7 để bản cũ vượt giới hạn vẫn dump/restore được. Không viết lại hay xóa các hàng legacy. Dữ liệu legacy không đọc được trong ứng dụng cần được xuất và sửa có chủ đích; migration không tự rút gọn dữ liệu người học. Fixture kiểm V7 chấp nhận 25.001 emoji, V8 từ chối ghi mới nhưng vẫn giữ hàng cũ; sau restore kiểm lại. Biên hợp lệ 25.000 emoji và biên đề cương cũng có assertion.
- Tên dài trong khung xung đột hiển thị tối đa 120 code point và xuống dòng ở mobile; tải JSON vẫn giữ nguyên tên 5.000 ký tự trong regression.
- Khi component bị gỡ, hủy request mạng cùng yêu cầu chờ Web Lock. Regression giữ khóa bằng tab khác, đăng xuất ngay trong trang rồi yêu cầu hàng chờ khóa về 0; không dựa vào việc đóng tài liệu vốn đã tự hủy khóa.

Trước sửa: parser không ném lỗi với ký tự không lưu được; khung xung đột tràn 390px; sau đăng xuất vẫn còn một request chờ khóa. Các log `checks/review12-*-before.log` là kết quả tái hiện, không phải kiểm PASS. Kiểm sau sửa và CI được cập nhật trong mô tả PR; không dùng kết quả commit cũ thay cho commit mới.

## Review tiến độ bài tập ngày 17/10/2026

Phạm vi review bổ sung gồm store tiến độ dùng chung với khu dự án. Tái hiện được mất thay đổi của tab khác khi phản hồi RPC hoặc thao tác giải quyết xung đột hoàn thành trước sự kiện `storage`. Các đường nhận phản hồi RPC, chọn bản xung đột, sửa trạng thái và nhập lịch ôn nay đọc lại hàng đợi đã lưu trước khi cập nhật: giữ bài khác, giữ nội dung mới của cùng bài, không hạ revision hoặc tạo lại bài đã bị bỏ. Chỉ gỡ cờ chờ khi nội dung gửi vẫn khớp; nội dung sửa trong lúc chờ tiếp tục đồng bộ với revision đã xác nhận. ACK sai revision không được coi là thành công.

Lựa chọn xung đột cũ bị từ chối nếu bài đã đổi trong lúc tải; lỗi mạng, hàng máy chủ sai cấu trúc và bản lưu hỏng không ghi đè dữ liệu. Chuỗi lưu rỗng được coi là dữ liệu hỏng, khác với key chưa tồn tại. Kiểm thử dùng store production, trì hoãn phản hồi và cố ý chưa phát sự kiện storage; không dựa vào thời gian mạng thật. Tất cả đường đọc–sửa–ghi tiến độ nay chạy trong khóa `progress:<storageKey>` ngắn: tải bản máy chủ, ACK, sửa trạng thái, nhập khách/CLI và chọn bản xung đột. Khóa `learning-sync:<owner>` riêng tuần tự hóa RPC giữa các tab; không giữ khóa lưu khi chờ mạng. Mỗi SDK operation có deadline 15 giây. Đổi tài khoản hủy yêu cầu chờ khóa và mạng, rồi kiểm owner/epoch lần nữa trong khóa. Sự kiện storage chỉ đọc lại bản lưu, không khởi động lại request tải máy chủ hoặc hủy sửa đang chờ. Trình duyệt thiếu Web Locks từ chối ghi, giữ bản cũ.

Giao diện nhập lịch ôn đợi kết quả ghi thực, hiển thị đang lưu và khóa nút lặp. Rời trang khi còn ghi chờ sẽ có cảnh báo của trình duyệt. Regression có khóa giữ từ tab khác, ghi đồng thời hai bài, ACK xen với sửa, cloud lock chậm, hủy khi đăng xuất, và reload sau lưu.
