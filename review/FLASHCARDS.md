# 36 câu hỏi tự nhớ lại

Trả lời khi đang đóng tài liệu; sau đó mở đáp án và tự chấm theo STUDY_SYSTEM.md. Đây là câu hỏi mở để luyện nhớ, không phải bài đánh giá năng lực chuẩn hóa.

## F01 — Java

Vì sao không dùng == để so nội dung hai String?

<details><summary>Xem đáp án</summary>

== so tham chiếu; equals so nội dung. Khi một giá trị có thể null, cần cách kiểm tra null phù hợp.

</details>

## F02 — Java

Khi nào Map phù hợp hơn List trong Catalog?

<details><summary>Xem đáp án</summary>

Khi cần tìm tài liệu theo ID duy nhất. Map ánh xạ ID tới Document; List phù hợp khi cần mô hình danh sách và truy cập theo vị trí.

</details>

## F03 — Java

Vì sao kiểm tra ID trùng sau put có thể sai?

<details><summary>Xem đáp án</summary>

put có thể đã ghi đè tài liệu cũ. Lời giải dùng putIfAbsent để phát hiện trùng mà giữ nguyên bản gốc.

</details>

## F04 — Java

List.copyOf có tạo bản sao sâu của mọi phần tử không?

<details><summary>Xem đáp án</summary>

Không. Nó tạo danh sách không sửa cấu trúc được nhưng vẫn tham chiếu các phần tử; độ bất biến sâu còn phụ thuộc kiểu phần tử.

</details>

## F05 — Java

Optional.empty() biểu diễn gì trong find?

<details><summary>Xem đáp án</summary>

Không tìm thấy tài liệu. Người gọi cần xử lý trạng thái không có kết quả, thay vì gọi get vô điều kiện.

</details>

## F06 — Java

Vì sao P1.3 dùng TreeMap?

<details><summary>Xem đáp án</summary>

Đề yêu cầu kết quả theo thứ tự từ. TreeMap giữ khóa có thứ tự; HashMap không tự bảo đảm thứ tự đó.

</details>

## F07 — HTTP/SQL

Vì sao COUNT(*) có thể trả 1 cho người không có tài liệu trong LEFT JOIN?

<details><summary>Xem đáp án</summary>

LEFT JOIN vẫn tạo một dòng ghép với các cột tài liệu null. COUNT(*) đếm dòng này; COUNT(d.id) không đếm null.

</details>

## F08 — HTTP/SQL

Primary key và foreign key khác nhau thế nào?

<details><summary>Xem đáp án</summary>

Primary key định danh duy nhất dòng trong bảng; foreign key ràng buộc tham chiếu tới khóa của bảng liên quan.

</details>

## F09 — HTTP/SQL

Trong hợp đồng bài, 401 khác 404 thế nào?

<details><summary>Xem đáp án</summary>

401 cho trường hợp chưa xác thực hợp lệ. Sau khi xác thực, 404 được dùng cho tài liệu không tồn tại hoặc ngoài quyền để tránh tiết lộ sự tồn tại.

</details>

## F10 — HTTP/SQL

Rollback cần giữ điều gì trong bài tài liệu + audit?

<details><summary>Xem đáp án</summary>

Cả hai thay đổi cùng không được lưu khi giao dịch thất bại; không để lại tài liệu mới mà thiếu audit.

</details>

## F11 — HTTP/SQL

Vì sao cursor cần cả timestamp và ID?

<details><summary>Xem đáp án</summary>

Nhiều dòng có thể trùng timestamp. ID là khóa phụ giúp xác định thứ tự và điểm tiếp tục rõ ràng.

</details>

## F12 — HTTP/SQL

DELETE trả 204 rồi 404 có nhất thiết mất idempotency không?

<details><summary>Xem đáp án</summary>

Không. Idempotency xét hiệu ứng của việc lặp thao tác lên trạng thái, không bắt buộc mọi status code giống nhau.

</details>

## F13 — Spring

Constructor injection làm rõ điều gì?

<details><summary>Xem đáp án</summary>

Các dependency cần để tạo đối tượng được khai báo tại constructor, thay vì được che trong việc tự tạo hoặc tìm dependency bên trong.

</details>

## F14 — Spring

Vì sao DTO và entity nên có trách nhiệm riêng?

<details><summary>Xem đáp án</summary>

DTO biểu diễn dữ liệu trao đổi; entity biểu diễn mô hình lưu trữ JPA. Tách chúng giúp kiểm soát trường công bố và tránh buộc API theo cấu trúc lưu trữ.

</details>

## F15 — Spring

@NotBlank trong DTO đã đủ để kích hoạt validation của body chưa?

<details><summary>Xem đáp án</summary>

Controller cần cơ chế kích hoạt validation, trong bài là @Valid trên @RequestBody cùng dependency validation phù hợp.

</details>

## F16 — Spring

Tại sao dùng findByIdAndOwnerId?

<details><summary>Xem đáp án</summary>

Giới hạn truy vấn theo cả tài liệu và chủ sở hữu; owner ID phải lấy từ principal đáng tin cậy, không từ dữ liệu client tự khai.

</details>

## F17 — Spring

Tự gọi phương thức @Transactional trong cùng object có thể gặp vấn đề gì?

<details><summary>Xem đáp án</summary>

Trong chế độ proxy thông thường, lời gọi nội bộ không đi qua proxy như lời gọi từ bean khác, nên không tạo ranh giới transaction mong đợi.

</details>

## F18 — Spring

Vì sao tính offset bằng (long) page * size?

<details><summary>Xem đáp án</summary>

Ép sang long trước phép nhân tránh tràn int trước khi so với độ dài danh sách. Vẫn cần kiểm tra page và size hợp lệ.

</details>

## F19 — Quality

Authentication khác authorization thế nào?

<details><summary>Xem đáp án</summary>

Authentication xác minh danh tính; authorization kiểm tra người đó có quyền thực hiện hành động trên tài nguyên cụ thể hay không.

</details>

## F20 — Quality

principalUserId trong bài có được nhận trực tiếp từ request không?

<details><summary>Xem đáp án</summary>

Không được dùng ID client tự khai làm căn cứ quyền. Nó phải xuất phát từ danh tính đã xác thực và ánh xạ phía server.

</details>

## F21 — Quality

Unit test mock repository có chứng minh database rollback không?

<details><summary>Xem đáp án</summary>

Không. Cần integration test thực sự chạy transaction với database và kiểm tra trạng thái sau thất bại.

</details>

## F22 — Quality

Bỏ điều kiện owner thì test nào cần thất bại?

<details><summary>Xem đáp án</summary>

Ca user 2 cố đọc tài liệu của user 1. Nếu không có ca này, bộ kiểm tra có thể bỏ sót lỗi phân quyền.

</details>

## F23 — Quality

localhost bên trong container ứng dụng trỏ tới đâu?

<details><summary>Xem đáp án</summary>

Trỏ tới chính container đó. Database ở container khác cần hostname/network hoặc cấu hình truy cập phù hợp.

</details>

## F24 — Quality

Những gì nên có và không nên có trong log lỗi?

<details><summary>Xem đáp án</summary>

Nên có request ID, endpoint, status, thời gian, loại lỗi. Không ghi mật khẩu/API key; tránh ghi toàn văn tài liệu riêng tư nếu không cần.

</details>

## F25 — AI

Có thể dùng số từ để biết chính xác token count không?

<details><summary>Xem đáp án</summary>

Không. Cần tokenizer hoặc dữ liệu usage theo model/provider; số ký tự, số từ và số token không đồng nhất.

</details>

## F26 — AI

Tách system và user trong prompt có bảo đảm chống prompt injection không?

<details><summary>Xem đáp án</summary>

Không. Nó biểu đạt rõ vai trò nhưng vẫn cần giới hạn quyền, kiểm tra dữ liệu và kiểm soát tác động phía backend.

</details>

## F27 — AI

Đầu ra đúng JSON/schema đã đúng dữ kiện chưa?

<details><summary>Xem đáp án</summary>

Chưa. Cấu trúc hợp lệ vẫn có thể chứa thông tin sai; cần đối chiếu với nguồn và bộ đánh giá.

</details>

## F28 — AI

Trong P5.4, 503 rồi 503 gây bao nhiêu lần gọi?

<details><summary>Xem đáp án</summary>

Hai lần tổng cộng, sau đó ném lỗi. Không thử vô hạn.

</details>

## F29 — AI

Tại sao dùng output <= limit - input trong bài ngân sách?

<details><summary>Xem đáp án</summary>

Sau khi xác nhận input không vượt limit và mọi số không âm, cách này tránh cộng hai long gây tràn số.

</details>

## F30 — AI

Để so sánh hai lần thử model cần ghi gì?

<details><summary>Xem đáp án</summary>

Model/config, prompt revision, input và nguồn, kết quả, lỗi, thời gian quan sát và usage nếu provider có trả. Không điền số liệu chưa đo.

</details>

## F31 — RAG

size=4 và overlap=1 có step bằng bao nhiêu?

<details><summary>Xem đáp án</summary>

3. Khi đoạn cuối đã chạm hết văn bản thì dừng; không tạo thêm đoạn chỉ lặp phần cuối.

</details>

## F32 — RAG

Cosine giữa [1,0] và [0.8,0.6] là bao nhiêu?

<details><summary>Xem đáp án</summary>

0.8 vì cả hai vector có độ dài 1 và tích vô hướng bằng 0.8.

</details>

## F33 — RAG

Vì sao lọc owner trước top-k?

<details><summary>Xem đáp án</summary>

Để chỉ xếp hạng trong phạm vi được phép; lọc sau top-k có thể làm mất kết quả hợp lệ và tạo nguy cơ xử lý dữ liệu ngoài quyền.

</details>

## F34 — RAG

Citation đúng ID còn thiếu kiểm tra gì?

<details><summary>Xem đáp án</summary>

Cần kiểm tra nội dung nguồn có thực sự hỗ trợ mệnh đề trong câu trả lời hay không.

</details>

## F35 — RAG

Gold={A,C}, retrieved=[A,B], k=2: precision và recall?

<details><summary>Xem đáp án</summary>

Precision@2=1/2; Recall@2=1/2. Chỉ A là kết quả liên quan trong danh sách.

</details>

## F36 — RAG

Gold rỗng nên xử lý đánh giá như thế nào?

<details><summary>Xem đáp án</summary>

Tách nhóm không có đáp án để kiểm tra phản hồi thiếu dữ liệu. Không tự gán recall=1; quy ước tính phải được công bố.

</details>