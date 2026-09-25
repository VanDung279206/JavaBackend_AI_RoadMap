# Thay đổi bản cải tiến — 24/09/2026

- Thêm Phase 0 với chương trình mẫu và bài debug.
- Tách starter/tests/solution, 41 nhóm có runner chọn ID và JUnit adapter.
- Thêm SQL starter/test, bản copy Spring có TODO và bản đồ đủ 24 bài.
- Thêm D13–D15, V01–V12, tám bài debug và sáu kiểm tra cuối phase.
- Thêm CLI, ứng dụng Spring tham chiếu, profile database/AI, migration, tests, Docker và CI.
- Thêm luyện viết tiếng Anh, mức tự làm và hàng đợi ôn tập cục bộ.
- Giữ nội dung 24 bài, 12 DSA gốc, glossary, flashcards và labs trước đó.
- Ghi rõ phần đã thực thi và phần cần xác minh trong VALIDATION.md.

---

# Lịch sử thay đổi

## Bản mở rộng — 23/09/2026

- Thêm 24 bài và lời giải cho sáu phase.
- Thêm 12 bài DSA với lời giải Java, giải thích invariant, độ phức tạp và lỗi thường gặp.
- Thêm 72 mục từ vựng Anh–Việt, ví dụ song ngữ và sáu đoạn luyện đọc.
- Thêm 36 câu hỏi tự nhớ lại, lịch ôn gợi ý và mẫu nhật ký lỗi.
- Thêm mã Java thuần cho bài tập và bộ kiểm tra có thể chạy bằng JDK/Python.
- Thêm SQL fixture, bộ câu hỏi đánh giá RAG và phạm vi xác minh.

## v1 — /09/2026

- Thêm doctor, Maven Wrapper launcher có pin version và verify offline/integration/live, báo cáo phân biệt PASS/FAIL/BLOCKED; cold bootstrap chưa thành công trong môi trường soạn.
- Thêm 32 buổi, 51 bộ gợi ý ba cấp, CLI learn, 14 tag lỗi và ôn theo lỗi; giữ dữ liệu review cũ; không tăng stage hai lần cùng ngày.
- Thêm M01–M08: DSA trộn có starter, lời giải, oracle tests và rubric lựa chọn thuật toán.
- Thêm C01–C03: tranh chấp phiên bản, duplicate request theo owner/key và timeout/cancellation; kiểm tra đa luồng bằng latch.
- Thay hợp đồng PUT: expectedVersion bắt buộc, version cũ trả409; thêm HTTP regression và PostgreSQL ConcurrentIT. Đây là thay đổi không tương thích với client PUT cũ thiếu trường này.
- Thêm 8 lỗi tiếng Anh từ fixture đã chạy, nguyên văn diagnostic, chẩn đoán và câu mô tả; không gán các lỗi này cho máy của người học.
- Bổ sung 16 test Python cho công cụ tiến độ và tính trung thực của report. Tích hợp Spring/PostgreSQL/Docker/AI vẫn phải chạy khi đủ môi trường; xem VALIDATION.