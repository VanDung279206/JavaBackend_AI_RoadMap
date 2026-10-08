# QUALITY03 — Cấu hình, Docker và CI có bằng chứng

## Mục tiêu và kiến thức trước

Tách config khỏi code; phân biệt test, đóng gói và chạy lại môi trường.

**Cần biết trước:** QUALITY01; biến môi trường và lệnh terminal.

## Tình huống

Một app chạy trên máy bạn nhưng không chạy ở máy khác vì hardcode cổng/database. Bạn cần cấu hình có mặc định và checklist tái hiện.

## Ví dụ chạy được

Lệnh từ gốc repository: `py learning/examples/QUALITY03.py`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```python
import os
def port(config):
    value=int(config.get("PORT","8080"))
    if not 1 <= value <= 65535:
        raise ValueError("invalid port")
    return value
print(port({}))
print(port({"PORT":"9090"}))
try:
    port({"PORT":"0"})
except ValueError as error:
    print(str(error))
```

**Diễn giải từng bước:**

1. Ví dụ cô lập validation config; config thật đọc biến môi trường và không log secret.
2. Dockerfile mô tả build/run, compose nối app với DB, readiness khác process đã khởi động.
3. P4.3 chạy Docker từ checkout sạch và probe HTTP; P4.4 ghi CI URL+commit+logs. File YAML hoặc Maven PASS không chứng minh container/CI đã chạy.

**Kết quả:**

```text
8080
9090
invalid port
```

## Lỗi thường gặp

**Nhận biết:** Commit credentials, thiếu env mẫu, pipeline xanh nhưng không chạy assertion đúng.

**Cách sửa:** Dùng .env.example không có secret, healthcheck và lệnh test thật. Lưu commit, phiên bản, logs và request sau restart.

## Kiểm tra hiểu bài

Nếu mới build image nhưng chưa khởi chạy container thì có đánh dấu vận hành hoàn tất không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P4.3, P4.4, O01. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
