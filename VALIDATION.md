# Kiểm chứng RoadMap_v3

Ngày 03/10/2026, Asia/Bangkok. Nhánh `RoadMap_v3` bắt đầu từ `origin/main` commit `e50b9fd`. Đã đọc cấu trúc, mã hiện có và AGENTS do Next.js sinh. Không đổi phiên bản dependency: Java target 17, Boot 3.5.16, Spring AI 1.1.8, Next 16.3.6. Máy kiểm tra dùng Java 26.0.1/Node 24.21.0; CI giữ Java 21/Node 20.

Kết quả dưới đây chỉ chứng minh repository/bản tham chiếu/fixture. **Không ghi thành tiến độ người học.** Starter thất bại đúng assertion là PASS của regression chống chấm nhầm; bài starter đó vẫn chưa hoàn thành.

## Lệnh và kết quả thực chạy

Máy Windows không có `py` trong PATH. Các lệnh Python dùng executable thật:

```powershell
$pyRunner = 'C:\Users\dung0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$env:PYTHONIOENCODING = 'utf-8'
```

Máy khác thay `& $pyRunner` bằng `python3`/Python 3 đã cài. `verify.py` yêu cầu thư mục báo cáo mới để giữ nguyên lần chạy trước.

| Lệnh / phạm vi | Kết quả | Bằng chứng cục bộ |
| --- | --- | --- |
| `& $pyRunner scripts/verify.py --suite offline --output checks/runs/v3-handoff-offline` | **PASS**, 18 gates: references, tooling, Markdown và starter rejection | `checks/runs/v3-handoff-offline/report.json` |
| `& $pyRunner -m unittest discover -s scripts/tests` | **PASS**, 21 test: invalid ID, đúng bản Spring tự làm, bảo toàn destination, O01 starter, runner limits và các test cũ | `checks/python-v3-final.log` |
| `node scripts/build_catalogue.mjs --check` | **PASS**, 84 ID/32 sessions; phase, prerequisite, hints, seed/generated không lệch | stdout |
| `node website/tests/run.mjs` | **PASS**, 9 test: namespace, offline/conflict, guest/CLI import, backup hỏng, lịch ôn và retrieval | Node test output |
| `node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" --prefix website run lint` | **PASS** | `checks/website-lint-v3.log` |
| Cùng npm CLI, `--prefix website run build` | **PASS**, TypeScript và static export 29 trang theo build output | `checks/website-build-v3-final.log` |
| `& $pyRunner scripts/maven.py -f projects/knowledge-assistant/pom.xml test` | **PASS**, 16 JUnit tests: HTTP/auth/owner/version, fetch/transaction, request ID, OpenAPI route/DTO drift | `checks/maven-v3-final.log` |
| `& $pyRunner scripts/verify.py --suite integration --output checks/runs/v3-handoff-integration` | **PASS**, 8 gates: Maven, adapter AI compile, PostgreSQL, SQL, Docker build, HTTP CRUD/owner/stale write/restart persistence | `checks/runs/v3-handoff-integration/report.json` |
| `& $pyRunner scripts/check_database.py` | **PASS**, V1–V6, catalogue seed, legacy archive, ID/phase/status/revision/account guard, admin escalation, cross-account, fake grade, run vs submit, Q01 | `checks/database-v3-account-guard.log` |
| Cùng database checker: custom dump → DB trống → `pg_restore --exit-on-error` | **PASS**, giữ 100.000 events/archive cũ, RLS và SQL assertions sau restore | Cùng log database |
| `new_spring_lab.py --phase 3 --destination work/v3-spring-validation`; Maven `-Dtest=FetchLabTest test` trên bản đó | Starter **FAIL đúng dự kiến**, 2 test/1 assertion: expected 1 query, actual 4. Regression **PASS** | `checks/learner-spring-v3.log` |
| `new_spring_lab.py --phase 4 --destination work/v3-operations-validation`; Maven `-Dtest=RequestMetricsTest test` trên bản đó | Starter **FAIL đúng dự kiến**, 2 assertion thiếu request ID, 0 lỗi hạ tầng. Test filter tham chiếu **PASS** | `checks/learner-operations-v3.log`, `checks/request-metrics-final.log` |
| `& $pyRunner scripts/load_probe.py --url http://127.0.0.1:18080/health --requests 40 --workers 4` | **PASS**, 40/40 HTTP và request ID, app demo H2 cục bộ | `checks/runs/v3-load/report.json` |
| `& $pyRunner scripts/check_links.py` | **PASS** với file/anchor Markdown cục bộ; HTTP ngoài kiểm riêng | `checks/runs/v3-links/report.json` |

Bản tổng hợp theo Git: [checks/v3-summary.json](checks/v3-summary.json). Log chi tiết `checks/runs`/`*.log` được ignore và có thể tái tạo bằng lệnh trên. Không commit credentials/dump người dùng. Số latency tải nhẹ từ một máy không phải benchmark hay SLA.

Docker/Maven ban đầu bị sandbox hạn chế; các lượt sau với quyền phù hợp đã PASS. Không giữ trạng thái BLOCKED cũ cho những test đã chạy thành công. Node test runner từng lỗi cwd khi gọi từ root; đã sửa và lượt cuối PASS.

## Phạm vi chức năng

| Phần | Đã triển khai | Giới hạn / phần còn thiếu |
| --- | --- | --- |
| Catalogue/nội dung | Phase 0, DSA/variants/debug/mixed/concurrency; J01–03, A01–03, Q01, F01, O01, U01; starter/test/gợi ý/lời giải/biến thể; nguồn Spring AI ghim v1.1.8 | Biến thể nâng cao không phải tất cả đều có oracle riêng |
| Tiến độ/bảng điểm | Bốn trạng thái tự khai báo và dấu đạt test độc lập; namespace, queue offline, revision/conflict, guest/CLI import có chủ ý; verified view chỉ nhận submit PASS đủ metadata | Client logic và RLS đã test; chưa E2E đổi hai tài khoản thật/offline/reconnect qua gateway Supabase |
| Website | Tìm ID/title/nội dung/chủ đề/tag; library 12 mục/trang; bookmark/note; reset password; hôm nay/sessions/lịch ôn | Chưa thử email reset và Auth/Storage gateway trên staging. Note/bookmark chưa có offline queue |
| Phòng khám lỗi | Mã sai và CLI tests chạy thật; form dự đoán/nguyên nhân/tag; nhật ký theo tài khoản và hẹn ôn | Web chưa tự chạy Java trong runner riêng; nhật ký là tự khai báo |
| Nộp bài | Lưu nguồn, run/submit, thời gian, verdict/diagnostics, lịch sử; client không cấp PASS | **BLOCKED chấm web**: chưa triển khai worker queue/lease, image test tin cậy và runtime cô lập. `runner/isolated.py` chỉ compile probe, compile thành công vẫn BLOCKED |
| Nâng cao | 6 câu đầu vào, quan hệ tiên quyết, gợi ý ba cấp lưu mức hỗ trợ, visual request/palindrome, RAG lexical workbench, hồ sơ self/verified/hints | Gia sư chưa gọi model bám lỗi thực; commit evidence chưa tích hợp; workbench là mô phỏng |
| AI/RAG | Offline budget token đã đếm, owner/version/conflict, job cũ không ghi đè mới; adapter thật build PASS | **BLOCKED model thật**: thiếu endpoint Ollama/model/dimensions và cấu hình live. Chưa đo retrieval ngữ nghĩa, câu trả lời, citation bằng model; async lab chưa tích hợp vào Spring |
| Vận hành | Request ID, metrics RAM, load probe, backup/restore fixture PostgreSQL | Chưa metrics backend, stress/soak, backup production; OpenAPI chỉ kiểm route/field drift, chưa full schema conformance |

Giao diện: lượt browser trước đã thử tìm J02, đổi tiến độ khách, reload và khung 390×844. Lượt cuối bị Browser Use từ chối bởi chính sách URL của công cụ; không lách bằng browser khác. **BLOCKED kiểm tra trực quan cuối trên cả desktop/mobile**. Lint/build không thay thế kiểm tra này.

Lệnh `verify.py --suite live --output checks/runs/v3-handoff-live` trả **BLOCKED**: thiếu `DB_PASSWORD`, `APP_AN_PASSWORD`, `APP_BINH_PASSWORD`, `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBED_MODEL`, `EMBEDDING_DIMENSIONS` và Ollama. Không gọi model hoặc tạo PASS giả. Khi đủ môi trường phải cố định model/tokenizer và đánh giá riêng retrieval, grounded answer, citation; HTTP structural checks không chứng minh chất lượng ngữ nghĩa.

## Nâng cấp và bàn giao

Chưa áp dụng migration lên Supabase production, chưa triển khai Pages, chưa ghi đè main. Chạy **V4 → catalogue_seed.sql → V5 → V6** sau V1–V3 trên staging; thêm Auth Redirect URL `/JavaBackend_AI_RoadMap/auth/reset`; giữ service-role key ngoài frontend. Xem [UPGRADE_V3](docs/UPGRADE_V3.md).

File chính: `learning/`, `scripts/build_catalogue.mjs`, `website/src/generated/`, `website/src/lib/learning-store.ts`, các trang today/skills/lab/auth/reset, `database/migrations/`, `database/tests/`, `foundations/`, `advanced/`, `practice/sql/advanced/`, JPA/metrics/OpenAPI trong `projects/knowledge-assistant/`, `runner/`. Danh sách đầy đủ nằm trong diff nhánh.

Chấm web vẫn thiếu implementation/deployment của trusted worker. Có bảng submissions, lệnh Docker giới hạn tài nguyên hoặc build thành công không có nghĩa chức năng chấm tự động đã hoàn tất.

## Bổ sung 04/10/2026

- Kiểm tra sau khi đẩy nhánh: **PASS 149 link nội bộ và 72/72 URL HTTP**, 0 FAIL/0 BLOCKED. Đã sửa URL structured output đúng file ở tag Spring AI v1.1.8. HTTP PASS không xác minh fragment hay mọi nội dung upstream.
- CI đầu tiên tại commit e8d7460: offline và integration PASS; bước database website FAIL. Đã sửa chờ readiness TCP (tránh server socket tạm của initdb) và giữ log database trong artifact; lượt CI mới đang chờ xác nhận. Không gọi toàn bộ CI PASS trước khi có kết quả.
- Python regression sau sửa: **21 test PASS**. Website CI nay chạy trên push RoadMap_v3, chỉ lint/test/build; workflow deploy vẫn chỉ main.
- Docker Desktop đã tắt ở phiên tiếp tục. Đã khởi động lại bằng CLI, nhưng probe hiện chưa kết nối được daemon; chưa có kết quả chạy lại database cho thay đổi TCP. Các PASS ngày 03/10 vẫn là bằng chứng của lượt đó.
