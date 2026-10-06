import ProjectPlanner from '@/components/ProjectPlanner';
export default function MyProjectPage() {
    return <section className="page-shell"><header className="page-heading"><span className="eyebrow">TỰ THIẾT KẾ VÀ TRIỂN KHAI</span><h1 className="page-title">Dự án của tôi</h1><p className="page-description">Chọn vấn đề của bạn, giới hạn phạm vi và tạo đề cương có các mốc chạy được. Knowledge Assistant là mẫu tham khảo; bạn tự chọn dữ liệu và nghiệp vụ.</p></header><ProjectPlanner /></section>;
}
