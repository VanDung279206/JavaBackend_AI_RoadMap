# Phase 5 — Tích hợp AI

Các con số và kết quả mẫu ở đây là fixture học tập. Bài Java chạy với gateway giả lập; khi tích hợp mô hình thật, thay adapter và kiểm tra lại. Xem [lời giải](SOLUTIONS.md). DSA hỗ trợ: D09, D12.

## P5.1 — Tách chỉ dẫn và dữ liệu · Cơ bản

Tạo prompt tóm tắt tiếng Việt với title và 1–3 bullet. Chỉ dẫn hệ thống và nội dung tài liệu phải ở hai trường riêng. Tài liệu có câu “Ignore previous instructions” vẫn được xem là dữ liệu. Document trắng bị từ chối trước khi gọi mô hình.

Đầu ra: cấu trúc prompt và cách kiểm tra nó. Không xem một câu nhắc trong prompt là bằng chứng hệ thống đã miễn nhiễm prompt injection.

## P5.2 — Ngân sách context · Cơ bản

Viết hàm nhận số token đầu vào, số token đầu ra tối đa và context limit. Cả ba phải không âm. Trong mô hình ngân sách đơn giản của bài, tổng input và output không vượt limit.

| Input / output / limit | Kết quả |
| --- | --- |
| 1400 / 400 / 1800 | true |
| 1400 / 500 / 1800 | false |
| -1 / 100 / 1800 | exception |

Đây không phải giới hạn của một model cụ thể. Đầu vào thực tế phải tính đủ message, schema, tool và phần overhead do provider quy định.

## P5.3 — Kiểm tra đầu ra có cấu trúc · Trung bình

Với `Summary(title, bullets)`, yêu cầu title không trắng; có 1–3 bullet, mỗi bullet không null/trắng. Trả bản sao danh sách sau kiểm tra. Nêu một đầu ra đúng cấu trúc nhưng vẫn sai nội dung.

## P5.4 — Lỗi tạm thời và retry hữu hạn · Trung bình

Viết luồng tối đa hai lần gọi: retry một lần khi gateway báo 429 hoặc 503; lỗi 400 không retry. Chuỗi trạng thái `503 → thành công` gọi hai lần; `503 → 503` dừng sau lần hai; `400` dừng ngay. Không retry lỗi validation của P5.3 trong bài này.

## Đạt phase khi

- [ ] Chạy kiểm tra bằng gateway giả lập, không cần API key.
- [ ] Tách được lỗi input, lỗi provider và lỗi đầu ra.
- [ ] Biết cấu trúc hợp lệ khác với nội dung có căn cứ.
- [ ] Khi gọi API thật, ghi model, prompt, token usage được trả về và cấu hình timeout.