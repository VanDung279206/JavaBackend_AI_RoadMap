# Kiểm tra DSA trộn

[Đề không gắn tên pattern](EXERCISES.md). Sửa `starter/MixedLab.java`.

```bash
python3 scripts/check.py --track mixed --id M01
python3 scripts/check.py --track mixed --mode solution
python3 scripts/check.py --track mixed --mode solution --seed 42
```

Mặc định kiểm tra starter; một test pass của solution chỉ xác minh bản tham chiếu. Bộ test dùng input biên và đối chiếu thuật toán độc lập trên dữ liệu nhỏ có seed. Output ghi seed để tái hiện; đổi seed không thay thế phân tích độ phức tạp. Trong cùng seed, chạy tập con có chuỗi ngẫu nhiên khác chạy cả bộ vì thứ tự tiêu thụ RNG khác.

Mỗi bài chấm tay /10: đúng hợp đồng và test4; chọn thuật toán và lý do2; invariant/trace2; độ phức tạp1; input biên mới1. Code pass mà không giải thích chỉ có tối đa4. Ngưỡng luyện tập: ≥7 và không sai hợp đồng, không phải chứng nhận chuyên môn. Ghi lỗi vào review với ID Mxx.

Mẫu nộp: cách đơn giản → nút thắt → cách chọn → invariant → trace → O(thời gian/bộ nhớ) → kết quả test/seed → phản ví dụ. Xem [đáp án và hướng ôn](SOLUTIONS.md) sau khi nộp.