# Runner riêng cho bài nộp

Trạng thái triển khai: **BLOCKED**. Website là static export, không chạy Java/Maven trong Next.js.
RPC lưu bài nộp với verdict BLOCKED. Không có worker cloud được provision, service key hoặc callback tin cậy. Chỉ bật QUEUED sau khi kiểm chứng deployment và threat model trên host runner riêng.

`isolated.py` mới là probe **biên dịch**, chưa chạy bộ test Java/Maven và không phải worker chấm bài hoàn chỉnh. Chỉ nhận ID từ catalogue; mount nguồn chỉ đọc, network=none, root filesystem chỉ đọc, user không phải root, không capability, pids/CPU/RAM/time/output giới hạn. Biên dịch thành công vẫn trả BLOCKED. Kết quả cục bộ **không** được upload thành điểm xác minh. Docker chia sẻ kernel: môi trường multi-tenant công khai cần runtime gVisor/Kata hoặc microVM được đánh giá riêng.

```bash
python3 runner/isolated.py --id P1.1 --source practice/starter --image YOUR_PREBUILT_IMAGE_DIGEST
```

Image phải có JDK 21 và Python 3, không chứa key, được build từ dependency tin cậy và pin digest. Maven cần image có dependency cache đã chuẩn bị khi build, rồi chạy `--offline`; không cho bài nộp tùy ý thay pom, plugin, test hoặc command. Worker nhận nguồn dạng file, tuyệt đối không giải nén archive tùy ý hoặc mount Docker socket vào container bài nộp.

Probe sao chép riêng các file Java vào snapshot giới hạn 120 KB, đặt thư mục job/source `0755` và script/source `0444`, rồi mount chỉ đọc cho UID/GID 65534. Quyền của nguồn gốc không bị sửa. CI Linux chạy `sudo -n python3 runner/check_job_access.py`, tạo fixture dưới root rồi hạ quyền của tiến trình con xuống đúng UID/GID 65534 để kiểm tra đọc/traverse và từ chối ghi. Kiểm tra này không chạy bài nộp hoặc chứng nhận chấm Java hoàn chỉnh.

Trước bật chấm thật: thêm queue/lease chống xử lý trùng; worker xác minh JWT → user_id; giới hạn source/quota; đặt bộ test do server sở hữu; thu JUnit XML từ vùng kết quả riêng; xác thực và ghi verdict/test_version/finished_at bằng service role chỉ ở worker. Chạy thử không tạo điểm. Bài submit đạt chỉ được tính khi toàn bộ test bắt buộc đã thực chạy; thiếu test XML, compile lỗi, timeout, worker chết, output vượt hạn đều không được PASS. Chuỗi `PASS` do bài nộp in ra không phải chứng cứ.

Không chấp nhận mã tùy ý từ Internet trên host làm việc của người học. Chạy công cụ dưới đây chỉ với bài do chính bạn viết cho đến khi deployment cách ly được kiểm thử.
