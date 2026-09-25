# Roadmap Java Backend + AI

Đề xuất học theo đầu ra. Chuyển chặng khi đáp ứng tiêu chí; chưa đặt lịch theo tuần vì chưa có dữ liệu về nền tảng và quỹ thời gian của người học.

Mỗi chặng có bốn bài và lời giải trong [phases/README.md](phases/README.md). Học thêm DSA theo [bảng pattern](dsa/PATTERNS.md), từ vựng theo [glossary](english/GLOSSARY.md) và ôn theo [STUDY_SYSTEM.md](review/STUDY_SYSTEM.md).

## 0. Chạy, debug và lưu mã bằng Git

Làm [Phase 0](phases/00-setup/README.md) nếu chưa tự chạy/debug/commit được. Sau đó dùng [bảng 24 bài](docs/EXERCISE_MAP.md), [starter/tests](practice/README.md) và [kiểm tra cuối phase](exams/README.md). App tham chiếu hiện có project trong `projects/knowledge-assistant/`, không cần tạo lại từ Initializr nếu theo cấu hình của repo.

## 1. Java nền tảng và công cụ

Mục tiêu: tự viết, chạy và sửa một chương trình Java nhỏ.

- [ ] Cài JDK, Git, Maven và IDE; xác nhận các công cụ dùng đúng JDK.
- [ ] Biến, kiểu dữ liệu, toán tử, điều kiện, vòng lặp, phương thức.
- [ ] Class, object, constructor, interface, encapsulation và composition.
- [ ] `List`, `Set`, `Map`; chọn cấu trúc dữ liệu theo nhu cầu.
- [ ] Generics, exception, lambda và thao tác stream cơ bản.
- [ ] Đọc/ghi tệp văn bản; xử lý lỗi khi tệp không tồn tại.
- [ ] Ước lượng chi phí thao tác tìm kiếm bằng vòng lặp; giải thích cách chọn cấu trúc dữ liệu.
- [ ] Maven dependency, build lifecycle; Git commit, branch, diff.
- [ ] Dùng debugger để theo dõi một lỗi thực tế.

Bài làm: chương trình quản lý danh mục tài liệu trên terminal, lưu trong bộ nhớ; sau đó bổ sung lưu và nạp lại tệp.

Hoàn thành khi: thêm/tìm/xóa hoạt động; dữ liệu rỗng và ID sai được xử lý; người khác có thể chạy theo README của bài.

Nguồn: [Learn Java](https://dev.java/learn/), [Maven Getting Started](https://maven.apache.org/guides/getting-started/), [Pro Git](https://git-scm.com/book/en/v2).

## 2. HTTP, thiết kế API và SQL

Mục tiêu: mô tả được dữ liệu đi từ client vào backend và được lưu như thế nào.

- [ ] Request/response, method, URL, header, JSON và status code.
- [ ] Viết hợp đồng API: input, output, lỗi và ví dụ request.
- [ ] Thiết kế bảng, primary key, foreign key, `NOT NULL`, `UNIQUE`.
- [ ] `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`, `GROUP BY`.
- [ ] Transaction và rollback qua một ví dụ có nhiều thao tác dữ liệu.
- [ ] Thử một index; đọc kế hoạch truy vấn trước và sau khi thêm.
- [ ] Dùng phân trang và quy tắc sắp xếp rõ ràng.

Bài làm: tạo bảng người dùng và tài liệu; mỗi tài liệu thuộc một người dùng. Viết script tạo bảng, dữ liệu minh họa và truy vấn tài liệu theo chủ sở hữu.

Hoàn thành khi: truy vấn được dữ liệu liên quan; ràng buộc từ chối dữ liệu sai; giải thích được một tình huống cần transaction; mô tả đủ các API tạo, đọc, sửa và xóa tài liệu.

Nguồn: [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html), [Spring REST Guide](https://spring.io/guides/gs/rest-service/).

## 3. Spring Boot và REST API

Mục tiêu: triển khai thiết kế ở chặng 2 thành ứng dụng chạy được.

- [ ] Tạo dự án Maven từ Spring Initializr; ghi lại phiên bản Java và Spring Boot.
- [ ] Hiểu dependency injection; sử dụng constructor injection.
- [ ] Phân chia controller, service và repository theo trách nhiệm.
- [ ] Dùng DTO cho request/response, validation cho đầu vào.
- [ ] Kết nối PostgreSQL; ánh xạ entity và truy vấn bằng Spring Data JPA.
- [ ] Dùng migration để theo dõi thay đổi schema.
- [ ] Xử lý lỗi tập trung; thống nhất cấu trúc phản hồi lỗi.
- [ ] Bổ sung phân trang và transaction ở thao tác cần tính nguyên tử.
- [ ] Kiểm tra một truy vấn phát sinh nhiều lần tải dữ liệu; đọc SQL được thực thi.

Bài làm: API quản lý tài liệu, gồm `POST /documents`, `GET /documents`, `GET /documents/{id}`, `PUT /documents/{id}`, `DELETE /documents/{id}`. Mỗi thao tác có ví dụ request, response và trường hợp lỗi.

Hoàn thành khi: dữ liệu vẫn tồn tại sau khi khởi động lại ứng dụng; request sai bị từ chối; lỗi không tìm thấy được phân biệt với lỗi máy chủ; README mô tả được cách dựng database và chạy ứng dụng.

Nguồn: [Spring REST Guide](https://spring.io/guides/gs/rest-service/), [Spring Boot Documentation](https://docs.spring.io/spring-boot/index.html).

## 4. Kiểm thử, phân quyền và triển khai

Mục tiêu: kiểm chứng hành vi và làm cho ứng dụng có thể chạy lại từ môi trường sạch.

- [ ] Kiểm thử quy tắc nghiệp vụ, đầu vào sai và tài nguyên không tồn tại.
- [ ] Kiểm thử tích hợp các thao tác lưu/đọc dữ liệu quan trọng với PostgreSQL.
- [ ] Phân biệt xác thực người dùng với kiểm tra quyền truy cập.
- [ ] Dùng Spring Security; chọn một cơ chế xác thực và mô tả cách sử dụng.
- [ ] Mỗi người dùng chỉ được truy cập tài liệu thuộc phạm vi được cấp quyền.
- [ ] Kiểm tra trường hợp hai người dùng cố đọc hoặc sửa tài liệu của nhau.
- [ ] Đưa cấu hình môi trường ra ngoài mã nguồn.
- [ ] Đóng gói bằng Docker; cấu hình môi trường ứng dụng và database.
- [ ] Thiết lập CI để chạy build và kiểm thử đã có.
- [ ] Ghi log hữu ích để tìm nguyên nhân request thất bại.

Bài làm: hoàn thiện cách chạy dự án và các ca kiểm tra quyền truy cập.

Hoàn thành khi: người mới làm theo README có thể chạy ứng dụng; dữ liệu được giữ theo cấu hình đã công bố; thay đổi làm sai quy tắc nghiệp vụ khiến kiểm thử thất bại; người dùng không truy cập được tài liệu ngoài quyền của mình.

Nguồn: [Spring Boot Testing](https://docs.spring.io/spring-boot/reference/testing/index.html), [Spring Security](https://docs.spring.io/spring-security/reference/index.html), [Docker Get Started](https://docs.docker.com/get-started/).

## 5. Tích hợp mô hình AI

Mục tiêu: đưa một tính năng AI có đầu vào và đầu ra rõ ràng vào backend.

- [ ] Tìm hiểu LLM, token, context window và giới hạn độ dài đầu vào của mô hình được chọn.
- [ ] Chọn một mô hình và nhà cung cấp; đọc tài liệu về cấu hình, giới hạn và cách tính chi phí của lựa chọn đó.
- [ ] Kiểm tra tính tương thích Spring Boot và Spring AI trước khi thêm dependency.
- [ ] Gọi mô hình thông qua Spring AI `ChatClient`.
- [ ] Tách prompt khỏi logic controller; lưu lịch sử thay đổi prompt.
- [ ] Yêu cầu đầu ra có cấu trúc và kiểm tra dữ liệu trả về.
- [ ] Đặt timeout; xử lý lỗi nhà cung cấp và đầu vào quá dài.
- [ ] Giới hạn kích thước request; ghi nhận thời gian phản hồi và mức sử dụng nếu nhà cung cấp trả dữ liệu đó.
- [ ] Kiểm tra quyền sở hữu trước khi gửi nội dung tài liệu tới mô hình.

Bài làm: `POST /documents/{id}/summary` trả bản tóm tắt từ nội dung tài liệu đã lưu.

Hoàn thành khi: có ví dụ thành công, thiếu quyền, tài liệu rỗng và lỗi gọi mô hình; xác định được prompt, cấu hình và mô hình đã dùng cho một lần thử; khóa truy cập được cung cấp qua cấu hình môi trường.

Nguồn: [Spring AI Getting Started](https://docs.spring.io/spring-ai/reference/getting-started.html), [Chat Client API](https://docs.spring.io/spring-ai/reference/api/chatclient.html).

## 6. RAG và đánh giá chất lượng

Mục tiêu: trả lời dựa trên tài liệu được phép truy cập, có nguồn để kiểm tra.

- [ ] Chia tài liệu thành đoạn và giữ metadata: tài liệu, đoạn, chủ sở hữu, phiên bản.
- [ ] Tạo embedding; lưu và truy vấn bằng PostgreSQL + pgvector.
- [ ] Chọn mô hình embedding và cấu hình chiều vector phù hợp.
- [ ] Truy xuất các đoạn liên quan trước khi tạo câu trả lời.
- [ ] Áp dụng điều kiện quyền truy cập trước hoặc ngay trong bước truy xuất.
- [ ] Trả lại ID tài liệu và đoạn nguồn; kiểm tra nguồn thực sự thuộc tập đã truy xuất.
- [ ] Quy định cách phản hồi khi không tìm thấy bằng chứng phù hợp.
- [ ] Đồng bộ cập nhật/xóa tài liệu với các đoạn và embedding tương ứng.
- [ ] Tạo bộ câu hỏi có đáp án và nguồn kỳ vọng từ bộ tài liệu đã chọn.
- [ ] Bao gồm câu có đáp án, thiếu dữ liệu, nguồn mâu thuẫn và nguồn không được cấp quyền.
- [ ] Đánh giá riêng chất lượng truy xuất, độ đúng của câu trả lời và độ đúng của nguồn.
- [ ] Lưu kết quả trước/sau khi đổi chunking, prompt hoặc mô hình; kiểm tra thủ công các lỗi quan trọng.

Bài làm: `POST /questions` trả câu trả lời và danh sách nguồn. Khi không có căn cứ phù hợp, trả trạng thái thể hiện thiếu dữ liệu theo hợp đồng API.

Hoàn thành khi: chạy lại được bộ câu hỏi đánh giá; xem được bằng chứng cho từng kết quả; không trả tài liệu ngoài quyền; ghi rõ các câu thất bại và thay đổi đã thử. Mục tiêu chất lượng phải được đặt trước khi đánh giá, gắn với bộ dữ liệu cụ thể.

Nguồn: [Spring AI RAG](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html), [PGvector](https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html), [Evaluation Testing](https://docs.spring.io/spring-ai/reference/api/testing.html).

## Sau khi hoàn thành sáu chặng

Chọn phần mở rộng theo vấn đề thực tế của dự án: tool calling để tra cứu dữ liệu qua hàm backend; streaming để hiển thị câu trả lời dần; tối ưu truy vấn hoặc cache khi đã đo được điểm chậm. Với tool calling, backend cần tự kiểm tra quyền và tham số trước khi thực thi.

Nguồn: [Spring AI Tool Calling](https://docs.spring.io/spring-ai/reference/api/tools.html).

## Theo dõi tiến độ

| Chặng | Trạng thái | Bằng chứng hoàn thành |
| --- | --- | --- |
| 1. Java | Chưa đánh dấu | Điền đường dẫn bài làm/commit |
| 2. HTTP và SQL | Chưa đánh dấu | Điền đường dẫn schema và API contract |
| 3. Spring Boot | Chưa đánh dấu | Điền đường dẫn dự án và hướng dẫn chạy |
| 4. Kiểm thử và triển khai | Chưa đánh dấu | Điền kết quả kiểm thử và cấu hình chạy |
| 5. Tích hợp AI | Chưa đánh dấu | Điền ví dụ request/response và cấu hình mô hình |
| 6. RAG | Chưa đánh dấu | Điền bộ đánh giá và kết quả |