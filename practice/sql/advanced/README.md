# Q01 — JOIN nhiều bảng, CTE, window và tối ưu

Tiên quyết: P2.2–P2.4. PostgreSQL 17. Chạy trên DB thực hành riêng vì fixture đặt lại schema `roadmap_analytics`.

```bash
psql -v ON_ERROR_STOP=1 -f practice/sql/advanced/fixture.sql -f practice/sql/advanced/starter.sql -f practice/sql/advanced/tests.sql
```

Một user có nhiều document, một document có nhiều lượt đọc. JOIN thẳng rồi COUNT(document.id) sẽ đếm trùng tài liệu. CTE `per_document` gom lượt đọc về một hàng/tài liệu trước khi JOIN user. LEFT JOIN giữ Chi chưa có tài liệu. Window `dense_rank` xếp hạng tổng phút; khác GROUP BY, window giữ từng hàng đầu ra.

Cơ bản: báo cáo An có 2 tài liệu/60 phút, Binh 1/15, Chi 0/0. Trung bình: thêm 45 phút cho Binh, cả An và Binh hạng 1; Chi hạng 2. Nâng cao: xem kế hoạch trên bảng events 100.000 hàng:

```sql
SET search_path=roadmap_analytics;
EXPLAIN (ANALYZE,BUFFERS) SELECT * FROM events WHERE owner_id=42 ORDER BY day LIMIT 20;
CREATE INDEX events_owner_day ON events(owner_id,day);
ANALYZE events;
EXPLAIN (ANALYZE,BUFFERS) SELECT * FROM events WHERE owner_id=42 ORDER BY day LIMIT 20;
```

So buffers, số rows, sort và plan; không khẳng định index luôn nhanh hoặc dùng một ngưỡng milliseconds cho mọi máy. Biến thể: top-2 tài liệu trong từng owner dùng `row_number() over(partition by owner_id order by minutes desc,id)`; giải thích tie-break id.

Ba gợi ý: (1) grain của mỗi hàng sau JOIN là gì? (2) document 10 có hai lượt đọc nhưng chỉ một tài liệu; (3) aggregate theo document trong CTE, LEFT JOIN learners, aggregate owner, sau đó dense_rank.

Lời giải chạy được: [solution.sql](solution.sql). Nguyên nhân sửa: thu hẹp grain trước khi count để tránh double-count; `COUNT(d.id)` không đếm hàng null của LEFT JOIN.

## Isolation thực nghiệm hai phiên

Tiên quyết: P2.4, hiểu COMMIT/ROLLBACK. Session A: `BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT count(*) FROM roadmap_analytics.reads;`. Session B: `INSERT INTO roadmap_analytics.reads VALUES(12,1);`. A đọc lại thấy snapshot cũ; sau COMMIT đọc lại thấy tăng một. Lặp với READ COMMITTED thấy lần SELECT thứ hai đọc dữ liệu đã commit mới. ROLLBACK transaction A không hoàn tác insert của B. Dọn đúng hàng fixture sau thí nghiệm.

Starter: hai terminal psql; test quan sát count trước/sau và chụp log từng phiên. Nâng cao: hai transaction cùng cập nhật một dòng, ghi SQLSTATE khi serialization failure rồi retry **toàn bộ transaction**, không chỉ câu SQL cuối. Biến thể: mô phỏng write skew và so SERIALIZABLE; không kết luận row lock ngăn mọi anomaly.

Tham khảo: [PostgreSQL 17 window](https://www.postgresql.org/docs/17/tutorial-window.html), [isolation](https://www.postgresql.org/docs/17/transaction-iso.html), [EXPLAIN](https://www.postgresql.org/docs/17/using-explain.html).
