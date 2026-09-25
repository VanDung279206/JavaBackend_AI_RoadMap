# Hệ thống tự ôn

Mục tiêu thực hành: nhớ để tự giải thích và tự viết lại, đồng thời phát hiện phần chưa hiểu qua lỗi của chính mình. Tự truy hồi và học cách quãng được nghiên cứu trong các thí nghiệm về ghi nhớ; không có lịch cố định bảo đảm kết quả cho mọi người hoặc mọi nội dung.

Nguồn nghiên cứu: [The critical importance of retrieval for learning](https://pubmed.ncbi.nlm.nih.gov/18276894/), [Spacing effects in learning](https://pubmed.ncbi.nlm.nih.gov/19076480/). Lịch dưới đây là đề xuất tổ chức học, không phải khoảng cách tối ưu được hai nghiên cứu xác lập cho Java.

## Chu trình một bài

1. Đọc đề và viết lại hợp đồng input/output bằng lời của mình.
2. Tự làm một ví dụ bằng tay, rồi viết mã.
3. Nếu mắc, đọc gợi ý trước khi xem lời giải.
4. Chạy kiểm tra; ghi lỗi cụ thể và nguyên nhân đã xác minh.
5. Đóng lời giải, viết lại phần chính từ trí nhớ.
6. Giải thích cách làm bằng tiếng Việt và một câu tiếng Anh ngắn.
7. Đặt lần ôn tiếp theo trong bảng theo dõi.

## Lịch ôn gợi ý

| Mốc tính từ ngày học | Việc cần làm |
| --- | --- |
| D0 | Tự làm bài, xem phản hồi, viết lại phần sai |
| D1 | Trả lời câu hỏi nhớ lại, viết pseudocode mà không mở đáp án |
| D3 | Viết lại mã với dữ liệu khác |
| D7 | Làm một biến thể; giải thích độ phức tạp và lỗi biên |
| D14 | Trộn bài này với một chủ đề khác, tự chọn pattern |
| D30 | Kiểm tra lại từ đầu và áp dụng vào dự án |

Nếu không nhớ hoặc cần gợi ý, quay lại một mốc ôn gần hơn. Nếu giải đúng và giải thích được, tiếp tục mốc xa hơn. Đây là lịch tự theo dõi; repo không tự gửi nhắc nhở.

## Chấm để quyết định lần ôn sau

| Điểm tự chấm | Quan sát thực tế | Bước tiếp theo |
| --- | --- | --- |
| 0 | Chưa bắt đầu được hoặc sai ý chính | Đọc lại ví dụ, ghi nguyên nhân, thử lại sớm |
| 1 | Làm được sau gợi ý | Ôn lại cùng dạng với input khác |
| 2 | Tự giải đúng, giải thích được | Chuyển sang biến thể và mốc ôn xa hơn |

Đây là thang tự quản lý do người soạn đề xuất, không phải thang đo năng lực đã chuẩn hóa.

## Cách phối hợp ba mảng

Trong một buổi, chọn một bài phase, một bài DSA phù hợp và một nhóm từ vựng nhỏ. Khi gặp từ trong mã hoặc tài liệu, dùng nó trong một câu mô tả chính bài đang làm. Kết thúc bằng hai câu hỏi trong [FLASHCARDS.md](FLASHCARDS.md).

Ví dụ: học ownership → làm P4.1 → ôn D12 → viết “Authorization checks whether the user may read the document.” Khi ôn DSA, dùng mẫu giải thích ở [PATTERNS.md](../dsa/PATTERNS.md).

## Theo dõi

| Mã bài | Ngày học | Ngày ôn kế tiếp | Điểm 0/1/2 | Lỗi còn mắc | Bằng chứng |
| --- | --- | --- | --- | --- | --- |
| Điền mã | Điền ngày | Điền ngày | Tự chấm | Mô tả cụ thể | File/commit/kết quả |

## Dùng lỗi để chọn bài ôn

Ghi ID, input làm sai, tag lỗi và mức gợi ý đã dùng bằng `scripts/review.py record`. Xem `due` cho bài đến hạn và `recommend` cho bài liên quan. Chọn bài phù hợp kiến thức hiện tại; nếu gợi ý một phase chưa học, ghi lại để làm sau. Chi tiết [quy tắc lịch ôn và 32 buổi](../learning/README.md).