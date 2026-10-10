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
        tab.on('pageerror', error => errors.push(error.message));
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

    const unsupported = await context.newPage();
    await unsupported.addInitScript(() => Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }));
    await unsupported.goto(origin + base + '/english#01_Java/vocabulary/01_Java-parameter');
    await unsupported.getByRole('button', { name: 'Mở nghĩa và ví dụ' }).click();
    await expect(unsupported.getByText('Thiết bị chưa hỗ trợ phát âm. Bạn vẫn có thể học bằng văn bản.').first()).toBeVisible();
    await expect(unsupported.getByRole('button', { name: 'Nghe phát âm', exact: true })).toBeDisabled();
    await unsupported.close(); pass('unsupported pronunciation displays a readable fallback');
    assert.deepEqual(errors, [], 'page exceptions');
    console.log(`PASS ${checks.length} browser workflows; Chromium ${browser.version()}`);
} finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
}
