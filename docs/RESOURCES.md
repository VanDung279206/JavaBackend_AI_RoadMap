# Tài liệu chính thức

Các trang chính được đối chiếu ngày 23/09/2026. Đây là các trang có thể cập nhật; khi làm bài, ghi lại phiên bản đang sử dụng.

| Chủ đề | Tài liệu | Dùng để làm gì? |
| --- | --- | --- |
| Java | [Learn Java](https://dev.java/learn/) | Cú pháp, OOP, collections, exceptions và stream |
| Git | [Pro Git](https://git-scm.com/book/en/v2) | Quản lý phiên bản và nhánh |
| Maven | [Getting Started](https://maven.apache.org/guides/getting-started/) | Cấu trúc dự án, dependency và build |
| HTTP API | [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/) | Bắt đầu với request/response JSON trong Spring |
| PostgreSQL | [Tutorial](https://www.postgresql.org/docs/17/tutorial.html) | SQL và database quan hệ |
| Spring Boot | [System Requirements](https://docs.spring.io/spring-boot/3.5/system-requirements.html) | Kiểm tra Java và công cụ build tương thích |
| Kiểm thử | [Spring Boot Testing](https://docs.spring.io/spring-boot/3.5/reference/testing/index.html) | Công cụ kiểm thử ứng dụng Spring Boot |
| Phân quyền | [Spring Security](https://docs.spring.io/spring-security/reference/6.5/index.html) | Xác thực và kiểm soát truy cập |
| Docker | [Get Started](https://docs.docker.com/get-started/) | Container và cách chạy ứng dụng |
| Spring AI | [Getting Started](https://github.com/spring-projects/spring-ai/blob/v1.1.8/spring-ai-docs/src/main/antora/modules/ROOT/pages/getting-started.adoc) | Tương thích phiên bản và dependency |
| Gọi mô hình | [Chat Client API](https://github.com/spring-projects/spring-ai/blob/v1.1.8/spring-ai-docs/src/main/antora/modules/ROOT/pages/api/chatclient.adoc) | Tích hợp hội thoại và xử lý phản hồi |
| RAG | [Retrieval Augmented Generation](https://github.com/spring-projects/spring-ai/blob/v1.1.8/spring-ai-docs/src/main/antora/modules/ROOT/pages/api/retrieval-augmented-generation.adoc) | Bổ sung ngữ cảnh từ dữ liệu truy xuất |
| Vector store | [PGvector](https://github.com/spring-projects/spring-ai/blob/v1.1.8/spring-ai-docs/src/main/antora/modules/ROOT/pages/api/vectordbs/pgvector.adoc) | Tích hợp pgvector với Spring AI |
| Đánh giá | [Evaluation Testing](https://github.com/spring-projects/spring-ai/blob/v1.1.8/spring-ai-docs/src/main/antora/modules/ROOT/pages/api/testing.adoc) | Đánh giá đầu ra AI |
| Mở rộng | [Tool Calling](https://github.com/spring-projects/spring-ai/blob/v1.1.8/spring-ai-docs/src/main/antora/modules/ROOT/pages/api/tools.adoc) | Kết nối mô hình với hàm của ứng dụng |

## Ghi nhận tương thích

Repo giữ Java target 17 (khuyến nghị runtime JDK 21), Spring Boot 3.5.16, Spring Framework 6.2, Security 6.5, Data JPA 3.5, Spring AI 1.1.8 và PostgreSQL 17. Liên kết Spring AI trỏ thẳng tài liệu ở tag v1.1.8 để không nhảy sang API 2.x; các nhánh Spring/PostgreSQL được ghi rõ trong URL. Trang dev.java cập nhật theo Java mới: chỉ áp dụng ví dụ tương thích target 17, không dùng compact main/preview để làm bài repo.

Đã kiểm tra đường dẫn vào 03/10/2026; mã HTTP chỉ xác nhận truy cập được, không chứng nhận mọi ví dụ upstream phù hợp. Không đổi dependency để theo bản mới nhất.

## Nguồn dùng cho bản cải tiến (đối chiếu 24/09/2026)

- [Boot 3.5 system requirements](https://docs.spring.io/spring-boot/3.5/system-requirements.html).
- [Boot managed dependency versions](https://docs.spring.io/spring-boot/3.5/appendix/dependency-versions/coordinates.html): project dùng dependency management của Boot, gồm JUnit/Testcontainers.
- [Spring AI repository](https://github.com/spring-projects/spring-ai): ma trận nhánh Boot/AI.
- [Spring AI 1.1.8 release](https://spring.io/blog/2026/06/12/spring-ai-1-1-8-1-0-9-avaialble-now/).
- [JUnit 5.13.1 guide](https://docs.junit.org/5.13.1/user-guide/index.html): adapter practice độc lập dùng 5.13.1.
- [Testcontainers JUnit](https://java.testcontainers.org/test_framework_integration/junit_5/): tài liệu current có thể dùng 2.x; app Boot này quản lý nhánh 1.21.4, không sao chép artifact/package 2.x vào.
- [Ollama chat](https://github.com/spring-projects/spring-ai/blob/v1.1.8/spring-ai-docs/src/main/antora/modules/ROOT/pages/api/chat/ollama-chat.adoc), [Ollama embedding](https://github.com/spring-projects/spring-ai/blob/v1.1.8/spring-ai-docs/src/main/antora/modules/ROOT/pages/api/embeddings/ollama-embeddings.adoc): cấu hình chat/embedding; đã ghim nguồn theo tag 1.1.8 của dependency.
- [pgvector chính thức](https://github.com/pgvector/pgvector): cosine distance, vector types và filtering.

Nguồn giúp kiểm tra hợp đồng và tương thích; không thay thế một lượt Maven/integration test thực tế. Bản repo không tuyên bố dùng phiên bản mới nhất.

## Nguồn cho bổ sung v1

- [Apache Maven 3.9.11 release notes](https://maven.apache.org/docs/3.9.11/release-notes.html): phiên bản distribution được pin trong wrapper; không tuyên bố là phiên bản mới nhất.
- [Java Future](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Future.html): get với thời hạn, cancel và interrupt; bài chỉ dùng API đã có ở Java17.
- [Spring Data JPA locking](https://docs.spring.io/spring-data/jpa/reference/3.5/jpa/locking.html): khai báo LockModeType trên phương thức repository. Đối chiếu nhánh dependency của app khi thay phiên bản.