"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Check, RefreshCw, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PendingResource = {
  id: string;
  title: string;
  purpose: string;
  phase_slug: string;
  description: string;
  resource_type: "file" | "link";
  file_path: string | null;
  source_url: string | null;
  submitted_by: string;
  created_at: string;
  preview_url?: string;
};

const PHASE_NAMES: Record<string, string> = {
  "00_Setup": "Chặng 00 · Cài đặt",
  "01_Java": "Chặng 01 · Java",
  "02_Http-Sql": "Chặng 02 · HTTP & SQL",
  "03_Spring": "Chặng 03 · Spring Boot",
  "04_Quality": "Chặng 04 · Kiểm thử",
  "05_AI": "Chặng 05 · AI",
  "06_RAG": "Chặng 06 · RAG",
};

const PURPOSE_NAMES: Record<string, string> = {
  lesson: "Bài giảng",
  notes: "Ghi chú",
  exercise: "Bài tập & lời giải",
  reference: "Tham khảo",
  project: "Dự án mẫu",
};

export default function AdminResourceQueue({ reviewerId }: { reviewerId: string }) {
  const [items, setItems] = useState<PendingResource[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("community_resources")
      .select("id,title,purpose,phase_slug,description,resource_type,file_path,source_url,submitted_by,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);

    if (queryError) {
      setError("Không tải được hàng chờ. Hãy kiểm tra đã chạy migration V3 và quyền quản trị trong Supabase.");
      setItems([]);
      setLoading(false);
      return;
    }

    const withPreviews = await Promise.all((data ?? []).map(async (item) => {
      if (!item.file_path) return item as PendingResource;
      const { data: signed } = await supabase.storage
        .from("community-resources")
        .createSignedUrl(item.file_path, 15 * 60);
      return { ...item, preview_url: signed?.signedUrl } as PendingResource;
    }));
    setItems(withPreviews);
    setLoading(false);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void load(); });
    return () => window.cancelAnimationFrame(frame);
  }, [load]);

  const review = async (item: PendingResource, status: "approved" | "rejected") => {
    setBusyId(item.id);
    setError("");
    setNotice("");
    const moderationNote = notes[item.id]?.trim() || null;
    const { error: updateError } = await supabase
      .from("community_resources")
      .update({
        status,
        moderation_note: moderationNote,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("status", "pending");

    if (updateError) {
      setError("Chưa lưu được quyết định. Tải lại danh sách rồi thử lại.");
      setBusyId("");
      return;
    }

    if (status === "rejected" && item.file_path) {
      const { error: deleteError } = await supabase.storage
        .from("community-resources")
        .remove([item.file_path]);
      if (deleteError) setError("Đã từ chối tài liệu nhưng chưa xóa được tệp riêng tư.");
    }

    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setNotice(status === "approved" ? "Tài liệu đã có trong kho." : "Đã từ chối tài liệu.");
    setBusyId("");
  };

  return (
    <section className="admin-resource-queue" aria-labelledby="resource-queue-title">
      <div className="admin-resource-heading">
        <div>
          <span className="eyebrow">TÀI LIỆU CỘNG ĐỒNG</span>
          <h2 id="resource-queue-title">Chờ duyệt <span>{items.length}</span></h2>
          <p>Kiểm tra nội dung, quyền chia sẻ và chặng phù hợp trước khi công khai.</p>
        </div>
        <button type="button" className="resource-refresh-button" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={15} aria-hidden="true" /> Làm mới
        </button>
      </div>

      {error && <p className="resource-alert resource-alert-error" role="alert">{error}</p>}
      {notice && <p className="resource-alert resource-alert-success" role="status">{notice}</p>}
      {loading ? (
        <p className="resource-empty-state">Đang tải tài liệu…</p>
      ) : items.length === 0 ? (
        <p className="resource-empty-state">Hàng chờ đang trống.</p>
      ) : (
        <div className="admin-resource-list">
          {items.map((item) => (
            <article className="admin-resource-card" key={item.id}>
              <div className="admin-resource-card-heading">
                <div>
                  <span className="resource-card-meta">{PHASE_NAMES[item.phase_slug]} · {PURPOSE_NAMES[item.purpose]}</span>
                  <h3>{item.title}</h3>
                </div>
                <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString("vi-VN")}</time>
              </div>
              <p>{item.description}</p>
              <div className="admin-resource-attachment">
                {item.preview_url ? (
                  <a href={item.preview_url} target="_blank" rel="noreferrer">
                    Mở tệp gửi lên <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ) : item.source_url ? (
                  <a href={item.source_url} target="_blank" rel="noreferrer">
                    Mở liên kết nguồn <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ) : <span>Người gửi: {item.submitted_by.slice(0, 8)}…</span>}
              </div>
              <label className="admin-review-note">
                Ghi chú cho người gửi (nếu từ chối)
                <input
                  value={notes[item.id] ?? ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                  maxLength={400}
                  placeholder="Ví dụ: Chọn lại chặng hoặc gửi bản có quyền chia sẻ"
                />
              </label>
              <div className="admin-resource-actions">
                <button type="button" className="resource-approve-button" onClick={() => void review(item, "approved")} disabled={busyId === item.id}>
                  <Check size={15} aria-hidden="true" /> Duyệt và đăng
                </button>
                <button type="button" className="resource-reject-button" onClick={() => void review(item, "rejected")} disabled={busyId === item.id}>
                  <X size={15} aria-hidden="true" /> Từ chối
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

