import catalogue from '@/generated/catalogue.json';
import PhaseLearning from '@/components/PhaseLearning';
import { notFound } from 'next/navigation';

export function generateStaticParams() { return catalogue.courses.map(course => ({ phase: course.phase })); }
export default async function LearnPage({ params }: { params: Promise<{ phase: string }> }) {
    const { phase } = await params;
    const course = catalogue.courses.find(item => item.phase === phase);
    const config = catalogue.phases.find(item => item.slug === phase);
    if (!course || !config) notFound();
    return <section className="page-shell"><header className="page-heading"><span className="eyebrow">HỌC CHẶNG {config.number}</span><h1 className="page-title">{config.title}</h1><p className="page-description">Học khái niệm qua ví dụ, luyện từng bước, áp dụng vào sản phẩm và kiểm tra cuối chặng.</p></header><PhaseLearning phase={phase} /></section>;
}
