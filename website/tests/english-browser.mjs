// Run after npm run build. Uses the actual exported site and native storage/Web Locks.
import { chromium } from 'playwright';
import { expect } from 'playwright/test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const website = fileURLToPath(new URL('..', import.meta.url));
const output = path.join(website, 'out');
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/JavaBackend_AI_RoadMap';
const catalogue = JSON.parse(readFileSync(path.join(website, 'src/generated/english.json'), 'utf8'));
const screenshots = process.env.ENGLISH_SCREENSHOTS_DIR;
if (screenshots) mkdirSync(screenshots, { recursive: true });
const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (base && !url.pathname.startsWith(base + '/') && url.pathname !== base) { res.writeHead(404).end(); return; }
    const route = decodeURIComponent(url.pathname.slice(base.length)) || '/';
    const root = path.resolve(output), target = path.resolve(root, '.' + route);
    if (!target.startsWith(root + path.sep) && target !== root) { res.writeHead(403).end(); return; }
    const file = [target, target + '.html', path.join(target, 'index.html')].find(file => existsSync(file) && statSync(file).isFile());
    try {
        const content = readFileSync(file);
        const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain' }[path.extname(file)] ?? 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime }); res.end(content);
    } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const errors = [], checks = [];
const pass = text => { checks.push(text); console.log('PASS browser:', text); };
try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    // No production Supabase requests are used by this guest workflow.
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const visit = async (route = '/english', hash = '') => {
        await page.goto(origin + base + route + hash);
        await expect(page.locator('body')).not.toContainText('Đang tải tiến độ tiếng Anh…');
    };
    const saved = async () => { await expect(page.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible(); };
    const shot = async name => { if (screenshots) await page.screenshot({ path: path.join(screenshots, name + '.png'), fullPage: false }); };
    await visit(); await expect(page.getByText('Chưa có tiến độ đã lưu. Bắt đầu làm bài để lưu trên thiết bị.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Tiếng Anh cho lập trình viên' })).toBeVisible();
    await expect(page.locator('.nav-links').getByRole('link', { name: 'Tiếng Anh', exact: true })).toBeVisible();
    await shot('desktop-overview'); pass('desktop overview, menu and local guest initialization');

    const restoreContext = await browser.newContext();
    await restoreContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const restoredReview = await restoreContext.newPage();
    restoredReview.on('pageerror', error => errors.push(error.message));
    await restoredReview.goto(origin + base + '/english#01_Java/review');
    await restoredReview.getByRole('button', { name: 'Luyện thêm tất cả từ', exact: true }).click();
    const restoredFlash = restoredReview.locator('.english-flashcard').first();
    await restoredFlash.getByLabel('Nghĩa bạn nhớ').fill('my old answer');
    await restoredFlash.getByRole('button', { name: 'Mở đáp án flashcard' }).click();
    await restoredFlash.getByRole('button', { name: 'Nhớ được', exact: true }).click();
    await expect(restoredReview.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    await expect(restoredFlash.getByLabel('Nghĩa bạn nhớ')).toBeDisabled();
    const checkpoint = { version: 1, terms: {}, exercises: {}, readings: {}, writing: {} };
    await restoredReview.getByLabel('Chọn file JSON').setInputFiles({ name: 'review-checkpoint.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(checkpoint)) });
    await restoredReview.getByRole('button', { name: 'Áp dụng bản lưu đã chọn' }).click();
    await expect(restoredReview.getByText('Đã nhập và lưu bản sao trên thiết bị trong phạm vi tài khoản/khách hiện tại.')).toBeVisible();
    await expect(restoredFlash.getByLabel('Nghĩa bạn nhớ')).toBeEnabled();
    await expect(restoredFlash.getByLabel('Nghĩa bạn nhớ')).toHaveValue('');
    await expect(restoredFlash.getByRole('button', { name: 'Mở đáp án flashcard' })).toBeDisabled();
    await restoredFlash.getByLabel('Nghĩa bạn nhớ').fill('my restored answer');
    await restoredFlash.getByRole('button', { name: 'Mở đáp án flashcard' }).click();
    await restoredFlash.getByRole('button', { name: 'Nhớ được', exact: true }).click();
    await expect(restoredReview.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    await expect(restoredFlash.getByLabel('Nghĩa bạn nhớ')).toBeDisabled();
    const restoredHistory = await restoredReview.evaluate(() => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')).terms['01_Java-class'].reviews);
    assert.equal(restoredHistory.length, 1);
    pass('restoring an earlier checkpoint resets a rated flashcard without retaining its old answer or lock');
    const restoreOther = await restoreContext.newPage();
    restoreOther.on('pageerror', error => errors.push(error.message));
    await restoreOther.goto(origin + base + '/english');
    await expect(restoreOther.getByLabel('Chọn file JSON')).toBeEnabled();
    await restoreOther.getByLabel('Chọn file JSON').setInputFiles({ name: 'review-checkpoint.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(checkpoint)) });
    await restoreOther.getByRole('button', { name: 'Áp dụng bản lưu đã chọn' }).click();
    await expect(restoreOther.getByText('Đã nhập và lưu bản sao trên thiết bị trong phạm vi tài khoản/khách hiện tại.')).toBeVisible();
    await expect(restoredFlash.getByLabel('Nghĩa bạn nhớ')).toBeEnabled();
    await expect(restoredFlash.getByLabel('Nghĩa bạn nhớ')).toHaveValue('');
    await restoreContext.close(); pass('a checkpoint imported by another tab also resets the previously rated flashcard');

    const deadlineContext = await browser.newContext();
    await deadlineContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const deadline = await deadlineContext.newPage();
    deadline.on('pageerror', error => errors.push(error.message));
    await deadline.clock.install({ time: new Date('2026-10-11T00:00:00.000Z') });
    await deadline.goto(origin + base + '/english#01_Java/vocabulary/01_Java-class');
    await deadline.getByLabel('Thêm vào danh sách cần ôn').check();
    await expect(deadline.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    await deadline.getByRole('button', { name: 'Ôn tập', exact: true }).click();
    const deadlineFlash = deadline.locator('.english-flashcard');
    await deadlineFlash.getByLabel('Nghĩa bạn nhớ').fill('my first answer');
    await deadlineFlash.getByRole('button', { name: 'Mở đáp án flashcard' }).click();
    await deadlineFlash.getByRole('button', { name: 'Chưa nhớ', exact: true }).click();
    await expect(deadline.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    await expect(deadlineFlash).toHaveCount(0);
    await deadline.clock.fastForward(630000);
    await expect(deadlineFlash).toHaveCount(1);
    await expect(deadlineFlash.getByLabel('Nghĩa bạn nhớ')).toBeEnabled();
    await expect(deadlineFlash.getByLabel('Nghĩa bạn nhớ')).toHaveValue('');
    await deadlineFlash.getByLabel('Nghĩa bạn nhớ').fill('my next scheduled answer');
    await deadlineFlash.getByRole('button', { name: 'Mở đáp án flashcard' }).click();
    await deadlineFlash.getByRole('button', { name: 'Nhớ được', exact: true }).click();
    await expect(deadline.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    const deadlineReviews = await deadline.evaluate(() => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')).terms['01_Java-class'].reviews.length);
    assert.equal(deadlineReviews, 2);
    await deadlineContext.close(); pass('a term rated again becomes editable at its next deadline in the same review session');

    await page.getByRole('link', { name: 'Học từ', exact: true }).first().click();
    await expect(page.locator('.english-term')).toHaveCount(8);
    const wordSearch = page.getByLabel('Tìm từ hoặc nghĩa');
    for (const query of ['đối tượng cụ thể', 'ĐỐI TƯỢNG CỤ THỂ', 'doi tuong cu the']) {
        await wordSearch.fill(query);
        await expect(page.locator('article[id="01_Java-object"]')).toBeVisible();
    }
    await wordSearch.fill('not-an-existing-term');
    await expect(page.getByText(/Chưa có từ phù hợp bộ lọc/)).toBeVisible();
    await wordSearch.fill('');
    await expect(page.locator('.english-term')).toHaveCount(8);
    pass('Vietnamese vocabulary search handles accents, Đ/đ, case and empty results');
    await page.getByRole('button', { name: 'Tổng quan', exact: true }).click();
    await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
    await page.getByPlaceholder('Tìm chặng, bài tập, từ tiếng Anh…').fill('parameter');
    await page.getByRole('button', { name: /^Tiếng Anh: parameter —/ }).click();
    const term = catalogue.terms.find(t => t.term === 'parameter');
    const card = page.locator(`article[id="${term.id}"]`);
    await expect(card).toBeVisible(); assert.ok(page.url().includes('/english#01_Java/vocabulary/'));
    await page.getByLabel('Chỉ từ trong danh sách cần ôn').check();
    await expect(card).toHaveCount(0);
    await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
    await page.getByPlaceholder('Tìm chặng, bài tập, từ tiếng Anh…').fill('parameter');
    await page.getByRole('button', { name: /^Tiếng Anh: parameter —/ }).click();
    await expect(page.getByLabel('Chỉ từ trong danh sách cần ôn')).not.toBeChecked();
    await expect(card).toBeVisible();
    pass('search reopens the selected term despite a restrictive filter and an unchanged URL hash');
    const quiz = card.locator('.english-practice').first();
    await quiz.locator(`input[value="${term.id}"]`).check();
    await quiz.getByRole('button', { name: 'Kiểm tra câu trả lời' }).click();
    await expect(quiz.getByText('Đúng theo đáp án của bài.', { exact: true })).toBeVisible();
    const fill = card.locator('.english-practice').nth(1);
    await fill.getByLabel('Câu trả lời').fill('parameter');
    await fill.getByRole('button', { name: 'Kiểm tra câu trả lời' }).click();
    await expect(fill.getByText('Đúng theo đáp án của bài.', { exact: true })).toBeVisible();
    await card.getByLabel('Tự viết một câu sử dụng “parameter”').fill('The method has a size parameter.');
    await card.getByRole('button', { name: 'Tôi đã đối chiếu câu với nghĩa của từ' }).click();
    await card.getByLabel('Thêm vào danh sách cần ôn').check();
    await saved(); await page.reload(); await saved();
    await expect(card.getByLabel('Tự viết một câu sử dụng “parameter”')).toHaveValue('The method has a size parameter.');
    await expect(card).toContainText('Tự dùng trong câu: có');
    await shot('desktop-vocabulary'); pass('global search, linked term, choice/fill/self-use and reload persistence');

    await page.getByRole('button', { name: 'Đọc hiểu', exact: true }).click();
    const reading = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Bài đọc READ-1', exact: true }) });
    await expect(reading.locator('.english-reading')).toHaveText(catalogue.readings[0].text, { useInnerText: true });
    await expect(reading.locator('details').first()).not.toHaveAttribute('open', '');
    await reading.getByRole('button', { name: 'Tra nghĩa parameter', exact: true }).click();
    await expect(reading.locator('[popover]:popover-open')).toContainText(term.meaning);
    await reading.getByRole('heading', { name: 'Bài đọc READ-1', exact: true }).click();
    await reading.getByText('Mở bản dịch khi cần đối chiếu', { exact: true }).click();
    await expect(reading.locator('details').first()).toHaveAttribute('open', '');
    await reading.getByLabel('Tôi đã đọc đoạn này').check();
    const ordered = page.locator('.english-practice').filter({ hasText: 'P1-ORDER' });
    for (const index of [2, 4, 0, 1, 3]) await ordered.locator('.learning-actions button').nth(index).click();
    await ordered.getByRole('button', { name: 'Kiểm tra câu trả lời' }).click();
    await expect(ordered.getByText('Đúng theo đáp án của bài.', { exact: true })).toBeVisible();
    await saved(); await shot('desktop-reading'); pass('reading lookup, translation toggle, reading progress and reordered sentence');

    await page.getByRole('button', { name: 'Viết và giải thích code', exact: true }).click();
    const writer = page.locator('.english-writing').filter({ hasText: 'WRITE-1' });
    await writer.getByLabel('Commit mô tả đúng thay đổi của bạn').fill('test: check the method output');
    await writer.getByLabel('Bài viết tiếng Anh').fill('The method returns a list. I checked an empty input. The test passed.');
    await writer.getByRole('button', { name: 'Tôi đã tự đối chiếu bài viết' }).click();
    await expect(writer).toContainText('Đã tự đối chiếu bản hiện tại.');
    await writer.getByLabel('Bài viết tiếng Anh').fill('The method returns a list.');
    await expect(writer).not.toContainText('Đã tự đối chiếu bản hiện tại.');
    await saved(); pass('commit and writing save; edits invalidate self-assessment');

    await page.getByRole('button', { name: 'Ôn tập', exact: true }).click();
    const flash = page.locator('.english-flashcard').filter({ has: page.getByRole('heading', { name: 'parameter', exact: true }) });
    await expect(flash.getByRole('button', { name: 'Mở đáp án flashcard' })).toBeDisabled();
    await flash.getByLabel('Nghĩa bạn nhớ').fill('Tham số của phương thức');
    await flash.getByRole('button', { name: 'Mở đáp án flashcard' }).click();
    await flash.getByRole('button', { name: 'Nhớ được', exact: true }).click();
    await saved();
    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')));
    assert.equal(progress.terms[term.id].reviews.length, 1); assert.equal(progress.terms[term.id].intervalDays, 1);
    assert.ok(progress.terms[term.id].dueAt); pass('flashcard answer-before-reveal and native persisted review schedule');
    await expect(page.locator('.english-flashcard')).toHaveCount(0);
    await expect(page.getByText(/Đã hết từ đến hạn trong chủ đề này/)).toBeVisible();
    await page.getByRole('button', { name: 'Luyện thêm tất cả từ', exact: true }).click();
    const practiceFlash = page.locator('.english-flashcard').first();
    await practiceFlash.getByLabel('Nghĩa bạn nhớ').fill('my meaning');
    await practiceFlash.getByRole('button', { name: 'Mở đáp án flashcard' }).click();
    await practiceFlash.getByRole('button', { name: 'Nhớ khó', exact: true }).click();
    await saved();
    await expect(practiceFlash.getByLabel('Nghĩa bạn nhớ')).toBeDisabled();
    await expect(practiceFlash.getByRole('button', { name: 'Nhớ được', exact: true })).toBeDisabled();
    pass('due review ends without refilling all terms; extra practice requires explicit choice and locks a rated attempt');
    await page.getByRole('button', { name: 'Nhóm flashcard tiếp', exact: true }).click();
    await page.getByRole('button', { name: 'Nhóm flashcard trước', exact: true }).click();
    await expect(page.locator('.english-flashcard').first().getByLabel('Nghĩa bạn nhớ')).toBeDisabled();
    await expect(page.locator('.english-flashcard').first().getByLabel('Nghĩa bạn nhớ')).toHaveValue('my meaning');
    await page.getByRole('button', { name: /^Đến hạn \(/ }).click();
    await page.getByRole('button', { name: 'Luyện thêm tất cả từ', exact: true }).click();
    await expect(page.locator('.english-flashcard').first().getByLabel('Nghĩa bạn nhớ')).toBeDisabled();
    const sessionReviews = await page.evaluate(() => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')).terms['01_Java-class'].reviews.length);
    assert.equal(sessionReviews, 1);
    await page.getByRole('button', { name: 'Bắt đầu lượt luyện mới', exact: true }).click();
    const newAttempt = page.locator('.english-flashcard').first();
    await expect(newAttempt.getByLabel('Nghĩa bạn nhớ')).toBeEnabled();
    await newAttempt.getByLabel('Nghĩa bạn nhớ').fill('new practice answer');
    await newAttempt.getByRole('button', { name: 'Mở đáp án flashcard' }).click();
    await newAttempt.getByRole('button', { name: 'Nhớ khó', exact: true }).click();
    await saved();
    const restartedReviews = await page.evaluate(() => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')).terms['01_Java-class'].reviews.length);
    assert.equal(restartedReviews, 2);
    pass('pagination and mode switches preserve session ratings; only an explicit new practice attempt records another rating');

    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Tải tiến độ tiếng Anh JSON' }).click();
    const download = await downloadEvent;
    const backup = JSON.parse(readFileSync(await download.path(), 'utf8'));
    assert.equal(backup.terms[term.id].sentence, 'The method has a size parameter.');
    assert.equal(backup.writing['WRITE-1'].text, 'The method returns a list.');
    const imported = structuredClone(backup); imported.writing['WRITE-1'].text = 'Imported writing.';
    const input = page.getByLabel('Chọn file JSON');
    await input.setInputFiles({ name: 'english-import.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) });
    await expect(page.getByText('Xem trước: english-import.json')).toBeVisible();
    const other = await context.newPage(); await other.goto(origin + base + '/english#01_Java/writing');
    await other.getByLabel('Bài viết tiếng Anh').fill('Changed in another tab.');
    await expect(other.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Áp dụng bản lưu đã chọn' }).click();
    await expect(page.getByText(/Bản lưu đã thay đổi sau khi chọn file/)).toBeVisible();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')).writing['WRITE-1'].text), 'Changed in another tab.');
    await input.setInputFiles({ name: 'english-import.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) });
    await page.getByRole('button', { name: 'Áp dụng bản lưu đã chọn' }).click();
    await expect(page.getByText('Đã nhập và lưu bản sao trên thiết bị trong phạm vi tài khoản/khách hiện tại.')).toBeVisible();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')).writing['WRITE-1'].text), 'Imported writing.');
    await other.close(); pass('real JSON download, preview, stale import rejected across tabs and valid re-import');

    await visit('/english', '#all/errors');
    await expect(page.getByRole('heading', { name: /E\d\d · Đọc thông báo lỗi/ })).toHaveCount(8);
    await expect(page.locator('.english-error-log')).toHaveCount(8);
    await expect(page.locator('.english-practice')).toHaveCount(32);
    await expect(page.locator('main')).toContainText('fixture cố ý gây lỗi');
    await shot('desktop-errors'); pass('all 8 fixture logs with 32 diagnostic questions and clear grading scope');

    await visit('/today');
    await expect(page.getByRole('heading', { name: '10–15 phút tiếng Anh hôm nay' })).toBeVisible();
    await page.getByRole('link', { name: 'Bắt đầu tiếng Anh', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tiếng Anh cho lập trình viên');
    await visit('/learn/03_Spring');
    await page.getByRole('link', { name: 'Đọc và luyện câu', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Bài đọc READ-3', exact: true })).toBeVisible();
    await visit('/docs/dsa');
    await page.getByRole('link', { name: 'Từ vựng liên quan', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'array', exact: true })).toBeVisible();
    pass('Today, course and DSA navigation honor GitHub Pages basePath');

    await visit('/english', '#all/review');
    await page.getByRole('button', { name: 'Luyện thêm tất cả từ', exact: true }).click();
    await page.getByRole('button', { name: 'Nhóm flashcard tiếp', exact: true }).click();
    await expect(page.getByText('Nhóm 2/9', { exact: true })).toBeVisible();
    pass('review pagination keeps all 72 terms accessible');

    await visit('/english', '#02_Http-Sql/reading');
    const sqlBridge = page.locator('.english-practice').filter({ hasText: 'SQL-BRIDGE-JOIN' });
    await expect(sqlBridge.locator('pre')).toContainText('COUNT(d.id)');
    await expect(sqlBridge.getByText(/COUNT\(d.id\) chỉ đếm/)).not.toBeVisible();
    await sqlBridge.getByText('Mở gợi ý từng bước', { exact: true }).click();
    await expect(sqlBridge.getByText(/COUNT\(d.id\) chỉ đếm/)).toBeVisible();
    await sqlBridge.getByLabel('Câu trả lời').fill('zero');
    await sqlBridge.getByRole('button', { name: 'Kiểm tra câu trả lời' }).click();
    await expect(sqlBridge.getByText('Đúng theo đáp án của bài.', { exact: true })).toBeVisible();
    await visit('/english', '#03_Spring/reading');
    const springBridge = page.locator('.english-practice').filter({ hasText: 'SPRING-BRIDGE-ROLLBACK' });
    await springBridge.getByLabel('Câu trả lời').fill('rolls back');
    await springBridge.getByRole('button', { name: 'Kiểm tra câu trả lời' }).click();
    await expect(springBridge.getByText('Đúng theo đáp án của bài.', { exact: true })).toBeVisible();
    await saved(); await shot('desktop-intermediate');
    pass('SQL/Spring intermediate traces, on-demand hints and accepted answers work in the exported site');

    const reviewContext = await browser.newContext();
    await reviewContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const reviewPages = await Promise.all([reviewContext.newPage(), reviewContext.newPage()]);
    for (const tab of reviewPages) {
        tab.on('pageerror', error => { errors.push(error.message); console.error('Project browser error:', error.message); });
        await tab.goto(origin + base + '/english#01_Java/review');
        await tab.getByRole('button', { name: 'Luyện thêm tất cả từ', exact: true }).click();
        const flashcard = tab.locator('.english-flashcard').first();
        await flashcard.getByLabel('Nghĩa bạn nhớ').fill('my meaning');
        await flashcard.getByRole('button', { name: 'Mở đáp án flashcard' }).click();
    }
    const [firstReview, staleReview] = reviewPages;
    await firstReview.locator('.english-flashcard').first().getByRole('button', { name: 'Nhớ được', exact: true }).click();
    await expect(firstReview.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    await expect(staleReview.locator('.english-flashcard').first()).toContainText('Ôn tiếp:');
    await staleReview.locator('.english-flashcard').first().getByRole('button', { name: 'Nhớ dễ', exact: true }).click();
    await expect(staleReview.locator('.english-flashcard').first()).toContainText('Lịch ôn đã thay đổi');
    const reviewTerm = catalogue.terms.find(t => t.phase === '01_Java');
    const reviewRow = await firstReview.evaluate(id => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')).terms[id], reviewTerm.id);
    assert.equal(reviewRow.reviews.length, 1); assert.equal(reviewRow.intervalDays, 1);
    pass('two revealed flashcards cannot advance one review schedule twice, including after a storage event');
    await firstReview.getByRole('button', { name: 'Từ vựng', exact: true }).click();
    const scheduledCard = firstReview.locator(`article[id="${reviewTerm.id}"]`);
    await scheduledCard.getByLabel('Thêm vào danh sách cần ôn').check();
    await expect(firstReview.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    await firstReview.reload();
    await expect(scheduledCard.getByLabel('Thêm vào danh sách cần ôn')).toBeChecked();
    await scheduledCard.getByLabel('Thêm vào danh sách cần ôn').uncheck();
    await expect(firstReview.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    const cancelledRow = await firstReview.evaluate(id => JSON.parse(localStorage.getItem('roadmap-v2:english:guest')).terms[id], reviewTerm.id);
    assert.equal(cancelledRow.dueAt, reviewRow.dueAt);
    assert.equal(cancelledRow.reviewRequestedAt, null);
    assert.equal(cancelledRow.intervalDays, reviewRow.intervalDays);
    assert.deepEqual(cancelledRow.reviews, reviewRow.reviews);
    await firstReview.getByRole('button', { name: 'Ôn tập', exact: true }).click();
    await expect(firstReview.locator('.english-flashcard')).toHaveCount(0);
    pass('cancelling an immediate request after reload preserves the earned schedule and history');
    await firstReview.getByRole('button', { name: 'Từ vựng', exact: true }).click();
    await scheduledCard.getByLabel('Thêm vào danh sách cần ôn').check();
    await expect(firstReview.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
    await firstReview.getByRole('button', { name: 'Ôn tập', exact: true }).click();
    await expect(firstReview.locator('.english-flashcard')).toHaveCount(1);
    await expect(firstReview.locator('.english-flashcard').getByRole('heading')).toHaveText(reviewTerm.term);
    pass('manual review request brings a term with a future schedule back into the due queue');
    await reviewContext.close();

    const resumeContext = await browser.newContext();
    await resumeContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const resume = await resumeContext.newPage();
    resume.on('pageerror', error => errors.push(error.message));
    await resume.goto(origin + base + '/english');
    const seedResume = async stage => {
        await resume.evaluate(({ catalogue, stage }) => {
            const now = new Date().toISOString(), value = { version: 1, terms: {}, exercises: {}, readings: {}, writing: {} };
            for (const e of catalogue.exercises.filter(e => e.section !== 'error')) {
                if (e.phase === '01_Java' && (stage === 'reading' ? e.section !== 'vocabulary' : stage === 'writing' && e.section === 'writing')) continue;
                let answer = e.answers[0];
                if (e.kind === 'reorder') {
                    const remaining = e.tokens.map((token, index) => ({ token, index }));
                    answer = JSON.stringify(e.answers[0].split(' ').map(token => remaining.splice(remaining.findIndex(t => t.token === token), 1)[0].index));
                }
                value.exercises[e.id] = { answer, checkedAnswer: answer, correct: true, checkedAt: now, attempts: 1 };
            }
            for (const r of catalogue.readings) if (r.phase !== '01_Java' || stage !== 'reading') value.readings[r.id] = { readAt: now };
            for (const w of catalogue.writers.filter(w => !catalogue.errors.some(error => w.id === `WRITE-${error.id}`))) if (w.phase !== '01_Java' || stage === 'complete') value.writing[w.id] = { text: 'I checked the output.', commit: '', reviewedAt: now };
            localStorage.setItem('roadmap-v2:english:guest', JSON.stringify(value));
        }, { catalogue, stage });
    };
    for (const stage of ['reading', 'writing']) {
        await seedResume(stage);
        await resume.goto(origin + base + '/english#01_Java/overview');
        await resume.reload();
        await expect(resume.getByText('Đã lưu tiến độ tiếng Anh trên thiết bị.', { exact: true })).toBeVisible();
        await resume.getByRole('button', { name: /^Tiếp tục: Java:/ }).click();
        await expect(resume).toHaveURL(new RegExp('/english#01_Java/' + stage + '$'));
        await resume.goto(origin + base + '/today');
        await expect(resume.getByRole('link', { name: 'Bắt đầu tiếng Anh', exact: true })).toHaveAttribute('href', base + '/english#01_Java/' + stage);
    }
    await seedResume('complete');
    await resume.goto(origin + base + '/english');
    await resume.reload();
    await resume.getByRole('button', { name: 'Đã hoàn thành các chặng · Mở lịch ôn', exact: true }).click();
    await expect(resume.locator('.english-flashcard')).toHaveCount(0);
    await resumeContext.close();
    pass('overview and Today resume reading/writing after vocabulary, and all-complete opens the review schedule');

    await page.setViewportSize({ width: 390, height: 844 });
    await visit();
    await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
    await expect(page.locator('#mobile-navigation').getByRole('link', { name: 'Tiếng Anh', exact: true })).toBeVisible();
    await page.locator('#mobile-navigation').getByRole('link', { name: 'Tiếng Anh', exact: true }).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await shot('mobile-overview');
    for (const section of ['vocabulary', 'reading', 'errors', 'writing', 'review']) {
        await visit('/english', '#01_Java/' + section);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, section + ' overflows mobile viewport');
        await shot('mobile-' + section);
    }
    await visit('/english', '#01_Java/vocabulary/01_Java-class');
    const mobileCard = page.locator('article[id="01_Java-class"]');
    await mobileCard.getByRole('button', { name: 'Mở nghĩa và ví dụ' }).click();
    await mobileCard.locator('.english-practice').nth(1).getByLabel('Câu trả lời').fill('class');
    await mobileCard.locator('.english-practice').nth(1).getByRole('button', { name: 'Kiểm tra câu trả lời' }).click();
    await expect(mobileCard).toContainText('Đúng theo đáp án của bài.');
    await mobileCard.scrollIntoViewIfNeeded(); await shot('mobile-term-practice');
    await visit('/english', '#01_Java/writing');
    await page.getByLabel('Bài viết tiếng Anh').fill('The method rejects an empty title. I checked the error.');
    await page.getByRole('button', { name: 'Tôi đã tự đối chiếu bài viết' }).click();
    await saved(); await page.reload(); await saved();
    await expect(page.getByLabel('Bài viết tiếng Anh')).toHaveValue('The method rejects an empty title. I checked the error.');
    await page.locator('.english-writing').scrollIntoViewIfNeeded(); await shot('mobile-writing-practice');
    await visit('/english', '#03_Spring/reading');
    const mobileBridge = page.locator('.english-practice').filter({ hasText: 'SPRING-BRIDGE-VALIDATE' });
    await mobileBridge.getByText('Mở gợi ý từng bước', { exact: true }).click();
    await mobileBridge.scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'mobile intermediate trace overflows');
    await shot('mobile-intermediate');
    pass('390px mobile menu, all five areas, vocabulary grading, writing reload and intermediate trace');

    let supabaseOrigin;
    const materialsContext = await browser.newContext();
    const sourceRows = [
        { id: 'unsafe', title: 'Unsafe source', purpose: 'reference', phase_slug: '01_Java', description: 'Unsafe external source.', resource_type: 'link', file_path: null, source_url: 'javascript:alert(1)', submitted_by: 'owner', status: 'approved', created_at: '2026-10-16T00:00:00Z' },
        { id: 'safe', title: 'Safe source', purpose: 'reference', phase_slug: '01_Java', description: 'HTTPS external source.', resource_type: 'link', file_path: null, source_url: 'https://docs.example/guide', submitted_by: 'owner', status: 'approved', created_at: '2026-10-16T00:00:00Z' },
    ];
    await materialsContext.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === origin) return route.continue();
        if (url.pathname.endsWith('/rest/v1/community_resources')) { supabaseOrigin = url.origin; return route.fulfill({ status: 200,
            headers: { 'Content-Type': 'application/json', 'Content-Range': '0-1/2' }, body: JSON.stringify(sourceRows) }); }
        return route.abort();
    });
    const materials = await materialsContext.newPage();
    materials.on('pageerror', error => errors.push(error.message));
    await materials.goto(origin + base + '/materials');
    const unsafeCard = materials.locator('.material-card').filter({ has: materials.getByRole('heading', { name: 'Unsafe source', exact: true }) });
    await expect(unsafeCard).toBeVisible();
    await expect(unsafeCard.locator('a')).toHaveCount(0);
    const safeCard = materials.locator('.material-card').filter({ has: materials.getByRole('heading', { name: 'Safe source', exact: true }) });
    await expect(safeCard.getByRole('link', { name: 'Mở nguồn' })).toHaveAttribute('href', 'https://docs.example/guide');
    await materialsContext.close();
    pass('community library blocks unsafe source URLs while preserving valid HTTPS links');

    const progressContext=await browser.newContext();
    await progressContext.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    const progressA=await progressContext.newPage(),progressB=await progressContext.newPage();
    for(const tab of [progressA,progressB]){tab.on('pageerror',error=>errors.push(error.message));await tab.goto(origin+base+'/docs/00_setup');await expect(tab.locator('#status-P0\\.1')).toBeEnabled();}
    const holdProgress=async()=>progressA.evaluate(async()=>{
        await new Promise(resolve=>{void navigator.locks.request('progress:roadmap-v3:guest',{mode:'exclusive'},()=>{
            resolve();return new Promise(release=>{window.releaseProgressLock=release;});
        });});
    });
    await holdProgress();
    try{
        await Promise.all([progressA.locator('#status-P0\\.1').selectOption('needs_review'),progressB.locator('#status-P0\\.2').selectOption('in_progress')]);
        for(const tab of [progressA,progressB])await expect(tab.getByText('Đang lưu tiến độ trên thiết bị…',{exact:true})).toBeVisible();
        await expect.poll(()=>progressA.evaluate(async()=>(await navigator.locks.query()).pending.filter(lock=>lock.name==='progress:roadmap-v3:guest').length)).toBe(2);
    }finally{await progressA.evaluate(()=>window.releaseProgressLock());}
    await expect.poll(()=>progressA.evaluate(()=>{
        const saved=JSON.parse(localStorage.getItem('roadmap-v3:guest')??'{}');return [saved['P0.1']?.status,saved['P0.2']?.status];
    })).toEqual(['needs_review','in_progress']);
    await progressB.reload();await expect(progressB.locator('#status-P0\\.1')).toHaveValue('needs_review');await expect(progressB.locator('#status-P0\\.2')).toHaveValue('in_progress');
    pass('native progress locks serialize simultaneous tab edits and preserve both after reload');
    await progressB.goto(origin+base+'/today');
    await progressB.getByText('Nhập lịch ôn từ CLI',{exact:true}).click();
    const progressReviewRow={result:'pass',due:'2026-10-18',hint:0,active_tags:[]};
    await progressB.evaluate(()=>{Date.now=()=>123456;});
    const firstProgressSource=JSON.stringify({'P0.1':progressReviewRow,'P0.3':progressReviewRow});
    await progressB.getByLabel('File lịch ôn').setInputFiles({name:'review-state.json',mimeType:'application/json',buffer:Buffer.from(firstProgressSource)});
    await holdProgress();
    try{
        await progressB.getByRole('button',{name:'Nhập 2 bài (giữ bài đã có)',exact:true}).click();
        await expect(progressB.getByText('Đang nhập lịch ôn…',{exact:true})).toBeVisible();
        await expect(progressB.getByRole('button',{name:'Nhập 2 bài (giữ bài đã có)',exact:true})).toBeDisabled();
        assert.equal(await progressB.evaluate(()=>JSON.parse(localStorage.getItem('roadmap-v3:guest'))['P0.3']),undefined);
        await expect(progressB.getByText('Đã nhập lịch ôn vào đúng phạm vi đã chọn.',{exact:true})).toHaveCount(0);
    }finally{await progressA.evaluate(()=>window.releaseProgressLock());}
    await expect(progressB.getByText('Đã nhập lịch ôn vào đúng phạm vi đã chọn.',{exact:true})).toBeVisible();
    const importedProgress=await progressB.evaluate(()=>JSON.parse(localStorage.getItem('roadmap-v3:guest')));
    assert.equal(importedProgress['P0.1'].status,'needs_review');assert.equal(importedProgress['P0.3'].status,'self_completed');
    pass('CLI progress import waits for durable storage and preserves existing exercises');
    const secondProgressSource=JSON.stringify({'P0.4':progressReviewRow});
    await progressB.getByLabel('File lịch ôn').setInputFiles({name:'review-second.json',mimeType:'application/json',buffer:Buffer.from(secondProgressSource)});
    await progressB.getByRole('button',{name:'Nhập 1 bài (giữ bài đã có)',exact:true}).click();
    await expect(progressB.getByText('Đã nhập lịch ôn vào đúng phạm vi đã chọn.',{exact:true})).toBeVisible();
    const originalImports=await progressB.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('roadmap-v3:guest:review-import:')).map(key=>localStorage.getItem(key)));
    assert.deepEqual(originalImports.sort(),[firstProgressSource,secondProgressSource].sort());
    await progressContext.close();pass('imports in the same clock tick preserve both original JSON sources');

    assert.ok(supabaseOrigin, 'the library request identifies the configured Supabase origin');
    const owner = '00000000-0000-0000-0000-000000000021';
    const user = { id: owner, aud: 'authenticated', role: 'authenticated', email: 'project-test@example.test', app_metadata: { provider: 'email' }, user_metadata: {} };
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const jwt = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: owner, exp: expires, role: 'authenticated' })).toString('base64url'), 'test-signature'].join('.');
    let projectRow = null;
    async function projectDevice(options={}) {
        const device = await browser.newContext();
        const state = { offline: false, missingSchema: false, progressRows: [], progressWrites: 0, ...options };
        const authKey = `sb-${new URL(supabaseOrigin).hostname.split('.')[0]}-auth-token`;
        await device.addInitScript(({ key, session }) => {
            // Exercise the same flow on browsers without newer signal helpers.
            Object.defineProperty(AbortSignal, 'any', { value: undefined, configurable: true });
            Object.defineProperty(AbortSignal, 'timeout', { value: undefined, configurable: true });
            localStorage.setItem(key, JSON.stringify(session));
        }, { key: authKey, session: { access_token: jwt, refresh_token: 'test-refresh', expires_at: expires, expires_in: 3600, token_type: 'bearer', user } });
        await device.route('**/*', async route => {
            const request = route.request(), url = new URL(request.url());
            if (url.origin === origin) return route.continue();
            if (url.origin !== supabaseOrigin || state.offline) return route.abort();
            const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
            if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
            if (url.pathname.endsWith('/auth/v1/user')) return route.fulfill({ status: 200, headers, body: JSON.stringify(user) });
            if(state.missingSchema&&(url.pathname.endsWith('/rest/v1/project_drafts')||url.pathname.endsWith('/rest/v1/rpc/save_project_draft')))return route.fulfill({status:404,headers,body:JSON.stringify({code:'PGRST205',message:'project_drafts is not in the schema cache'})});
            if(url.pathname.endsWith('/rest/v1/progress')) {
                const exercise=url.searchParams.get('exercise_id')?.replace(/^eq\./,'');
                const data=exercise?state.progressRows.find(row=>row.exercise_id===exercise)??null:state.progressRows;
                return route.fulfill({status:200,headers,body:JSON.stringify(data)});
            }
            if(url.pathname.endsWith('/rest/v1/rpc/save_learning_progress')) {
                const args=request.postDataJSON(),old=state.progressRows.find(row=>row.exercise_id===args.p_exercise_id);
                assert.equal(args.p_owner,owner);
                if(args.p_revision!==(old?.revision??0))return route.fulfill({status:409,headers,body:JSON.stringify({message:'PROGRESS_CONFLICT',code:'P0001'})});
                const row={user_id:owner,phase:args.p_phase,exercise_id:args.p_exercise_id,status:args.p_status,revision:args.p_revision+1,
                    due_at:args.p_due_at===null?null:new Date(args.p_due_at).toISOString(),hint_level:Math.max(old?.hint_level??0,args.p_hint_level),error_tags:args.p_error_tags};
                state.progressRows=state.progressRows.filter(value=>value.exercise_id!==row.exercise_id).concat(row);state.progressWrites++;
                return route.fulfill({status:200,headers,body:JSON.stringify(row)});
            }
            if (url.pathname.endsWith('/rest/v1/project_drafts')) return route.fulfill({ status: 200, headers, body: JSON.stringify(projectRow) });
            if (url.pathname.endsWith('/rest/v1/rpc/save_project_draft')) {
                const args = request.postDataJSON();
                assert.equal(args.p_owner, owner);
                if (args.p_revision !== (projectRow?.revision ?? 0)) return route.fulfill({ status: 409, headers, body: JSON.stringify({ message: 'PROJECT_CONFLICT', code: 'P0001' }) });
                projectRow = { content: args.p_content, revision: args.p_revision + 1, user_id: owner };
                return route.fulfill({ status: 200, headers, body: JSON.stringify(projectRow) });
            }
            return route.fulfill({ status: 200, headers, body: '[]' });
        });
        const tab = await device.newPage();
        tab.on('pageerror', error => { errors.push(error.message); console.error('Project browser error:', error.message); });
        await tab.goto(origin + base + '/projects/mine');
        await expect(tab.getByRole('textbox', { name: 'Tên dự án', exact: true })).toBeEnabled();
        return { context: device, tab, state };
    }
    const deviceA = await projectDevice();
    const projectStatus = tab => tab.locator('.project-cloud-sync [role="status"]');
    await deviceA.tab.getByRole('textbox', { name: 'Tên dự án', exact: true }).fill('My synced project');
    await expect(projectStatus(deviceA.tab)).toHaveText('Đã đồng bộ dự án với máy chủ.', { timeout: 15000 });
    assert.equal(projectRow.content.name, 'My synced project');
    const deviceB = await projectDevice();
    await expect(deviceB.tab.getByRole('textbox', { name: 'Tên dự án', exact: true })).toHaveValue('My synced project');
    await expect(projectStatus(deviceB.tab)).toHaveText('Đã đồng bộ dự án với máy chủ.', { timeout: 15000 });
    pass('project drafts upload and restore on a separate browser device using account-scoped revisions');
    deviceA.state.offline = true;
    await deviceA.tab.getByRole('textbox', { name: 'Tên dự án', exact: true }).fill('Offline device edit');
    await expect(projectStatus(deviceA.tab)).toContainText('Chưa xác nhận đồng bộ', { timeout: 20000 });
    await deviceA.tab.reload();
    await expect(deviceA.tab.getByRole('textbox', { name: 'Tên dự án', exact: true })).toHaveValue('Offline device edit');
    await deviceB.tab.getByRole('textbox', { name: 'Tên dự án', exact: true }).fill('New server edit');
    await expect(projectStatus(deviceB.tab)).toHaveText('Đã đồng bộ dự án với máy chủ.', { timeout: 15000 });
    deviceA.state.offline = false;
    await deviceA.tab.getByRole('button', { name: 'Đồng bộ lại dự án', exact: true }).click();
    await expect(deviceA.tab.getByRole('heading', { name: 'Chọn bản dự án muốn giữ' })).toBeVisible();
    const conflictDownload = deviceA.tab.waitForEvent('download');
    await deviceA.tab.getByRole('button', { name: 'Tải bản thiết bị', exact: true }).click();
    const conflictFile = await conflictDownload;
    assert.equal(JSON.parse(readFileSync(await conflictFile.path(), 'utf8')).name, 'Offline device edit');
    await deviceA.tab.getByRole('button', { name: 'Dùng bản máy chủ trên thiết bị này', exact: true }).click();
    await expect(deviceA.tab.getByRole('textbox', { name: 'Tên dự án', exact: true })).toHaveValue('New server edit');
    await expect(projectStatus(deviceA.tab)).toHaveText('Đã đồng bộ dự án với máy chủ.', { timeout: 15000 });
    const archived = await deviceA.tab.evaluate(key => JSON.parse(localStorage.getItem(key)), `roadmap-v2:project-conflict:user:${owner}`);
    assert.equal(archived.local.name, 'Offline device edit');assert.equal(archived.remote.name, 'New server edit');
    // Long imported names are valid draft data; the conflict panel must fit mobile.
    deviceA.state.offline = true;
    await deviceA.tab.getByRole('textbox', { name: 'Tên dự án', exact: true }).fill('A'.repeat(5000));
    await expect.poll(() => deviceA.tab.evaluate(key => JSON.parse(localStorage.getItem(key)).name.length, `roadmap-v2:project:user:${owner}`)).toBe(5000);
    projectRow = { ...projectRow, revision: projectRow.revision + 1, content: { ...projectRow.content, name: 'B'.repeat(5000) } };
    await expect(projectStatus(deviceA.tab)).toContainText('Chưa xác nhận đồng bộ', { timeout: 20000 });
    deviceA.state.offline = false;
    await deviceA.tab.getByRole('button', { name: 'Đồng bộ lại dự án', exact: true }).click();
    await expect(deviceA.tab.getByRole('heading', { name: 'Chọn bản dự án muốn giữ' })).toBeVisible();
    await deviceA.tab.setViewportSize({ width: 390, height: 1000 });
    assert.equal(await deviceA.tab.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'long project names overflow the mobile conflict panel');
    const longNameDownload = deviceA.tab.waitForEvent('download');
    await deviceA.tab.getByRole('button', { name: 'Tải bản thiết bị', exact: true }).click();
    assert.equal(JSON.parse(readFileSync(await (await longNameDownload).path(), 'utf8')).name.length, 5000);
    pass('long project names fit the mobile conflict panel without truncating downloaded drafts');

    await deviceA.tab.goto(origin + base + '/projects');
    await deviceA.tab.evaluate(async name => {
        await new Promise(resolve => { void navigator.locks.request(name, { mode: 'exclusive' }, () => {
            resolve(); return new Promise(release => { window.releaseProjectReviewLock = release; });
        }); });
    }, `project-cloud:${owner}`);
    const waitingTab = await deviceA.context.newPage();
    waitingTab.on('pageerror', error => errors.push(error.message));
    try {
        await waitingTab.goto(origin + base + '/projects/mine');
        await expect.poll(() => deviceA.tab.evaluate(async name => (await navigator.locks.query()).pending.filter(lock => lock.name === name).length, `project-cloud:${owner}`)).toBe(1);
        await waitingTab.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
        await expect(waitingTab.getByText('Khách lưu dự án trên thiết bị.', { exact: false })).toBeVisible();
        await expect.poll(() => deviceA.tab.evaluate(async name => (await navigator.locks.query()).pending.filter(lock => lock.name === name).length, `project-cloud:${owner}`)).toBe(0);
    } finally {
        await deviceA.tab.evaluate(() => window.releaseProjectReviewLock());
        await waitingTab.close();
    }
    pass('signing out unmounts project sync and cancels pending cloud lock requests');
    await deviceA.context.close();await deviceB.context.close();
    pass('offline project edits survive reload, require a conflict choice and preserve both copies before applying the server draft');

    const cancelDevice=await projectDevice(),cancelProgress=await cancelDevice.context.newPage();
    cancelProgress.on('pageerror',error=>errors.push(error.message));
    await cancelProgress.goto(origin+base+'/docs/00_setup');await expect(cancelProgress.locator('#status-P0\\.1')).toBeEnabled();
    const accountProgressKey=`roadmap-v3:user:${owner}`,beforeCancel=await cancelProgress.evaluate(key=>localStorage.getItem(key),accountProgressKey);
    await cancelDevice.tab.evaluate(async name=>{
        await new Promise(resolve=>{void navigator.locks.request(name,{mode:'exclusive'},()=>{resolve();return new Promise(release=>{window.releaseProgressAccountLock=release;});});});
    },`progress:${accountProgressKey}`);
    try{
        await cancelProgress.locator('#status-P0\\.1').selectOption('in_progress');
        await expect.poll(()=>cancelDevice.tab.evaluate(async name=>(await navigator.locks.query()).pending.filter(lock=>lock.name===name).length,`progress:${accountProgressKey}`)).toBe(1);
        await cancelProgress.getByRole('button',{name:'Đăng xuất',exact:true}).click();
        await expect(cancelProgress.getByRole('button',{name:'Đăng nhập',exact:true})).toBeVisible();
        await expect.poll(()=>cancelDevice.tab.evaluate(async name=>(await navigator.locks.query()).pending.filter(lock=>lock.name===name).length,`progress:${accountProgressKey}`)).toBe(0);
        assert.equal(await cancelProgress.evaluate(key=>localStorage.getItem(key),accountProgressKey),beforeCancel);
    }finally{await cancelDevice.tab.evaluate(()=>window.releaseProgressAccountLock());await cancelDevice.context.close();}
    pass('signing out cancels a native queued progress write without changing the old account backup');

    const beforeMigration=await projectDevice({missingSchema:true});
    await beforeMigration.tab.getByRole('textbox',{name:'Tên dự án',exact:true}).fill('Saved before migration');
    await expect(projectStatus(beforeMigration.tab)).toContainText('Chưa xác nhận đồng bộ',{timeout:15000});
    await beforeMigration.tab.reload();await expect(beforeMigration.tab.getByRole('textbox',{name:'Tên dự án',exact:true})).toHaveValue('Saved before migration');
    await beforeMigration.tab.getByRole('button',{name:/Bằng chứng & đề cương/}).click();
    const localDownload=beforeMigration.tab.waitForEvent('download');await beforeMigration.tab.getByRole('button',{name:'Tải bản lưu JSON',exact:true}).click();
    assert.equal(JSON.parse(readFileSync(await(await localDownload).path(),'utf8')).name,'Saved before migration');
    await beforeMigration.context.close();pass('missing project migration keeps local editing, reload persistence and JSON export available');

    for(const keepLocal of [true,false]) {
        const serverProgress={user_id:owner,phase:'00_setup',exercise_id:'P0.1',status:'in_progress',revision:3,due_at:'2026-10-17T17:00:00+00:00',hint_level:keepLocal?3:1,error_tags:[]};
        const hintDevice=await projectDevice({progressRows:[serverProgress]});
        const progressKey=`roadmap-v3:user:${owner}`;
        await hintDevice.tab.evaluate(({key,row})=>localStorage.setItem(key,JSON.stringify({'P0.1':row})),{key:progressKey,row:{...serverProgress,status:'needs_review',revision:2,hint_level:keepLocal?1:3,pending:true,conflict:true}});
        await hintDevice.tab.goto(origin+base+'/docs/00_setup');
        await expect(hintDevice.tab.locator('#status-P0\\.1')).toBeEnabled();
        await hintDevice.tab.getByRole('button',{name:keepLocal?'Giữ bản thiết bị':'Dùng bản máy chủ',exact:true}).click();
        await expect(hintDevice.tab.locator('.tracker-panel [role="status"]')).toHaveText('Đã đồng bộ với máy chủ.');
        const persisted=await hintDevice.tab.evaluate(key=>JSON.parse(localStorage.getItem(key))['P0.1'],progressKey);
        assert.equal(persisted.hint_level,3);assert.equal(persisted.pending,false);assert.equal(persisted.status,keepLocal?'needs_review':'in_progress');
        assert.equal(hintDevice.state.progressRows[0].hint_level,3);assert.equal(hintDevice.state.progressWrites,1);
        await hintDevice.tab.reload();
        await expect(hintDevice.tab.locator('#status-P0\\.1')).toHaveValue(keepLocal?'needs_review':'in_progress');
        assert.equal(await hintDevice.tab.evaluate(key=>JSON.parse(localStorage.getItem(key))['P0.1'].hint_level,progressKey),3);
        await hintDevice.context.close();pass(`progress conflict choice (${keepLocal?'local':'remote'}) preserves hint maxima with real SDK and UTC acknowledgements`);
    }

    const unsupported = await context.newPage();
    await unsupported.addInitScript(() => Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }));
    await unsupported.goto(origin + base + '/english#01_Java/vocabulary/01_Java-parameter');
    await unsupported.getByRole('button', { name: 'Mở nghĩa và ví dụ' }).click();
    await expect(unsupported.getByText('Thiết bị chưa hỗ trợ phát âm. Bạn vẫn có thể học bằng văn bản.').first()).toBeVisible();
    await expect(unsupported.getByRole('button', { name: 'Nghe phát âm', exact: true })).toBeDisabled();
    await unsupported.close(); pass('unsupported pronunciation displays a readable fallback');
    const searchFor = async (query, label) => {
        await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
        await page.getByPlaceholder('Tìm chặng, bài tập, từ tiếng Anh…').fill(query);
        await page.getByRole('button', { name: label }).click();
    };
    await visit('/docs/02_Http-Sql', '#SQLB01');
    await expect(page.locator('.exercise-active-id')).toHaveText('SQLB01');
    await searchFor('SQLB03', /^SQLB03 —/);
    await expect(page).toHaveURL(/#SQLB03$/);
    await expect(page.locator('.exercise-active-id')).toHaveText('SQLB03');
    await page.goBack();
    await expect(page.locator('.exercise-active-id')).toHaveText('SQLB01');
    const springLessonTitle = JSON.parse(readFileSync(path.join(website, 'src/generated/catalogue.json'), 'utf8')).lessons.find(item => item.id === 'SPRING03').title;
    await visit('/learn/03_Spring', '#SPRING01');
    await expect(page.locator('.lesson-progress [role="status"]')).toHaveText('Đã lưu trên thiết bị.');
    await searchFor('SPRING03', /^Bài học SPRING03 —/);
    await expect(page.locator('.course-index button[aria-current="page"]')).toContainText(springLessonTitle);
    await page.getByRole('button', { name: /Luyện tập/ }).click();
    await searchFor('SPRING03', /^Bài học SPRING03 —/);
    await expect(page.locator('.course-lesson')).toBeVisible();
    await expect(page.locator('.course-index button[aria-current="page"]')).toContainText(springLessonTitle);
    pass('same-page search selects SQL exercises and Spring lessons, supports Back and reopens the lesson for the same hash');
    // The SQL/Spring coding bridges connect the English traces to real local contracts.
    for (const [phase, lesson, id] of [
        ['02_Http-Sql', 'SQL01', 'SQLB01'], ['02_Http-Sql', 'SQL02', 'SQLB03'],
        ['03_Spring', 'SPRING01', 'SPRB01'], ['03_Spring', 'SPRING02', 'SPRB02'], ['03_Spring', 'SPRING03', 'SPRB03'],
    ]) {
        await visit('/learn/' + phase, '#' + lesson);
        await expect(page.getByRole('link', { name: 'Làm ' + id, exact: true })).toHaveAttribute('href', base + '/docs/' + phase + '#' + id);
    }
    pass('SQL/Spring lessons link directly to their coding bridge exercises');
    for (const phase of ['02_Http-Sql', '03_Spring']) {
        await visit('/learn/' + phase);
        await page.getByRole('button', { name: /Luyện tập/ }).click();
        await page.getByLabel('Lọc bài').selectOption('bridge');
        await expect(page.locator('.learning-grid article')).toHaveCount(3);
        await page.locator('.learning-grid article').first().getByRole('link').click();
        await expect(page.locator('.exercise-active-id')).toHaveText(phase === '02_Http-Sql' ? 'SQLB01' : 'SPRB01');
    }
    pass('course filter shows three guided exercises and opens the selected prompt');
    const bridges = JSON.parse(readFileSync(path.join(website, 'src/generated/catalogue.json'), 'utf8')).exercises.filter(item => /^(SQLB|SPRB)/.test(item.id));
    for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const exercise of bridges) {
            await visit('/docs/' + exercise.phase, '#' + exercise.id);
            await expect(page.locator('.exercise-active-id')).toHaveText(exercise.id);
            await expect(page.locator('.local-run-command')).toContainText(exercise.check.command);
            await expect(page.locator('.exercise-prompt')).toContainText('Giải thích');
            await expect(page.locator('.exercise-phase-note')).toHaveCount(0);
            await expect(page.locator('.exercise-solution')).not.toHaveAttribute('open', '');
            await page.getByRole('button', { name: 'Gợi ý 1', exact: true }).click();
            await expect(page.locator('.learning-tools')).toContainText(exercise.hints[0]);
            await page.locator('.exercise-solution summary').click();
            await expect(page.locator('.exercise-solution-content')).toBeVisible();
            if (exercise.id.startsWith('SQLB')) {
                await expect(page.getByRole('link', { name: 'Mở file trên GitHub', exact: true })).toHaveAttribute('href',
                    'https://github.com/VanDung279206/JavaBackend_AI_RoadMap/blob/main/' + exercise.check.file);
            }
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, exercise.id + ' overflows at ' + width);
        }
        pass('six coding bridge prompts, commands, hints and solutions at ' + width + 'px');
    }
    await page.evaluate(() => { window.location.hash = '#SPRB02'; });
    await expect(page.locator('.exercise-active-id')).toHaveText('SPRB02');
    await expect(page.locator('.exercise-solution-content')).not.toBeVisible();
    await page.goBack();
    await expect(page.locator('.exercise-active-id')).toHaveText('SPRB03');
    await expect(page.locator('.exercise-solution-content')).not.toBeVisible();
    await page.evaluate(() => { window.location.hash = '#%E0%A4'; });
    await expect(page.locator('.exercise-active-id')).toHaveText('SPRB03');
    pass('hash changes and Back select the right exercise, hide the previous solution and tolerate malformed hashes');
    await visit('/learn/03_Spring', '#SPRING02');
    const lessons = JSON.parse(readFileSync(path.join(website, 'src/generated/catalogue.json'), 'utf8')).lessons;
    await expect(page.locator('.course-index button[aria-current="page"]')).toContainText(lessons.find(item => item.id === 'SPRING02').title);
    await page.evaluate(() => { window.location.hash = '#%E0%A4'; });
    await expect(page.locator('.course-lesson')).toBeVisible();
    await expect(page.locator('.course-index button[aria-current="page"]')).toContainText(lessons.find(item => item.id === 'SPRING02').title);
    await page.reload();
    await expect(page.locator('.course-lesson')).toBeVisible();
    await expect(page.locator('.lesson-progress [role="status"]')).toHaveText('Đã lưu trên thiết bị.');
    await expect(page.locator('.course-index button[aria-current="page"]')).toContainText(lessons.find(item => item.id === 'SPRING01').title);
    pass('malformed lesson hashes keep the current lesson and reload safely with the first lesson');
    assert.deepEqual(errors, [], 'page exceptions');
    console.log(`PASS ${checks.length} browser workflows; Chromium ${browser.version()}`);
} finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
}
