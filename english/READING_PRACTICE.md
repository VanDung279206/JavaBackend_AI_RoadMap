# Luyện đọc tài liệu kỹ thuật

Các đoạn ngắn do người soạn viết, không phải trích nguyên văn tài liệu chính thức. Đọc tiếng Anh trước, tự trả lời câu hỏi rồi mới xem phần đáp án.

## Phase 1

“The method accepts a title parameter and returns a normalized string. The caller must provide a non-null argument. The method throws an exception if the title is blank.”

Câu hỏi: input là gì? Khi nào ném exception? Parameter và argument khác nhau ở đâu?

<details><summary>Đáp án và bản dịch</summary>

Phương thức nhận tham số title và trả chuỗi đã chuẩn hóa. Người gọi phải cung cấp giá trị không null. Phương thức ném exception nếu title trắng. Parameter được khai báo ở định nghĩa; argument được truyền tại lời gọi.

</details>

## Phase 2

“The query returns every user, including users without documents. Use a left join and count the document IDs. Add a stable ordering before applying pagination.”

Câu hỏi: có được bỏ người dùng có 0 tài liệu không? Nên đếm trường nào? Trước phân trang cần gì?

<details><summary>Đáp án và bản dịch</summary>

Truy vấn trả mọi người dùng, gồm cả người chưa có tài liệu. Dùng left join và đếm ID tài liệu. Thêm thứ tự ổn định trước khi phân trang. Đếm ID giúp dòng ghép có document ID null cho kết quả 0.

</details>

## Phase 3

“The controller receives a DTO and delegates the operation to a service. The service uses a repository to load the entity. Constructor injection makes these dependencies explicit.”

Câu hỏi: thành phần nào nhận DTO? Thành phần nào truy cập dữ liệu? “Delegates” có nghĩa gì trong đoạn này?

<details><summary>Đáp án và bản dịch</summary>

Controller nhận DTO rồi giao việc cho service. Service dùng repository để tải entity. Constructor injection thể hiện rõ các dependency. “Delegates” là giao/ủy nhiệm việc xử lý cho thành phần khác.

</details>

## Phase 4

“Authentication alone does not prove that a user may read a document. The application must check authorization for that resource. Include a test in which another user attempts to access it.”

Câu hỏi: đã đăng nhập có đủ để đọc mọi tài liệu không? Cần kiểm tra nào?

<details><summary>Đáp án và bản dịch</summary>

Xác thực riêng lẻ chưa chứng minh người dùng được đọc tài liệu. Ứng dụng phải kiểm tra quyền trên tài nguyên đó. Cần ca kiểm thử người dùng khác cố truy cập. “Alone” ở đây nghĩa là chỉ riêng điều đó.

</details>

## Phase 5

“The provider may reject a request that exceeds a rate limit. Retry only when the policy allows it, and cap the number of attempts. Valid JSON does not guarantee factual accuracy.”

Câu hỏi: mọi lỗi có được retry không? Cần giới hạn gì? JSON hợp lệ chứng minh được điều gì?

<details><summary>Đáp án và bản dịch</summary>

Provider có thể từ chối request vượt giới hạn sử dụng. Chỉ thử lại khi chính sách cho phép, và giới hạn số lần. JSON hợp lệ không bảo đảm dữ kiện đúng. “Cap” dùng như động từ: đặt giới hạn tối đa.

</details>

## Phase 6

“Retrieve relevant chunks before generating an answer. Apply access filters during retrieval and retain the source IDs. If the evidence is insufficient, report that the available documents do not support an answer.”

Câu hỏi: lọc quyền ở bước nào? Cần giữ metadata nào? Làm gì khi thiếu bằng chứng?

<details><summary>Đáp án và bản dịch</summary>

Truy xuất đoạn liên quan trước khi tạo câu trả lời. Áp dụng bộ lọc quyền khi truy xuất và giữ ID nguồn. Nếu bằng chứng không đủ, báo rằng tài liệu hiện có chưa hỗ trợ câu trả lời.

</details>

## Cấu trúc câu nên nhận diện

| Mẫu câu | Nghĩa | Việc cần làm khi đọc |
| --- | --- | --- |
| `must ...` | Phải… trong quy tắc đang nêu | Xác định điều kiện bắt buộc |
| `may ...` | Có thể… tùy ngữ cảnh | Không tự hiểu là luôn xảy ra |
| `unless ...` | Trừ khi… | Tìm ngoại lệ của quy tắc |
| `provided that ...` | Với điều kiện là… | Ghi điều kiện áp dụng |
| `throws ... if ...` | Ném lỗi… nếu… | Viết ca kiểm thử tương ứng |
| `returns ... when ...` | Trả… khi… | Xác định output mong đợi |

Các từ viết hoa MUST/SHOULD/MAY trong một tiêu chuẩn có thể có nghĩa quy phạm riêng; đọc phần quy ước của tiêu chuẩn. Không áp cách dùng đó cho mọi đoạn tiếng Anh thông thường.