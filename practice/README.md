# Làm bài, chạy test, rồi mới đối chiếu

| Thư mục | Vai trò |
| --- | --- |
| `starter/` | Bạn sửa các `TODO` ở đây |
| `tests/` | Cùng hợp đồng kiểm thử cho starter và solution |
| `solution/` | Lời giải tham chiếu để đối chiếu sau lần tự làm |
| `sql/` | Bài PostgreSQL có fixture, starter, solution và assertion SQL |

Từ gốc repo, bắt đầu **một bài**:

```bash
python3 scripts/check.py --id P1.1
```

Ban đầu kết quả `FAIL ... TODO P1.1` là đúng vì bạn chưa viết lời giải. Sửa `practice/starter/JavaCoreLab.java`, chạy lại cùng lệnh. Runner chỉ biên dịch starter và tests; không nạp solution để thay thế phần bạn chưa làm.

```bash
# Một vài bài đã làm
python3 scripts/check.py --id P1.1,P1.2,D01
# Tất cả bài tự làm: chỉ nên chạy khi đã học đủ
python3 scripts/check.py
# Đối chiếu lời giải tham chiếu
python3 scripts/check.py --mode solution --id P1.1
```

Windows: dùng `py` thay `python3`. Cần JDK 17+ và Python 3; không cần Maven hoặc mạng cho runner này. P1.2/P1.4 dùng constructor Document nên phải hoàn thành P1.1 trước; P5.4 dùng validate nên cần P5.3 trước. Các ID khác có thể chọn độc lập.

41 nhóm gồm 14 bài quy tắc Java/backend/AI/RAG, D01–D15 và V01–V12. Những bài thiết kế API, SQL, Spring và triển khai có cách kiểm tra riêng trong [bảng đủ 24 bài](../docs/EXERCISE_MAP.md). Không coi Java thuần pass là bằng chứng database/HTTP/model thật chạy đúng.

## Dùng JUnit khi đến Phase 4

```bash
mvn -f practice/pom.xml clean test -Dexercise=P1.1
mvn -f practice/pom.xml clean test -Dcode.mode=solution
```

Mặc định Maven cũng chạy starter. Dùng `clean` khi đổi mode để loại class build cũ. JUnit adapter tổ chức mỗi ID thành một dynamic test; bộ assertion vẫn là `PracticeChecks`. Không cộng hai lượt chạy này thành hai bộ bằng chứng độc lập.

## Mỗi lần test đỏ

Đọc ID và expected/actual → tạo input nhỏ hơn → dự đoán biến trung gian → debug → sửa → chạy lại. Nếu test sai hợp đồng, ghi rõ lý do và đối chiếu đề; không sửa expected chỉ để có màu xanh.

Test pass chỉ kiểm tra những ca đã có. Để hoàn thành một bài, bạn còn phải tự viết ít nhất một ca mới, giải thích invariant và làm lại với dữ liệu khác.
