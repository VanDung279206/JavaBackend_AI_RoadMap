# Backend: đồng thời, request trùng và timeout
Ba bài Java 17 chạy không cần Spring; chúng mô phỏng quy tắc trước khi chuyển sang database/HTTP. Sửa `starter/ConcurrentLab.java`:

```bash
python3 scripts/check.py --track concurrency --id C01
python3 scripts/check.py --track concurrency --mode solution
```

| ID | Hợp đồng phải đạt | Ca quyết định |
| --- | --- | --- |
| C01 Store | create version0; get đúng owner; update yêu cầu expectedVersion; check và write nguyên tử; version+1; khác owner/ID thiếu →Missing; version cũ →Conflict | Hai thread cùng version0: đúng một thành công, một Conflict, cuối version1; owner kiểm tra trước version |
| C02 Deduplicator | Identity=(owner,key); cùng payload đồng thời hoặc gọi lại →cùng kết quả, action một lần; khác payload →Conflict; khác owner độc lập; action lỗi →bỏ entry để lần sau thử lại | Chặn action đầu bằng latch, gửi request trùng, đếm side effect; đối chiếu payload khi đang xử lý; retry sau lỗi |
| C03 within | timeoutMillis>0; gọi Callable trong pool do caller cấp; hết hạn →TimeoutException và yêu cầu cancel(true); caller bị interrupt →hủy task, khôi phục cờ interrupt và ném lỗi; giữ nguyên nguyên nhân lỗi của action | Task chờ latch bị hủy; không biến timeout thành thành công; worker/caller được đóng ở finally |

Không dùng sleep để tạo thứ tự giả trong C01/C02; CountDownLatch tạo điểm bắt đầu. Deadline vài giây trong test là chặn treo test, không phải benchmark hay SLA.

## Giới hạn cần hiểu đúng

C01 dùng synchronized bảo vệ **một đối tượng trong một JVM**. Bản Spring dùng khóa dòng PostgreSQL và version của client; xem `ConcurrentIT`. Không suy ra synchronized bảo vệ nhiều instance.

C02 là cache trong RAM, chưa có TTL/giới hạn dung lượng hay phục hồi khi process chết. Đây là bài thực hành; endpoint POST của app **chưa áp dụng idempotency key**. Để làm bền: bảng (owner,operation,key) UNIQUE; lưu hash payload và trạng thái/kết quả; cùng transaction với side effect; định nghĩa retention, lỗi và recovery. Không tuyên bố exactly-once cho hệ thống phân tán. Tránh cùng key gọi đệ quy lại chính Deduplicator vì có thể tự chờ.

C03 yêu cầu hủy mang tính hợp tác: task bỏ qua interrupt có thể tiếp tục chạy. Với HTTP thật cần cả connect/read timeout của client, giới hạn worker/queue và ngân sách tổng; không retry tác vụ có side effect chưa có cơ chế chống trùng. App live cấu hình timeout ở RestClient và số attempt hữu hạn; bài này kiểm tra quy tắc hủy của Java, không chứng minh model thật tuân thủ deadline.

## Bằng chứng và giải thích

Với mỗi bài: vẽ hai request theo thứ tự, chỉ ra điểm kiểm tra/ghi nguyên tử, viết một test bắt bản sai, mô tả bằng tiếng Anh. Ví dụ: “Both requests used version zero. Only one update succeeded. The stale request was rejected.” Đây là văn phong trung tính, phù hợp mô tả kỹ thuật; không phải nội dung tự dùng cho IELTS Task 2.

Đối chiếu [mã tham chiếu](solution/ConcurrentLab.java). Không tăng mức tự làm khi chỉ chạy solution.