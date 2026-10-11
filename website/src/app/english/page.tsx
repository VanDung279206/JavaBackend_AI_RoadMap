import EnglishWorkspace from '@/components/english/EnglishWorkspace';
export const metadata = { title: 'Tiếng Anh cho lập trình viên | Java Backend', description: 'Học thuật ngữ, đọc tài liệu và lỗi, viết giải thích code, ôn tập theo từng chặng.' };
export default function EnglishPage() {
    return <div className="page-shell english-shell"><header className="page-heading"><span className="eyebrow">HỌC CÙNG LẬP TRÌNH</span><h1 className="page-title">Tiếng Anh cho lập trình viên</h1><p className="page-description">Học từ và câu đơn trước, rồi đọc hiểu, giải thích lỗi và viết về code của chính bạn.</p></header><EnglishWorkspace /></div>;
}
