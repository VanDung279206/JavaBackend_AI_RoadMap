# Tài liệu chính thức

Các trang chính được đối chiếu ngày 23/09/2026. Đây là các trang có thể cập nhật; khi làm bài, ghi lại phiên bản đang sử dụng.

| Chủ đề | Tài liệu | Dùng để làm gì? |
| --- | --- | --- |
| Java | [Learn Java](https://dev.java/learn/) | Cú pháp, OOP, collections, exceptions và stream |
| Git | [Pro Git](https://git-scm.com/book/en/v2) | Quản lý phiên bản và nhánh |
| Maven | [Getting Started](https://maven.apache.org/guides/getting-started/) | Cấu trúc dự án, dependency và build |
| HTTP API | [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/) | Bắt đầu với request/response JSON trong Spring |
| PostgreSQL | [Tutorial](https://www.postgresql.org/docs/current/tutorial.html) | SQL và database quan hệ |
| Spring Boot | [System Requirements](https://docs.spring.io/spring-boot/system-requirements.html) | Kiểm tra Java và công cụ build tương thích |
| Kiểm thử | [Spring Boot Testing](https://docs.spring.io/spring-boot/reference/testing/index.html) | Công cụ kiểm thử ứng dụng Spring Boot |
| Phân quyền | [Spring Security](https://docs.spring.io/spring-security/reference/index.html) | Xác thực và kiểm soát truy cập |
| Docker | [Get Started](https://docs.docker.com/get-started/) | Container và cách chạy ứng dụng |
| Spring AI | [Getting Started](https://docs.spring.io/spring-ai/reference/getting-started.html) | Tương thích phiên bản và dependency |
| Gọi mô hình | [Chat Client API](https://docs.spring.io/spring-ai/reference/api/chatclient.html) | Tích hợp hội thoại và xử lý phản hồi |
| RAG | [Retrieval Augmented Generation](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html) | Bổ sung ngữ cảnh từ dữ liệu truy xuất |
| Vector store | [PGvector](https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html) | Tích hợp pgvector với Spring AI |
| Đánh giá | [Evaluation Testing](https://docs.spring.io/spring-ai/reference/api/testing.html) | Đánh giá đầu ra AI |
| Mở rộng | [Tool Calling](https://docs.spring.io/spring-ai/reference/api/tools.html) | Kết nối mô hình với hàm của ứng dụng |

## Ghi nhận tương thích

- Spring AI: tài liệu Getting Started ghi nhánh 2.0.x hỗ trợ Spring Boot 4.0.x và 4.1.x.
- Spring Boot: trang System Requirements được đọc ghi bản 4.1.1 yêu cầu Java tối thiểu 17 và tương thích đến Java 26.
- Lựa chọn học tập của repo: Java 21. Khi sinh mã ứng dụng, ghi phiên bản cụ thể vào cấu hình build và README của ứng dụng.

## Nguồn dùng cho bản cải tiến (đối chiếu 24/09/2026)

- [Boot 3.5 system requirements](https://docs.spring.io/spring-boot/3.5/system-requirements.html).
- [Boot managed dependency versions](https://docs.spring.io/spring-boot/3.5/appendix/dependency-versions/coordinates.html): project dùng dependency management của Boot, gồm JUnit/Testcontainers.
- [Spring AI repository](https://github.com/spring-projects/spring-ai): ma trận nhánh Boot/AI.
- [Spring AI 1.1.8 release](https://spring.io/blog/2026/06/12/spring-ai-1-1-8-1-0-9-avaialble-now/).
- [JUnit 5.13.1 guide](https://docs.junit.org/5.13.1/user-guide/index.html): adapter practice độc lập dùng 5.13.1.
- [Testcontainers JUnit](https://java.testcontainers.org/test_framework_integration/junit_5/): tài liệu current có thể dùng 2.x; app Boot này quản lý nhánh 1.21.4, không sao chép artifact/package 2.x vào.
- [Ollama chat](https://docs.spring.io/spring-ai/reference/1.0/api/chat/ollama-chat.html), [Ollama embedding](https://docs.spring.io/spring-ai/reference/1.0/api/embeddings/ollama-embeddings.html): cấu hình chat/embedding; đối chiếu lại API nhánh 1.1 khi nâng dependency.
- [pgvector chính thức](https://github.com/pgvector/pgvector): cosine distance, vector types và filtering.

Nguồn giúp kiểm tra hợp đồng và tương thích; không thay thế một lượt Maven/integration test thực tế. Bản repo không tuyên bố dùng phiên bản mới nhất.

## Nguồn cho bổ sung v1

- [Apache Maven 3.9.11 release notes](https://maven.apache.org/docs/3.9.11/release-notes.html): phiên bản distribution được pin trong wrapper; không tuyên bố là phiên bản mới nhất.
- [Java Future](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Future.html): get với thời hạn, cancel và interrupt; bài chỉ dùng API đã có ở Java17.
- [Spring Data JPA locking](https://docs.spring.io/spring-data/jpa/reference/jpa/locking.html): khai báo LockModeType trên phương thức repository. Đối chiếu nhánh dependency của app khi thay phiên bản.