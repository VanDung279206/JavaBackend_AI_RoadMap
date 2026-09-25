# Từ vựng kỹ thuật Anh–Việt

72 mục theo phase và DSA. Nghĩa được giới hạn trong ngữ cảnh lập trình của repo; các câu ví dụ do người soạn tạo để luyện đọc.

Cách học: che cột nghĩa, giải thích từ bằng tiếng Việt, đọc câu ví dụ, rồi tự viết một câu liên quan tới bài vừa làm.

## Phase 1 — Java

| Term | Nghĩa theo ngữ cảnh | Ví dụ tiếng Anh | Dịch ví dụ |
| --- | --- | --- | --- |
| class | Lớp mô tả dữ liệu và hành vi của đối tượng | The Document class stores a title. | Lớp Document lưu một tiêu đề. |
| object | Đối tượng cụ thể được tạo từ một lớp | Create an object for each document. | Tạo một đối tượng cho mỗi tài liệu. |
| method | Phương thức khai báo trong lớp hoặc interface | This method returns a list. | Phương thức này trả về một danh sách. |
| parameter | Tham số khai báo trong định nghĩa phương thức | The method has a size parameter. | Phương thức có tham số size. |
| argument | Giá trị hoặc biểu thức được truyền khi gọi | Pass 10 as the size argument. | Truyền 10 làm giá trị cho tham số size. |
| return value | Giá trị được trả về sau lời gọi | Check the return value before using it. | Kiểm tra giá trị trả về trước khi sử dụng. |
| exception | Đối tượng biểu diễn một tình huống bất thường khi thực thi | Throw an exception for a blank title. | Ném exception khi tiêu đề trắng. |
| collection | Tập hợp đối tượng theo cách tổ chức của cấu trúc cụ thể | This collection contains three documents. | Tập hợp này chứa ba tài liệu. |
| mutable | Có thể thay đổi trạng thái sau khi tạo | A mutable list can be modified. | Danh sách mutable có thể được sửa đổi. |
| immutable | Không thể thay đổi trạng thái sau khi tạo | An immutable value does not change. | Một giá trị bất biến không thay đổi. |

## Phase 2 — HTTP và SQL

| Term | Nghĩa theo ngữ cảnh | Ví dụ tiếng Anh | Dịch ví dụ |
| --- | --- | --- | --- |
| request | Yêu cầu gửi tới hệ thống | The client sends a request. | Client gửi một yêu cầu. |
| response | Phản hồi cho một yêu cầu | The response contains JSON. | Phản hồi chứa JSON. |
| endpoint | Điểm truy cập API, thường xác định bằng method và URL | This endpoint creates a document. | Endpoint này tạo một tài liệu. |
| payload | Dữ liệu mang theo trong thông điệp theo ngữ cảnh sử dụng | The request payload includes a title. | Dữ liệu request có một tiêu đề. |
| query | Truy vấn lấy hoặc thao tác dữ liệu | The query filters by owner ID. | Truy vấn lọc theo ID chủ sở hữu. |
| constraint | Ràng buộc dữ liệu phải tuân thủ | The constraint rejects duplicate IDs. | Ràng buộc từ chối ID trùng. |
| primary key | Khóa chính định danh duy nhất mỗi dòng và không null | The ID is the primary key. | ID là khóa chính. |
| foreign key | Khóa ngoại tham chiếu khóa hợp lệ ở bảng được liên kết | The foreign key references a user. | Khóa ngoại tham chiếu một người dùng. |
| transaction | Nhóm thao tác được xử lý trong một đơn vị giao dịch | Roll back the transaction if saving fails. | Rollback giao dịch nếu lưu thất bại. |
| index | Cấu trúc hỗ trợ truy cập dữ liệu theo khóa hoặc biểu thức | Measure the query before adding an index. | Đo truy vấn trước khi thêm index. |

## Phase 3 — Spring

| Term | Nghĩa theo ngữ cảnh | Ví dụ tiếng Anh | Dịch ví dụ |
| --- | --- | --- | --- |
| dependency injection | Cung cấp dependency từ bên ngoài đối tượng | Use constructor injection for this dependency. | Dùng constructor injection cho dependency này. |
| bean | Đối tượng do Spring container quản lý trong ngữ cảnh Spring | Spring creates this bean. | Spring tạo bean này. |
| controller | Thành phần tiếp nhận và điều phối request web | The controller validates the request body. | Controller kiểm tra body của request. |
| service | Thành phần chứa hoặc điều phối logic nghiệp vụ trong thiết kế này | The service checks document ownership. | Service kiểm tra quyền sở hữu tài liệu. |
| repository | Thành phần trừu tượng hóa truy cập dữ liệu | The repository loads the document. | Repository tải tài liệu. |
| entity | Đối tượng được ánh xạ lưu trữ trong ngữ cảnh JPA | Map the entity to a database table. | Ánh xạ entity tới một bảng database. |
| DTO | Data Transfer Object: đối tượng truyền dữ liệu giữa các lớp hoặc biên hệ thống | Return a DTO from the controller. | Trả DTO từ controller. |
| validation | Kiểm tra dữ liệu theo quy tắc đã đặt | Validation rejects an empty title. | Validation từ chối tiêu đề rỗng. |
| mapping | Ánh xạ giữa hai cách biểu diễn hoặc cấu trúc | Keep the mapping logic in one place. | Giữ logic ánh xạ tại một nơi. |
| pagination | Chia kết quả thành các trang | Pagination limits the number of returned items. | Phân trang giới hạn số phần tử trả về. |

## Phase 4 — Chất lượng và quyền

| Term | Nghĩa theo ngữ cảnh | Ví dụ tiếng Anh | Dịch ví dụ |
| --- | --- | --- | --- |
| authentication | Xác minh danh tính | Authentication identifies the user. | Xác thực xác định người dùng. |
| authorization | Kiểm tra quyền thực hiện hành động hoặc truy cập tài nguyên | Authorization checks access to this document. | Kiểm tra quyền xác định quyền truy cập tài liệu này. |
| principal | Danh tính được biểu diễn trong ngữ cảnh bảo mật | Read the user ID from the authenticated principal. | Đọc user ID từ principal đã xác thực. |
| unit test | Kiểm thử một đơn vị hành vi với phạm vi được xác định | This unit test checks the ownership rule. | Unit test này kiểm tra quy tắc chủ sở hữu. |
| integration test | Kiểm thử sự phối hợp giữa các thành phần | The integration test uses PostgreSQL. | Integration test sử dụng PostgreSQL. |
| mock | Đối tượng thay thế được cấu hình trong kiểm thử | The mock returns a predefined result. | Mock trả kết quả được định sẵn. |
| fixture | Dữ liệu hoặc trạng thái chuẩn bị cho kiểm thử | Create a fixture with two users. | Tạo fixture với hai người dùng. |
| deployment | Đưa ứng dụng vào môi trường chạy mục tiêu | Verify the configuration before deployment. | Kiểm tra cấu hình trước khi triển khai. |
| environment variable | Biến trong môi trường tiến trình | Read the database URL from an environment variable. | Đọc URL database từ biến môi trường. |
| log | Bản ghi sự kiện trong quá trình hệ thống hoạt động | Add the request ID to the log. | Thêm request ID vào log. |

## Phase 5 — LLM và API

| Term | Nghĩa theo ngữ cảnh | Ví dụ tiếng Anh | Dịch ví dụ |
| --- | --- | --- | --- |
| prompt | Đầu vào hoặc chỉ dẫn cung cấp cho mô hình theo ngữ cảnh | Keep the prompt separate from document data. | Tách prompt khỏi dữ liệu tài liệu. |
| token | Đơn vị mà tokenizer của mô hình xử lý | A token is not always a whole word. | Token không phải lúc nào cũng là một từ hoàn chỉnh. |
| context window | Giới hạn ngữ cảnh mô hình xử lý theo quy định của mô hình/API | Check the model context window. | Kiểm tra context window của mô hình. |
| inference | Quá trình dùng mô hình đã học để tính đầu ra | Measure inference latency. | Đo độ trễ suy luận của mô hình. |
| structured output | Đầu ra tuân theo cấu trúc được yêu cầu | Validate the structured output. | Kiểm tra đầu ra có cấu trúc. |
| schema | Mô tả cấu trúc và ràng buộc của dữ liệu | The schema requires a title field. | Schema yêu cầu trường title. |
| timeout | Giới hạn thời gian chờ cho một thao tác | Set a timeout for the model call. | Đặt timeout cho lời gọi mô hình. |
| retry | Thử lại thao tác sau một lần thất bại | Retry only the errors allowed by the policy. | Chỉ thử lại các lỗi mà chính sách cho phép. |
| rate limit | Giới hạn tần suất hoặc lượng sử dụng trong một khoảng thời gian | The provider enforces a rate limit. | Provider áp dụng giới hạn sử dụng. |
| provider | Bên cung cấp dịch vụ hoặc mô hình trong ngữ cảnh tích hợp | Choose a provider supported by the application. | Chọn provider mà ứng dụng hỗ trợ. |

## Phase 6 — RAG

| Term | Nghĩa theo ngữ cảnh | Ví dụ tiếng Anh | Dịch ví dụ |
| --- | --- | --- | --- |
| chunk | Đoạn dữ liệu được chia ra để xử lý | Keep the source ID with each chunk. | Giữ ID nguồn cùng mỗi đoạn. |
| embedding | Biểu diễn số của dữ liệu trong không gian vector | Create an embedding for each chunk. | Tạo embedding cho mỗi đoạn. |
| vector store | Kho lưu và truy vấn vector cùng dữ liệu liên quan | Filter by owner in the vector store query. | Lọc theo owner trong truy vấn vector store. |
| retrieval | Truy xuất thông tin phù hợp với truy vấn | Evaluate retrieval before changing the prompt. | Đánh giá truy xuất trước khi đổi prompt. |
| relevance | Mức liên quan tới câu hỏi hoặc mục tiêu | Judge relevance using the question. | Đánh giá độ liên quan dựa trên câu hỏi. |
| similarity | Độ giống nhau theo thước đo đã chọn | Cosine similarity compares vector directions. | Cosine similarity so sánh hướng của các vector. |
| citation | Tham chiếu nguồn được nêu cho nội dung trả lời | Each citation should identify a real source. | Mỗi citation cần định danh một nguồn có thật. |
| grounding | Gắn câu trả lời với dữ liệu hoặc bằng chứng được cung cấp | Check whether the answer is grounded in the document. | Kiểm tra câu trả lời có căn cứ trong tài liệu không. |
| precision | Tỷ lệ kết quả liên quan trong tập kết quả xét, theo quy ước đo | Precision at k uses the top k results. | Precision tại k dùng các kết quả top-k. |
| recall | Tỷ lệ phần liên quan đã tìm được trên tổng phần liên quan | Recall measures how much relevant material was found. | Recall đo phần tài liệu liên quan đã được tìm thấy. |

## DSA — Cấu trúc dữ liệu và thuật toán

| Term | Nghĩa theo ngữ cảnh | Ví dụ tiếng Anh | Dịch ví dụ |
| --- | --- | --- | --- |
| array | Mảng các phần tử truy cập theo chỉ số | The array is sorted in ascending order. | Mảng được sắp tăng dần. |
| hash map | Cấu trúc ánh xạ khóa–giá trị dựa trên hash | Use a hash map to count values. | Dùng hash map để đếm giá trị. |
| stack | Cấu trúc vào sau ra trước | Push the expected closing bracket onto the stack. | Đẩy dấu đóng mong đợi lên stack. |
| queue | Hàng đợi; ở bài BFS dùng vào trước ra trước | Add each new node to the queue. | Thêm mỗi đỉnh mới vào queue. |
| heap | Cấu trúc duy trì quan hệ ưu tiên; đây không phải heap memory của JVM | The min-heap keeps the smallest value at the top. | Min-heap giữ giá trị nhỏ nhất ở đỉnh. |
| graph | Đồ thị gồm đỉnh và cạnh | The graph contains an isolated node. | Đồ thị chứa một đỉnh cô lập. |
| traversal | Quá trình duyệt qua các phần tử hoặc đỉnh | BFS performs a level-by-level traversal. | BFS duyệt theo từng lớp. |
| dynamic programming | Giải bài bằng các trạng thái con và tái sử dụng kết quả | Define the state before writing the dynamic programming solution. | Định nghĩa trạng thái trước khi viết lời giải quy hoạch động. |
| invariant | Điều luôn đúng tại các điểm xác định trong thuật toán | The window invariant must hold after every update. | Invariant của cửa sổ phải đúng sau mỗi lần cập nhật. |
| time complexity | Cách lượng thao tác tăng theo kích thước input | Explain the time complexity in terms of n. | Giải thích độ phức tạp thời gian theo n. |
| space complexity | Cách nhu cầu bộ nhớ tăng theo kích thước input | This algorithm has constant auxiliary space complexity. | Thuật toán này dùng bộ nhớ phụ hằng số. |
| amortized | Chi phí bình quân trên một chuỗi thao tác trong phân tích thuật toán | An append can have amortized constant time. | Thao tác append có thể có thời gian hằng số theo phân tích amortized. |

## Các cặp dễ nhầm và mẹo nhớ

| Cặp | Phân biệt | Mẹo nhớ tự tạo |
| --- | --- | --- |
| parameter / argument | Parameter ở định nghĩa; argument ở lời gọi | Ô để điền / giá trị điền vào |
| authentication / authorization | Danh tính / quyền hành động | Bạn là ai / bạn được làm gì |
| entity / DTO | Mô hình lưu trữ JPA / dữ liệu trao đổi | Lưu / chuyển |
| validation / verification of facts | Đúng quy tắc cấu trúc / đúng dữ kiện | Đúng khuôn chưa đủ đúng ý |
| precision / recall | Trong phần lấy ra có bao nhiêu đúng / trong phần đúng đã lấy được bao nhiêu | Lấy ra có đúng / lấy đúng đã đủ |
| mutable / immutable | Thay đổi được / không thay đổi được | Tiền tố im- trong từ này biểu thị phủ định |

Ví dụ dùng cặp: “The method declares a parameter, and the caller supplies an argument.” — Phương thức khai báo tham số, người gọi cung cấp giá trị cho tham số đó.

Ví dụ dùng cặp: “Authentication identifies the user, while authorization checks whether that user may read the document.” — Xác thực xác định danh tính; kiểm tra quyền xác định người đó được đọc tài liệu hay không.

Văn phong: trung tính hoặc kỹ thuật. Trong IELTS Task 2, dùng thuật ngữ khi phù hợp chủ đề và giải thích nếu người đọc phổ thông có thể không biết; ví dụ có thể diễn giải “authentication” thành “identity verification”, “authorization” thành “permission to access”.

Nguồn thuật ngữ theo ngữ cảnh: [Java](https://dev.java/learn/), [HTTP](https://www.rfc-editor.org/rfc/rfc9110.html), [Spring Security](https://docs.spring.io/spring-security/reference/index.html), [Spring AI](https://docs.spring.io/spring-ai/reference/index.html).