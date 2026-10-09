"use client";
import Link from 'next/link';
import { useEnglishProgress } from '@/lib/useEnglishProgress';
import { english, englishLink, englishPhaseFor } from '@/lib/english';
import { dueTerms, nextEnglishUnit } from '@/lib/english-core';
import { useEnglishClock } from '@/lib/useEnglishClock';

export default function EnglishDaily({ phase }: { phase?: string }) {
    const store = useEnglishProgress();
    const now = useEnglishClock();
    const due = dueTerms(english, store.value, now);
    const next = nextEnglishUnit(english, store.value, phase ? englishPhaseFor(phase) : undefined);
    return <section className="learning-card english-daily"><h2>10–15 phút tiếng Anh hôm nay</h2>{!store.ready ? <p>Đang tải lịch ôn tiếng Anh…</p> : <><p>{due.length ? `Ưu tiên ôn ${due.length} từ đến hạn hoặc đã chọn ôn ngay.` : `Học gắn với chặng: ${next.title}.`}</p><p>Ôn 3–5 từ → đọc một đoạn hoặc thông báo lỗi → viết hai câu về code và kết quả kiểm thử của bạn.</p></>}
        <div className="learning-actions"><Link href={due.length ? englishLink('all', 'review') : englishLink(next.phase, english.terms.some(t => t.phase === next.phase) ? 'vocabulary' : 'writing')}>{due.length ? 'Ôn từ đến hạn' : 'Bắt đầu tiếng Anh'}</Link>{english.readings.some(r => r.phase === next.phase) && <Link href={englishLink(next.phase, 'reading')}>Đọc và luyện câu</Link>}<Link href={englishLink(next.phase, 'writing')}>Viết về code đang làm</Link></div>{store.error && <p role="status">{store.error}</p>}
    </section>;
}
