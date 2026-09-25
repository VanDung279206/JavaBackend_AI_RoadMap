# Theo dõi bằng khả năng tự làm

Không đánh dấu hoàn thành chỉ vì đã đọc hoặc test lời giải tham chiếu pass.

| Mức | Bằng chứng |
| --- | --- |
| 0 — Chưa thử | Chưa có bài làm |
| 1 — Có hỗ trợ | Làm được khi đọc gợi ý/lời giải; ghi rõ hỗ trợ đã dùng |
| 2 — Tự làm | Đóng lời giải, test mã của mình pass, giải thích được một input biên |
| 3 — Chuyển giao | Làm lại sau một buổi khác với biến thể/dữ liệu mới và giải thích invariant |

Mức là quy ước tự theo dõi của repo, không phải điểm đánh giá năng lực nghề nghiệp đã được chuẩn hóa.

| Ngày | ID | Mức | Lỗi hoặc gợi ý đã dùng | Bằng chứng file/commit | Lần ôn kế tiếp |
| --- | --- | --- | --- | --- | --- |
| Điền khi học | P1.1 | 0 | — | — | — |

Dùng `review/STUDY_SYSTEM.md`, `review/ERROR_LOG.md` và bài biến thể để chọn việc cần ôn. Có thể dùng công cụ lịch ôn cục bộ:

```bash
python3 scripts/review.py due
python3 scripts/review.py record P1.1 --result pass --evidence "commit abc123; tự viết lại và thêm test tab"
```

`abc123` ở trên là chỗ điền commit thực tế của bạn. Chương trình ghi vào `progress/review-state.json`; không gửi thông báo tự động. `pass` không dùng gợi ý ở ngày mới đi tiếp khoảng cách 1,3,7,14,30 ngày; ghi nhiều lần cùng ngày không tăng stage. `partial` hoặc pass có gợi ý giữ stage và ôn sau 1 ngày; `fail` về stage -1 và ôn sau 1 ngày. Stage chỉ là chỉ số lịch ôn, không phải mức mastery trong bảng. Đây là lịch gợi ý có thể điều chỉnh, không cam kết hiệu quả ghi nhớ cho mọi người.

Bản v3 thêm `--tags overflow,off-by-one` và `--hint 0|1|2|3`. `review.py tags` liệt kê tag; `review.py recommend` gợi ý bài khác từ các lỗi chưa khắc phục. Pass không gợi ý xóa tag đang mắc của bài, giữ lịch sử. Học cách dùng tại [learning](../learning/README.md). Lịch buổi và lịch ôn là hai file riêng, ghi nhận buổi không tự đánh dấu test pass.