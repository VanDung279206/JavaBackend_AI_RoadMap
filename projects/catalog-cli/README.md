# Catalog console

Hoàn thành P1.1–P1.4 trong starter rồi chạy từ gốc repo:

```bash
python3 scripts/run_catalog.py --mode starter
```

Dùng `--mode solution` để chạy bản tham chiếu. Gõ `add`, sau đó nhập ID, title, content mỗi trường một dòng. Các lệnh khác: `list`, `search`, `delete`, `quit`. Dữ liệu chỉ trong bộ nhớ. Đầu vào chưa hoàn chỉnh (EOF) kết thúc chương trình có thông báo.

Sau khi tự làm: thêm lưu/đọc file ở bài mở rộng riêng. Mẫu hiện tại chưa có persistence; persistence của dự án chính bắt đầu ở PostgreSQL.
