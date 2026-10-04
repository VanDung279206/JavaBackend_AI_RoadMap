# Kiểm chứng RoadMap_v3

## PR #8 — giới hạn bytecode compile probe (05/10/2026)

Review `5407387608` trên commit `dab8d2c` xác nhận hai P2 trước đã sửa, phát hiện [4178662387](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/pull/8#discussion_r4178662387): `fsize=4096:4096` áp dụng cho cả `.class`, khiến nguồn đúng báo COMPILE_ERROR. Sửa trong `runner/isolated.py`: 8 MiB/file, giữ tmpfs/CPU/RAM/network/timeout; stdout/stderr compiler được đọc liên tục qua pipe, chỉ giữ 32.000 byte đầu, có `output_truncated`, không lưu log file. Timeout giết compiler; biên dịch thành công vẫn BLOCKED, không cấp PASS người học.

File bổ sung/sửa: `runner/isolated.py`, `runner/check_compile_limits.py`, `runner/README.md`, `scripts/tests/test_runner_job.py`, `.github/workflows/verify.yml`, `VALIDATION.md`, `checks/v3-summary.json`.

| Lệnh / phạm vi | Kết quả thực tế |
| --- | --- |
| Python `-m unittest discover -s scripts/tests -p test_runner_job.py` trước sửa | **FAIL đúng lỗi**, 2/3 PASS, 1 FAIL: bytecode MoreDsa 8.724 byte vượt giới hạn 4.096 byte |
| Python `-m unittest discover -s scripts/tests` sau sửa | **PASS 31/31**, không skip; biên dịch Java thật, lỗi cú pháp, timeout, log 4 triệu byte chỉ giữ 32.000 byte, quyền snapshot và giới hạn nguồn |
| `scripts/verify.py --suite offline --output checks/runs/pr8-fsize-offline` | **PASS 19 gates**, gồm 31 test Python; nguồn tham chiếu và starter rejection |
| npm CLI `--prefix website test`; `node scripts/build_catalogue.mjs --check`; `git diff --check` | **PASS**: 18 tests, YAML mới hợp lệ, 84 bài/32 sessions, không lỗi diff |
| Linux `sudo -n --preserve-env=JAVA_HOME,PATH python3 runner/check_compile_limits.py` | **PASS** trên CI: control 4 KB tái hiện lỗi; UID/GID 65534 tạo `.class` 8.724 byte với fsize 8.388.608 byte; file vượt hạn bị từ chối; verdict vẫn BLOCKED |
| [Website CI](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/actions/runs/37222841422), commit `2314e11` | **PASS**: 18 tests, catalogue, lint, TypeScript/build/export và postbuild |
| [Reference CI](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/actions/runs/37222841316), commit `2314e11` | **PASS**: offline, quyền UID/compiler/file limit, Spring/PostgreSQL/SQL/Docker HTTP, V1–V6/seed/legacy/RLS/Q01 và backup–restore |

Log cục bộ: `checks/review-fsize-before.log`, `checks/review-fsize-after.log`, `checks/runs/pr8-fsize-offline/`. Đã đọc log CI xác nhận control/biên dịch dưới UID 65534, từng migration/fixture và backup–restore. Hai commit sau `2314e11` chỉ ghi kết quả VALIDATION/JSON. Docker cục bộ **BLOCKED**: pipe daemon không tồn tại. Kiểm tra Linux/syscall này không phải lượt chạy Docker probe; chấm web vẫn **BLOCKED** vì thiếu worker/test image tin cậy. Không cần migration, cấu hình ứng dụng hoặc đổi phiên bản cho sửa này.

## PR #8 — hai P2 còn lại (05/10/2026)

Review `5407110865` xác nhận bảy lỗi trước đã được xử lý, bổ sung hai lỗi trên commit `2c34a5c`:

| Nhận xét | Sửa và kiểm chứng |
| --- | --- |
| [4178395501](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/pull/8#discussion_r4178395501) — bỏ sót pending khi RPC đang chạy | Đọc trạng thái hiện tại theo từng ID, chạy tiếp hàng đợi sau lượt thành công, chỉ báo đồng bộ khi hết pending. Regression chạy production store với RPC trì hoãn: bài mới, bài đã sạch, sửa cùng bài, lỗi RPC/thử lại, xung đột và đổi tài khoản |
| [4178395506](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/pull/8#discussion_r4178395506) — UID 65534 không đọc được job Linux 0700 | Sao chép Java vào snapshot riêng; job/source 0755, script/Java 0444, hai bind mount vẫn readonly. Không đổi quyền file gốc; kiểm lại giới hạn 120 KB theo byte thực đọc. Thêm regression và bước CI chuyển sang UID/GID 65534 để đọc/traverse và kiểm tra không được ghi |

| Lệnh / phạm vi mới | Kết quả thực tế |
| --- | --- |
| `node website/tests/run.mjs` trước sửa store, sau khi thêm regression | **FAIL đúng lỗi**, 15/18 PASS, 3 FAIL; không phải kết quả đạt của bản sửa |
| npm CLI `--prefix website test` sau sửa | **PASS 18/18**, không skip; gồm sáu regression production store mới |
| Python `-m unittest discover -s scripts/tests` | **PASS 27/27**, gồm snapshot/quyền POSIX và chặn nguồn quá giới hạn; Windows không chứng minh UID Linux |
| `scripts/verify.py --suite offline --output checks/runs/pr8-p2-offline` | **PASS 19 gates**, không có merge marker; nguồn tham chiếu và starter rejection |
| `node scripts/build_catalogue.mjs --check`; npm CLI `run lint`, `run build` | **PASS**, 84 bài/32 sessions; TypeScript/export 29 trang; postbuild 14 track/84 bài |
| Linux `sudo -n python3 runner/check_job_access.py` | **PASS trên CI**, log xác nhận `PASS UID/GID 65534: traverse/read job and source; no write permission`; Windows không hỗ trợ kiểm tra chuyển UID POSIX này |
| [Website CI](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/actions/runs/37219151893), commit `24a0b6b` | **PASS**: 18 tests, catalogue, lint, build và postbuild export |
| [Reference CI](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/actions/runs/37219151892), commit `24a0b6b` | **PASS**: offline, kiểm tra UID 65534, Spring/PostgreSQL/SQL/Docker HTTP, V1–V6/seed/legacy/RLS/Q01 và backup–restore |

Log cục bộ: `checks/review-sync-before.log`, `checks/review-sync-after.log`, `checks/review-p2-python.log`, `checks/review-p2-build.log`, `checks/runs/pr8-p2-offline/`. Đã đọc log CI xác nhận UID 65534, từng migration/fixture và backup–restore PASS. Hai commit sau `24a0b6b` chỉ cập nhật kết quả VALIDATION/JSON. Probe quyền chỉ chạy fixture tin cậy, không chạy mã người học và không chứng minh Docker compilation/chấm web. Compile probe vẫn trả BLOCKED khi biên dịch thành công vì chưa có worker test tin cậy. Không cần migration hoặc đổi phiên bản cho hai sửa này.

## PR #8 — sửa review Dung06-tech (04/10/2026)

Review trên [PR #8](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/pull/8) kiểm tra commit `d6b11ff`, đã phát hiện đúng các lỗi do phần hoàn tác được commit: thiếu nguồn/route/schema và marker xung đột. Các PASS trong phần lịch sử bên dưới **không áp dụng cho d6b11ff**. Phần này ghi các lượt kiểm tra mới sau khi sửa review.

| Nhận xét | Sửa và kiểm chứng |
| --- | --- |
| `4178091896` — component thiếu | Khôi phục ReviewImport/PersonalNote; website build mới PASS |
| `4178091902` — YAML xung đột | Giải quyết workflow; test parse tất cả workflow bằng js-yaml đã khóa qua dependency ESLint; thêm gate chặn marker merge |
| `4178091907` — catalogue hỏng/thiếu schema | Khôi phục phases/phase/prerequisites, assessment, hints/sessions và nội dung; generator sinh lại website/seed/bản đồ, `--check` PASS |
| `4178091909` — schema/RPC thiếu | V4 → seed → V5 → V6 và fixture nâng cấp/restore có đủ trong nhánh; regression nguồn SQL và kiểm chứng PostgreSQL/RLS/backup–restore mới trên CI Linux PASS |
| `4178091912` — implementation/fixture thiếu | Khôi phục foundations/advanced/SQL, lab fetch, metrics/OpenAPI, runner probe; offline và test Java mới PASS |
| `4178091916` — route/store chưa nối | Docs dùng phases từ catalogue và cùng store v3 với today; render LearningTools; khôi phục skills/lab/reset; kiểm tra HTML export 14 track/84 bài và các trang này PASS |
| `4178091918` — test runner thiếu | Khôi phục runner biên dịch TypeScript, npm test và CI regression; thêm regression mất route/learning tools |

| Lệnh chạy mới | Kết quả thực tế |
| --- | --- |
| `verify.py --suite offline --output checks/runs/pr8-review-offline` | **PASS 19 gates**, gồm **25 Python tests**, không có merge marker, starter rejection, Markdown và các nguồn bài |
| `node scripts/build_catalogue.mjs --check` | **PASS**, 84 bài/32 sessions, nguồn và output nhất quán |
| npm CLI `--prefix website test`, `run lint`, `run build` | **PASS**, 12 tests; lint; TypeScript/export 29 trang; postbuild kiểm tra 14 track/84 bài, today/skills/lab/auth/reset |
| `maven.py -f projects/knowledge-assistant/pom.xml test` | **PASS 19 tests**, 0 failure/error/skipped; sau khi cấp quyền mạng cho Maven Wrapper |
| [Website CI của PR](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/actions/runs/37211092695), commit `99c2ba8` | **PASS** trên Node 20: catalogue, 12 tests, YAML, lint, build và kiểm tra route/learning tools sau export |
| [Reference CI của PR](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/actions/runs/37211092706), commit `99c2ba8` | **PASS** trên Java 21/Python 3.12: offline, Spring/PostgreSQL/SQL/Docker HTTP, V1–V6/seed/legacy/RLS/Q01, starter rejection và custom dump/restore |
| Docker daemon cục bộ | **BLOCKED**, pipe dockerDesktopLinuxEngine không tồn tại. Không coi kiểm tra fixture tồn tại là PASS tích hợp database |

Log mới: `checks/runs/pr8-review-offline/`, `checks/website-build-pr8-review.log`, `checks/spring-pr8-review.log`. Đã đọc log CI xác nhận từng migration/fixture và backup–restore PASS. Hai commit sau `99c2ba8` chỉ ghi kết quả vào VALIDATION/JSON, không đổi mã đã kiểm chứng. Chấm web/model thật/Supabase gateway/kiểm tra trực quan cuối vẫn theo các giới hạn bên dưới.

## Lịch sử kiểm chứng trước review

Các lượt chạy ngày 03–04/10/2026, Asia/Bangkok. Nhánh `RoadMap_v3` bắt đầu từ `origin/main` commit `e50b9fd`. Đã đọc cấu trúc, mã hiện có và AGENTS do Next.js sinh. Không đổi phiên bản dependency: Java target 17, Boot 3.5.16, Spring AI 1.1.8, Next 16.3.6. Máy kiểm tra dùng Java 26.0.1/Node 24.21.0; CI giữ Java 21/Node 20.

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
| `& $pyRunner -m unittest discover -s scripts/tests` | **PASS**, 22 test: invalid ID, đúng bản Spring tự làm, bảo toàn destination, hợp đồng theo bài, O01 starter, runner limits và các test cũ | `checks/python-v3-contract.log` |
| `node scripts/build_catalogue.mjs --check` | **PASS**, 84 ID/32 sessions; phase, prerequisite, hints, seed/generated không lệch | stdout |
| `node website/tests/run.mjs` | **PASS**, 10 test: namespace, offline/conflict, guest/CLI import, backup hỏng, lịch ôn Asia/Bangkok và retrieval | Node test output |
| `node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" --prefix website run lint` | **PASS** | `checks/website-lint-v3-contract.log` |
| Cùng npm CLI, `--prefix website run build` | **PASS**, TypeScript và static export 29 trang theo build output | `checks/website-build-v3-contract.log` |
| `& $pyRunner scripts/maven.py -f projects/knowledge-assistant/pom.xml test` | **PASS**, 19 JUnit tests: hợp đồng P3.1–P3.3, HTTP/auth/owner/version, fetch/transaction, request ID, OpenAPI route/DTO drift | `checks/spring-contract-v3.log` |
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

- Kiểm tra mới nhất: **317 link nội bộ và 74/74 URL HTTP PASS**, 0 FAIL/0 BLOCKED. Đã sửa URL structured output đúng file ở tag Spring AI v1.1.8. HTTP PASS không xác minh fragment hay mọi nội dung upstream. Bản đồ đủ 84 bài đã được kiểm tra lại file/anchor.
- CI đầu tiên tại commit e8d7460: offline và integration PASS; bước database website FAIL. Đã sửa chờ readiness TCP (tránh server socket tạm của initdb) và giữ log database trong artifact. Các lượt ff5ee2e và **533f6d6** đều PASS. Lượt mới nhất: [reference CI](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/actions/runs/37167868679) **PASS**, gồm PostgreSQL/RLS/Q01/dump–restore; [website CI Node 20](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/actions/runs/37167868726) **PASS**. Commit sau đó chỉ ghi kết quả vào báo cáo, không thay đổi mã đã kiểm chứng.
- `docs/EXERCISE_MAP.md` nay được sinh từ catalogue. P3.1–P3.4 có test chọn theo bài; P4.3/P4.4 ghi rõ cần bằng chứng Docker/CI, không dùng Maven PASS để xác nhận.
- Tạo `work/v3-contract-validation` bằng `new_spring_lab.py --phase 3`. Test `LearningContractTest#createsValidatedOwnedDocument` trên starter **FAIL** ở TODO P3.1; chỉ sửa create trong fixture rồi chạy lại **PASS 1 test**. Test `LearningContractTest#findsOnlyOwnedDocument` vẫn **FAIL** ở TODO P3.2. Regression kiểm tra tăng dần **PASS**; không ghi tiến độ người học. Log: `checks/spring-p31-starter.log`, `spring-p31-repaired.log`, `spring-p32-unfinished.log`.
- Website dùng ngày Asia/Bangkok khi PostgreSQL trả timestamp UTC; nhật ký lỗi chỉ thông báo đã lưu lịch ôn khi ghi thiết bị thật sự thành công. Python **22 test PASS**, website **10 test PASS**, Spring tham chiếu **19 test PASS**. Website CI chạy trên push RoadMap_v3, chỉ lint/test/build; workflow deploy vẫn chỉ main.
- Docker Desktop đang không có daemon cục bộ khả dụng dù lệnh start trả thành công; lượt chạy database mới tại máy Windows **BLOCKED**. Kết quả database CI Linux ff5ee2e/533f6d6 và các PASS cục bộ ngày 03/10 được ghi riêng, không coi start là bằng chứng chạy test.
