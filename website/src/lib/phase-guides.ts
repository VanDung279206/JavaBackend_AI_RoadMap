export type GuideStep = {
  title: string;
  detail: string;
  command?: string;
  check?: string;
};

export type PhaseGuide = {
  number: string;
  objective: string;
  start: string;
  steps: GuideStep[];
  deliverable: string;
  checklist: string[];
  pitfalls: { problem: string; fix: string }[];
};

export const PHASE_GUIDES: PhaseGuide[] = [
  {
    number: "00",
    objective: "Cài đúng công cụ, tự biên dịch được một file Java, biết đặt breakpoint và lưu thay đổi bằng Git.",
    start: "Chưa cần biết lập trình. Chuẩn bị máy tính có quyền cài ứng dụng và kết nối Internet.",
    steps: [
      {
        title: "Cài JDK 21",
        detail: "Cài một bản JDK 21, ví dụ Eclipse Temurin. JDK có cả bộ chạy Java và trình biên dịch javac. Khi trình cài đặt hỏi, bật tùy chọn thêm Java vào PATH.",
        command: "java -version\njavac -version\nwhere.exe java",
        check: "Hai lệnh đầu in phiên bản 21; lệnh cuối trỏ tới thư mục JDK bạn vừa cài.",
      },
      {
        title: "Cài IDE và tạo file đầu tiên",
        detail: "Dùng IntelliJ IDEA Community hoặc VS Code kèm Extension Pack for Java. Tạo thư mục hello-java, thêm src/Main.java, rồi viết một lớp Main có phương thức main. Tên lớp public và tên file phải cùng là Main.",
        command: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Xin chào Java\");\n    }\n}",
        check: "Chạy trong IDE và thấy dòng Xin chào Java ở cửa sổ Run.",
      },
      {
        title: "Biên dịch và chạy từ terminal",
        detail: "Mở terminal tại thư mục hello-java. javac biến mã nguồn .java thành bytecode .class; lệnh java nạp class và chạy main. Làm bước này để biết IDE đang tự làm giúp bạn những gì.",
        command: "javac -encoding UTF-8 -d out src/Main.java\njava -cp out Main",
        check: "Thư mục out có Main.class và lệnh thứ hai in đúng kết quả. Nếu javac không được nhận diện, kiểm tra PATH/JDK trước.",
      },
      {
        title: "Dừng chương trình bằng debugger",
        detail: "Đặt breakpoint ở dòng println. Trong IntelliJ chọn Debug; trong VS Code nhấn F5. Step Over đi từng dòng, Variables cho biết giá trị biến tại thời điểm đang dừng.",
        check: "Dừng được ở breakpoint, xem được args, chạy tiếp và kết thúc chương trình.",
      },
      {
        title: "Lưu một mốc bằng Git",
        detail: "Cài Git, khởi tạo repository trong thư mục bài học và tạo commit đầu tiên. Trước khi commit, xem diff để biết chính xác file nào sẽ được lưu.",
        command: "git init\ngit status\ngit add src/Main.java\ngit diff --cached\ngit commit -m \"Add first Java program\"",
        check: "git status báo working tree clean và git log có commit vừa tạo.",
      },
      {
        title: "Chạy bộ kiểm tra của lộ trình",
        detail: "Khi đã clone repository này, dùng Maven Wrapper để tải Maven đúng phiên bản cho dự án. Trên Windows dùng mvnw.cmd; trên macOS/Linux dùng ./mvnw.",
        command: ".\\mvnw.cmd -version\npy scripts\\doctor.py",
        check: "Doctor báo rõ công cụ nào sẵn sàng và công cụ nào cần cài; lỗi môi trường được xử lý trước khi bắt đầu bài Java.",
      },
    ],
    deliverable: "Một repository hello-java có Main.java, một commit đầu tiên và ghi chú ngắn cách chạy chương trình trên máy của bạn.",
    checklist: [
      "java và javac cùng trỏ tới một JDK 21.",
      "Chạy được Main.java cả trong IDE lẫn terminal.",
      "Đã dừng chương trình ở breakpoint và xem một biến.",
      "Biết xem git status, git diff và tạo commit.",
    ],
    pitfalls: [
      { problem: "java chạy được nhưng javac không có", fix: "Bạn đang cài JRE thay vì JDK, hoặc PATH trỏ nhầm thư mục. Cài JDK và mở terminal mới." },
      { problem: "IDE dùng JDK khác terminal", fix: "Chọn cùng một JDK trong cấu hình Project SDK của IDE; kiểm tra lại bằng java -version." },
      { problem: "Could not find or load main class", fix: "Chạy lệnh từ đúng thư mục classpath; giữ -cp out và dùng tên lớp Main, không thêm .class." },
      { problem: "Lệnh Maven Wrapper bị chặn trên Windows", fix: "Mở PowerShell tại thư mục repository và chạy .\\mvnw.cmd; không cần cài Maven toàn hệ thống." },
    ],
  },
  {
    number: "01",
    objective: "Viết chương trình Java nhỏ có dữ liệu, quy tắc nghiệp vụ, kiểm tra đầu vào và test.",
    start: "Đã chạy được một file Java và biết dùng terminal. Chưa cần Spring hay database.",
    steps: [
      { title: "Chia bài toán thành dữ liệu và thao tác", detail: "Với catalog tài liệu, xác định Document cần có id, title, content; các thao tác là add, find, all và remove. Viết chữ ký method trước khi viết thân hàm.", check: "Mỗi method có đầu vào, kết quả và cách xử lý dữ liệu sai được ghi rõ." },
      { title: "Viết quy tắc nhỏ trước", detail: "Làm normalizeTitle rồi mới dùng nó trong constructor. Kiểm tra null trước khi gọi method trên chuỗi; chuẩn hóa khoảng trắng trước khi quyết định tiêu đề có rỗng hay không.", check: "Có ví dụ bình thường, chuỗi chỉ có khoảng trắng và null." },
      { title: "Chọn cấu trúc dữ liệu theo hợp đồng", detail: "Dùng LinkedHashMap nếu cần tra cứu theo ID đồng thời giữ thứ tự thêm. Dùng Optional cho kết quả có thể không tìm thấy; trả bản sao danh sách để người gọi không sửa được catalog bên trong.", check: "Thử ID trùng, ID không tồn tại và sửa danh sách kết quả." },
      { title: "Kiểm tra dữ liệu biên", detail: "Thêm test cho chuỗi rỗng, từ trùng, dấu câu, danh sách rỗng và keyword không khớp. Test phải mô tả hành vi mong muốn, không phụ thuộc thứ tự ngẫu nhiên.", command: "py scripts\\check.py --id P1.1,P1.2", check: "Test đỏ khi method còn TODO và xanh khi hợp đồng được thực hiện." },
      { title: "Đọc chi phí trước khi tối ưu", detail: "Ghi số phần tử n và số kết quả m. Tìm trong map thường có chi phí kỳ vọng O(1); sắp m kết quả có chi phí O(m log m). Chỉ đổi cấu trúc khi yêu cầu thật sự cần thứ tự hoặc tốc độ đó.", check: "Giải thích được cấu trúc đã chọn và phần dữ liệu nào bị sao chép." },
    ],
    deliverable: "Catalog CLI có thêm, tìm, xóa tài liệu; test cho đầu vào hợp lệ, trùng ID và dữ liệu không tìm thấy.",
    checklist: ["Các method có hợp đồng rõ ràng.", "Test bao phủ đầu vào sai và danh sách rỗng.", "Dữ liệu trả về không làm lộ cấu trúc mutable bên trong.", "Có thể giải thích độ phức tạp của thao tác chính."],
    pitfalls: [
      { problem: "Dùng == để so sánh nội dung String", fix: "Dùng equals hoặc các method chuẩn hóa phù hợp; == chỉ so sánh hai tham chiếu có cùng trỏ tới một object hay không." },
      { problem: "Ghi đè ID cũ khi thêm trùng", fix: "Kiểm tra trước khi put hoặc dùng putIfAbsent rồi báo lỗi mà không làm mất giá trị cũ." },
      { problem: "Stream làm code khó đọc", fix: "Nếu cần nhiều bước hoặc xử lý lỗi, dùng vòng lặp và tên biến rõ thay vì ép mọi thứ thành một chuỗi stream." },
    ],
  },
  {
    number: "02",
    objective: "Mô tả API bằng request/response và truy vấn PostgreSQL mà không làm mất quy tắc quyền, thứ tự hay tính nguyên tử.",
    start: "Nên hoàn thành Java cơ bản. Cài PostgreSQL hoặc Docker nếu muốn chạy database trên máy.",
    steps: [
      { title: "Viết hợp đồng HTTP trước", detail: "Cho mỗi thao tác, ghi method, path, body, status thành công và lỗi. Phân biệt 400 dữ liệu sai, 401 chưa đăng nhập, 404 không thấy hoặc không được phép thấy, 409 xung đột." , check: "Có ví dụ request và JSON response cho tạo, đọc, xóa tài liệu." },
      { title: "Tạo schema có ràng buộc", detail: "Tạo users và documents. Đặt primary key, foreign key, NOT NULL cho trường bắt buộc; quyết định rõ ID do database sinh hay client cung cấp.", check: "Thử insert title null, owner không tồn tại và ID trùng; database phải từ chối." },
      { title: "Viết truy vấn từng phần", detail: "Dùng LEFT JOIN để vẫn hiện người dùng chưa có tài liệu. COUNT(d.id) đếm tài liệu thật; COUNT(*) còn đếm dòng bên trái được giữ lại.", check: "Kết quả An=2, Bình=1, Chi=0." },
      { title: "Phân trang bằng cursor ổn định", detail: "Sắp theo created_at DESC, id DESC. Cursor phải giữ đủ hai giá trị sắp xếp; chỉ dùng created_at có thể bỏ sót hoặc lặp dòng khi thời gian bằng nhau.", check: "Page size 1 trả 102, lần kế tiếp dùng cursor trả 101." },
      { title: "Thử rollback nhiều thao tác", detail: "Bắt đầu transaction, thêm document và audit record, sau đó rollback. Kiểm tra cả hai bảng; nếu chỉ còn một bản ghi thì boundary transaction chưa bao trùm đúng thao tác.", check: "Sau rollback không còn document 103 và không còn audit record tương ứng." },
      { title: "Đo truy vấn trước khi thêm index", detail: "Dùng EXPLAIN (ANALYZE, BUFFERS) trên dữ liệu đủ lớn và có cấu trúc gần thực tế. Bảng ba dòng không chứng minh index giúp nhanh hơn.", command: "EXPLAIN (ANALYZE, BUFFERS) SELECT id, title FROM documents WHERE owner_id = 1 ORDER BY created_at DESC, id DESC;", check: "Ghi truy vấn, kích thước dữ liệu và kế hoạch trước/sau; không kết luận từ một lần chạy nhỏ." },
    ],
    deliverable: "Một API contract, schema PostgreSQL, truy vấn phân trang và ví dụ transaction có thể kiểm chứng.",
    checklist: ["Status code phân biệt lỗi input, đăng nhập, quyền và xung đột.", "Người có 0 tài liệu vẫn xuất hiện trong truy vấn tổng hợp.", "Cursor tạo thứ tự xác định.", "Rollback hoàn tác toàn bộ thao tác nghiệp vụ."],
    pitfalls: [
      { problem: "Nhận ownerId từ body để cấp quyền", fix: "Lấy người dùng từ principal đã xác thực; body không phải nguồn tin cậy cho danh tính." },
      { problem: "Dùng OFFSET sâu cho dữ liệu thay đổi liên tục", fix: "Chọn cursor dựa trên khóa sắp xếp duy nhất để trang kế tiếp ít bị lặp hoặc bỏ sót." },
      { problem: "Tạo index cho mọi cột", fix: "Đo truy vấn thực tế; index tăng chi phí ghi và dung lượng lưu trữ." },
    ],
  },
  {
    number: "03",
    objective: "Biến hợp đồng API thành ứng dụng Spring Boot có lớp rõ ràng, validation và dữ liệu lưu bền.",
    start: "Đã có Java, API contract và schema từ hai chặng trước. Dùng dự án knowledge-assistant làm mẫu để tránh đổi phiên bản tùy tiện.",
    steps: [
      { title: "Tạo và chạy ứng dụng rỗng", detail: "Chọn phiên bản Spring Boot và Java tương thích; thêm Spring Web, Validation, Spring Data JPA, PostgreSQL Driver và Flyway. Chạy ứng dụng trước khi thêm logic.", check: "Ứng dụng khởi động không lỗi và endpoint health/hello trả response." },
      { title: "Tách Controller, Service, Repository", detail: "Controller nhận HTTP và chuyển sang DTO; service giữ quy tắc nghiệp vụ; repository đọc/ghi dữ liệu. Tiêm dependency qua constructor để phụ thuộc hiện rõ.", check: "Controller không tự tạo connection database hay nhét quy tắc quyền vào câu SQL tùy tiện." },
      { title: "Dùng DTO và validation", detail: "Tạo request DTO có @NotBlank và @Size. Không nhận entity trực tiếp từ client; không để client tự chọn ownerId. Ánh xạ request sang domain ở service.", check: "Request sai trả 400 với lỗi xác định được trường nào sai." },
      { title: "Theo dõi schema bằng migration", detail: "Tạo migration V1__...sql, khởi động trên PostgreSQL rỗng rồi mới thêm entity/repository. Migration là lịch sử thay đổi, không phải file SQL bị sửa tùy hứng sau khi deploy.", check: "Dựng lại database mới chỉ bằng cấu hình và migration." },
      { title: "Thêm truy vấn và lỗi có quy ước", detail: "Viết truy vấn có ownerId cùng resource ID. Ánh xạ NotFound thành 404, input không hợp lệ thành 400; không trả stack trace trong response.", check: "Người dùng khác không thể đọc tài liệu bằng cách đoán ID." },
      { title: "Kiểm tra thao tác nghiệp vụ", detail: "Viết một test cho đường thành công và một test cho lỗi. Với database, khởi động PostgreSQL test thay vì chỉ mock repository cho mọi thứ.", command: ".\\mvnw.cmd test", check: "Build và test chạy trên cùng phiên bản Java đã ghi trong README." },
    ],
    deliverable: "API tạo/đọc/sửa/xóa tài liệu có DTO, validation, migration và database PostgreSQL.",
    checklist: ["Ứng dụng khởi động lại vẫn còn dữ liệu.", "Request không hợp lệ bị từ chối.", "Quyền được kiểm tra ở server.", "README có lệnh dựng database, chạy test và khởi động app."],
    pitfalls: [
      { problem: "Controller vừa nhận HTTP vừa làm toàn bộ nghiệp vụ", fix: "Chuyển quy tắc vào service để có thể kiểm tra độc lập và giữ controller mỏng." },
      { problem: "Sửa schema trực tiếp trên máy", fix: "Tạo migration mới để môi trường sạch và CI dựng lại được cùng cấu trúc." },
      { problem: "Mock database rồi xem như đã kiểm tra persistence", fix: "Bổ sung integration test với PostgreSQL cho mapping, transaction và truy vấn quan trọng." },
    ],
  },
  {
    number: "04",
    objective: "Phát hiện lỗi trước khi deploy, bảo vệ dữ liệu theo người dùng và chạy lại ứng dụng từ môi trường sạch.",
    start: "Có API chạy trên PostgreSQL. Chặng này kiểm tra hành vi khi có lỗi, nhiều người dùng và môi trường khác máy lập trình.",
    steps: [
      { title: "Viết test từ ranh giới hành vi", detail: "Tạo test cho đầu vào sai, tài nguyên không tồn tại, ID trùng và danh sách rỗng. Mỗi test nên thất bại vì đúng một hành vi sai.", check: "Khi cố ý bỏ quy tắc, test tương ứng phải đỏ." },
      { title: "Tách xác thực khỏi phân quyền", detail: "Xác thực trả lời ai đang gọi; phân quyền trả lời người đó được làm gì. Lấy user ID từ security principal, rồi truy vấn theo cả resource ID và user ID.", check: "Hai người dùng thử cùng ID; người ngoài phạm vi nhận kết quả đã chọn trong API contract." },
      { title: "Kiểm tra database thật", detail: "Dùng integration test cho migration, truy vấn và transaction. Test fixture phải tạo dữ liệu riêng và dọn dẹp để kết quả không phụ thuộc lần chạy trước.", check: "Test chạy lại nhiều lần mà không cần sửa tay database." },
      { title: "Đóng gói cấu hình", detail: "Build JAR, tạo image JRE 21 và truyền database URL/password qua biến môi trường. Trong Docker Compose, app gọi database theo tên service, không theo localhost.", command: ".\\mvnw.cmd package\ndocker compose up --build", check: "Một người khác chạy các lệnh từ bản clone sạch và gọi được endpoint." },
      { title: "Đặt tiêu chí cho CI", detail: "Pipeline chạy format/lint nếu có, unit test, integration test và package theo cùng thứ tự. Một lỗi test làm pipeline dừng; log ghi request ID nhưng không in token hay nội dung tài liệu riêng tư.", check: "Mở một commit làm test thất bại và xác nhận job không báo xanh." },
    ],
    deliverable: "Bộ test quyền và nghiệp vụ, cấu hình Docker, cùng pipeline CI có thể chặn thay đổi sai.",
    checklist: ["Test phân biệt người có quyền và người không có quyền.", "Integration test dùng database thật cho luồng lưu quan trọng.", "Không có bí mật trong Git hoặc log.", "Ứng dụng chạy từ môi trường sạch theo README."],
    pitfalls: [
      { problem: "Ẩn tài liệu người khác ở giao diện nhưng API vẫn trả dữ liệu", fix: "Kiểm tra owner ở backend trước khi trả hoặc sửa tài nguyên." },
      { problem: "Dùng localhost giữa hai container", fix: "Dùng tên service database trong network của Compose." },
      { problem: "CI chỉ compile mà không chạy test", fix: "Đặt test là bước bắt buộc và không cho pipeline tiếp tục khi thất bại." },
    ],
  },
  {
    number: "05",
    objective: "Thêm một chức năng gọi mô hình có giới hạn rõ, kiểm tra đầu ra và xử lý lỗi có thể dự đoán.",
    start: "API đã lưu tài liệu và kiểm tra quyền. Bắt đầu bằng gateway giả để test không phụ thuộc khóa hay nhà cung cấp.",
    steps: [
      { title: "Tạo ranh giới gọi mô hình", detail: "Đặt interface/gateway sau service; controller không gọi provider trực tiếp. Bài mẫu dùng gateway giả có response định trước để bạn kiểm tra logic trước.", check: "Test chạy không cần API key và có thể giả lập 503, 400, response rỗng." },
      { title: "Giữ chỉ dẫn tách khỏi tài liệu", detail: "System prompt chứa cách làm; nội dung tài liệu đi vào trường dữ liệu riêng. Không nối tài liệu thô vào system instruction và không gửi tài liệu khi quyền chưa được xác nhận.", check: "Test với văn bản chứa Ignore previous instructions vẫn giữ nguyên ranh giới dữ liệu." },
      { title: "Tính ngân sách và giới hạn request", detail: "Đặt giới hạn độ dài, timeout và số token đầu ra theo tài liệu của provider đang dùng. Tính ngân sách cho cả schema, lịch sử hội thoại và tool nếu có.", check: "Input vượt giới hạn bị chặn trước khi gọi provider." },
      { title: "Kiểm tra response như dữ liệu không tin cậy", detail: "Parse cấu trúc, từ chối tiêu đề trắng và danh sách bullet rỗng/ quá dài. JSON parse thành công không chứng minh nội dung đúng.", check: "Có test response thiếu trường, sai kiểu và nội dung rỗng." },
      { title: "Retry hữu hạn theo loại lỗi", detail: "Thử lại tối đa một lần cho 429/503 trong bài này; không thử lại 400 hoặc lỗi validation. Khi dùng thật, thêm backoff và tôn trọng retry-after của provider.", check: "Chuỗi 503 rồi thành công gọi hai lần; hai lỗi tạm thời liên tiếp thì dừng." },
    ],
    deliverable: "Endpoint tóm tắt tài liệu có gateway, validation, timeout và test các loại lỗi.",
    checklist: ["Quyền sở hữu được kiểm tra trước khi gửi dữ liệu.", "Gateway giả chạy test không cần Internet hay khóa API.", "Response provider được xác thực trước khi trả client.", "Retry có giới hạn và chỉ áp dụng cho lỗi đã chọn."],
    pitfalls: [
      { problem: "Gọi AI thật trong mọi unit test", fix: "Tiêm gateway giả; chỉ chạy test provider thật như một bước tích hợp riêng." },
      { problem: "Retry mọi exception", fix: "Phân loại lỗi tạm thời và lỗi người dùng; retry sai loại làm tăng tải và độ trễ." },
      { problem: "Coi JSON hợp lệ là câu trả lời đúng", fix: "Kiểm tra căn cứ riêng; cấu trúc hợp lệ không thay thế đánh giá nội dung." },
    ],
  },
  {
    number: "06",
    objective: "Truy xuất đoạn tài liệu đúng quyền, trả nguồn kiểm chứng được và đo chất lượng thay vì chỉ xem vài câu trả lời.",
    start: "Đã có API tài liệu, ranh giới quyền và gateway AI. Dùng fixture nhỏ trước khi thêm embedding model hay vector database.",
    steps: [
      { title: "Chuẩn bị bộ tài liệu có nhãn", detail: "Mỗi đoạn cần ID, document ID, owner, phiên bản và nội dung. Ghi câu hỏi mẫu cùng tập ID nguồn kỳ vọng để có căn cứ so sánh.", check: "Có câu hỏi có đáp án, không có đáp án và câu chạm tới dữ liệu ngoài quyền." },
      { title: "Chia đoạn và giữ metadata", detail: "Chọn kích thước và overlap; đảm bảo bước tiến lớn hơn 0 và đoạn cuối được giữ. Fixture dùng tách theo từ để kiểm tra thuật toán, không đại diện tokenizer của model.", check: "Với a b c d e f g, size 4, overlap 1 nhận hai đoạn có chung d." },
      { title: "Lọc quyền trước khi xếp hạng", detail: "Áp điều kiện owner trong truy vấn vector, sau đó mới lấy top-k. Không lấy top-k toàn hệ thống rồi lọc hậu kỳ vì kết quả có thể thiếu tài liệu hợp lệ và rò rỉ metadata.", check: "Tài liệu của user khác không xuất hiện trong danh sách candidate hoặc citation." },
      { title: "Kiểm tra nguồn và trường hợp thiếu bằng chứng", detail: "Citation phải thuộc các đoạn đã truy xuất. Nếu không có đoạn đạt ngưỡng, trả trạng thái thiếu ngữ cảnh thay vì gọi model để đoán.", check: "ID nguồn lạ và citation rỗng bị từ chối." },
      { title: "Đánh giá từng bước của pipeline", detail: "Đo Precision@k/Recall@k cho retrieval; kiểm tra riêng câu trả lời có được hỗ trợ và citation có trỏ đúng đoạn. Ghi kết quả trước/sau khi đổi chunk, embedding hoặc prompt.", check: "Cùng một bộ câu hỏi chạy lại được và báo rõ câu nào tăng/giảm chất lượng." },
      { title: "Đồng bộ cập nhật và xóa", detail: "Khi tài liệu đổi hoặc bị xóa, các chunk và vector cũ phải được thay hoặc xóa cùng transaction/quy trình nhất quán. Lưu phiên bản để truy vết câu trả lời cũ.", check: "Test cập nhật tài liệu không trả nội dung phiên bản cũ." },
    ],
    deliverable: "API hỏi đáp trả câu trả lời kèm nguồn, có nhánh thiếu bằng chứng và bộ đánh giá retrieval.",
    checklist: ["Quyền được áp dụng trong bước retrieval.", "Citation nằm trong tập đoạn đã truy xuất.", "Có câu hỏi kiểm tra thiếu dữ liệu và truy cập chéo.", "Có chỉ số và ví dụ lỗi trước/sau thay đổi."],
    pitfalls: [
      { problem: "Lọc quyền sau top-k", fix: "Đưa điều kiện quyền vào truy vấn trước khi xếp hạng và cắt top-k." },
      { problem: "Coi cosine cao là bằng chứng đủ", fix: "Đặt ngưỡng trên bộ dữ liệu đã gán nhãn và cho phép trả thiếu ngữ cảnh." },
      { problem: "Chỉ kiểm tra câu trả lời cuối", fix: "Đo retrieval, độ đúng câu trả lời và độ đúng citation thành ba phần riêng." },
    ],
  },
];
