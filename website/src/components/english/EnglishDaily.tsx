"use client";
import Link from 'next/link';
import { useEnglishProgress } from '@/lib/useEnglishProgress';
import { english, englishLink, englishPhaseFor } from '@/lib/english';
import { dueTerms, nextEnglishUnit, englishUnitStatus } from '@/lib/english-core';
import { useEnglishClock } from '@/lib/useEnglishClock';

export default function EnglishDaily({ phase }: { phase?: string }) {
    const store = useEnglishProgress();
    const now = useEnglishClock();
    const due = dueTerms(english, store.value, now);
    const next = nextEnglishUnit(english, store.value, phase ? englishPhaseFor(phase) : undefined);
    const status = englishUnitStatus(english, store.value, next.phase);
    return <section className="learning-card english-daily"><h2>10–15 phút tiếng Anh hôm nay</h2>{!store.ready ? <p>Đang tải lịch ôn tiếng Anh…</p> : <><p>{due.length ? `Ưu tiên ôn ${due.length} từ đến hạn hoặc đã chọn ôn ngay.` : status.nextSection ? `Học gắn với chặng: ${next.title}.` : 'Đã hoàn thành các nhiệm vụ chặng. Mở lịch ôn hoặc luyện thêm.'}</p><p>Ôn 3–5 từ → đọc một đoạn hoặc thông báo lỗi → viết hai câu về code và kết quả kiểm thử của bạn.</p></>}
        <div className="learning-actions">{store.ready && !store.blocked && <Link href={due.length ? englishLink('all', 'review') : status.nextSection ? englishLink(next.phase, status.nextSection) : englishLink('all', 'review')}>{due.length ? 'Ôn từ đến hạn' : status.nextSection ? 'Bắt đầu tiếng Anh' : 'Mở lịch ôn'}</Link>}{english.readings.some(r => r.phase === next.phase) && <Link href={englishLink(next.phase, 'reading')}>Đọc và luyện câu</Link>}<Link href={englishLink(next.phase, 'writing')}>Viết về code đang làm</Link></div>{store.error && <p role="status">{store.error}</p>}
    </section>;
}
