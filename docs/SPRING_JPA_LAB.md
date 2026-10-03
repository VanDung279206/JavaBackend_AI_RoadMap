# F01 — Đo N+1, fetch strategy, transaction và OpenAPI

Tiên quyết: P2.2, P3.1–P3.4 và kiến thức `@Entity`. Phiên bản giữ Spring Boot 3.5.16 / Java target 17.

```bash
python3 scripts/new_spring_lab.py --phase 3 --destination work/spring-p3
python3 scripts/maven.py -f work/spring-p3/pom.xml -Dtest=FetchLabTest test
```

Sửa `work/spring-p3/src/main/resources/lab-fetch.jpql`. Bản tự làm bỏ fetch nên test bắt đầu đỏ. Ba author, mỗi author có một book. Lấy authors dùng 1 query; khi đọc books LAZY phát sinh thêm 3, tổng 4. Fetch join nạp cùng truy vấn; EntityManager.clear trước đo để first-level cache không che lỗi. Không bật EAGER toàn hệ thống để vá một endpoint.

Cơ bản: đọc SQL và dự đoán số query. Trung bình: sửa JPQL để còn 1 query, vẫn đủ ba title. Nâng cao: thêm author không book, dùng LEFT JOIN thay INNER JOIN; thử phân trang collection fetch và giải thích tại sao cần page IDs trước rồi fetch. Biến thể: DTO projection cho màn hình chỉ cần số lượng book, không nạp toàn bộ collection.

Ba gợi ý: (1) lúc nào `.books` được truy cập? (2) query count=4 dù chỉ gọi createQuery một lần; (3) `left join fetch a.books` và giữ thứ tự ID.

Lời giải: [lab-fetch.jpql](../projects/knowledge-assistant/src/main/resources/lab-fetch.jpql); test đo trong [FetchLabTest](../projects/knowledge-assistant/src/test/java/vn/roadmap/jpalab/FetchLabTest.java). Test này kiểm lab JPA; không chứng minh mọi endpoint app hết N+1.

Transaction: chạy `TransactionTest` trên **bản tự làm** để audit lỗi phải rollback document. Bản phase 3 đã bỏ `@Transactional` khỏi create; sửa boundary ở service. Test PostgreSQL `TransactionIT` cần Docker; H2 không chứng minh isolation PostgreSQL. Thêm test truy cập chéo owner trong ApiTest, không cấp kết quả chỉ vì HTTP 200.

OpenAPI: hợp đồng máy đọc được nằm ở `src/main/resources/static/openapi.json`; mở `/openapi.json` bằng tài khoản demo khi app chạy. Cơ bản: so request/response với DTO. Trung bình: xóa response 409 trong bản tự làm rồi khôi phục đúng hợp đồng stale version. Nâng cao: thêm schema validator cho payload âm và biên. `OpenApiContractTest` kiểm tra route và field DTO không lệch; `ApiTest` kiểm tra payload sai/owner/version. Chúng chưa chứng minh tuân thủ đầy đủ JSON Schema/OpenAPI.

Tham khảo: [Spring Boot 3.5](https://docs.spring.io/spring-boot/3.5/index.html), [Hibernate 6.6 fetching](https://docs.jboss.org/hibernate/orm/6.6/userguide/html_single/Hibernate_User_Guide.html#fetching).
