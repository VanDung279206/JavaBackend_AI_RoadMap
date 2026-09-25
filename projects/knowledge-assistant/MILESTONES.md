# Mốc dự án xuyên suốt

Đây là các mốc hành vi trên một mô hình document, không phải sáu ứng dụng rời. Bản tham chiếu có sẵn mã; bản tự làm cần commit và bằng chứng riêng.

| Mốc | Học / tự làm | Lệnh hoặc tình huống kiểm chứng | Bằng chứng cần lưu |
| --- | --- | --- | --- |
| M0 | JDK, IDE, Git | HelloRoadmap + sửa DebugDemo | output, commit đầu |
| M1 | Catalog trên terminal | `python3 scripts/run_catalog.py --mode starter` sau P1.1–P1.4 | add/list/search/delete, duplicate ID |
| M2 | Schema và HTTP contract | psql fixture→starter→tests | query, result, rollback/commit |
| M3 | CRUD Spring | copy P3; ApiTest | POST 201, GET/PUT200, DELETE204, input400 |
| M4 | Quyền và persistence | postgres+Testcontainers; restart giữ volume | owner404, anonymous401, rollback, log CI |
| M5 | Summary | demo trước; Ollama khi sẵn sàng | mode, prompt, model/config; thiếu quyền gọi0 lần |
| M6 | Hỏi đáp có nguồn | demo lexical; sau đó index pgvector+model | owner/source/revision, no-context, evaluation từng câu |

Sau mỗi mốc: một commit giải thích thay đổi, một ghi chú lỗi, một bài DSA hoặc biến thể liên quan và 3–5 câu tiếng Anh. Học sinh tự điền trạng thái, không đánh dấu trước vì repo có lời giải.
