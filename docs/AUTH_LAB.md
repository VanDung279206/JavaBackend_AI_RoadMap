# U01 — Tài khoản, quyền quản trị và RLS

Tiên quyết: P4.1, P2.4. Supabase dùng PostgreSQL và supabase-js v2; giữ migration V1–V3, nâng cấp qua V4–V6. Tài khoản Auth và profile khác trách nhiệm: người dùng được đổi nhãn hồ sơ nhưng không tự sửa is_admin. RLS quyết định đọc/ghi hàng; column privileges chặn sửa trường nhạy cảm ngay cả khi hàng thuộc chính mình.

Starter: clone database thử nghiệm và áp dụng [migration](UPGRADE_V3.md); viết dự đoán cho từng khối trong [rls.sql](../database/tests/rls.sql) trước khi chạy. Không dùng database production cho fixture kiểm thử.

```bash
python3 scripts/check_database.py
```

Cơ bản: An ghi progress P1.1; Binh không đọc được hàng đó. Trung bình: thử phase 06_RAG với ID P1.1, ID FAKE, status tested_pass, hoặc UPDATE is_admin=true. Tất cả phải bị từ chối. Nâng cao: hai phiên An cùng revision=1; đúng một được ghi, phiên còn lại nhận PROGRESS_CONFLICT. Fake PASS qua INSERT submissions không được phép; client chỉ được gọi RPC không nhận verdict/score.

Test có fixture hai tài khoản, role authenticated, JWT subject, rollback cuối file; được chạy bằng PostgreSQL thật qua Docker. Bootstrap mô phỏng tối thiểu Auth/Storage schema để kiểm policy DB, không kiểm SMTP, email reset, refresh token hoặc toàn bộ gateway Supabase. Những phần đó cần staging credentials và kiểm thử riêng.

Ba gợi ý: (1) frontend ẩn nút admin có ngăn request HTTP trực tiếp không? (2) đổi claim subject từ An sang Binh nhưng giữ resource ID, (3) dùng USING/WITH CHECK cho ownership, giới hạn UPDATE theo cột, RPC lấy auth.uid ở DB và dùng revision để phát hiện xung đột.

Lời giải: [V4](../database/migrations/V4__learning_evidence.sql) và [V5](../database/migrations/V5__catalogue_constraints.sql). Nguyên nhân: tin user_id hoặc verdict từ client sẽ cho phép mạo danh/chứng nhận; check catalogue tại DB tránh bỏ qua frontend. Biến thể: admin được duyệt tài liệu nhưng vẫn không được tự tạo grade, và không thấy nội dung ghi chú cá nhân qua bảng xếp hạng.

Quên mật khẩu: dùng email reset rồi trang `/auth/reset`; kết quả UI chỉ ghi thành công sau updateUser không lỗi. Xác minh thực bằng tài khoản staging và inbox của người kiểm thử, không gửi reset thử vào tài khoản người khác.

Tham khảo [Supabase password auth](https://supabase.com/docs/guides/auth/passwords) và [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
