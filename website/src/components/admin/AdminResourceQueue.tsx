"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, RefreshCw, X } from "lucide-react";
import catalogue from "@/generated/catalogue.json";
import { supabase } from "@/lib/supabase";
import { safeResourceUrl } from "@/lib/resource-url";

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

const PHASE_NAMES: Record<string, string> = Object.fromEntries(catalogue.phases.map(p=>[p.slug,p.title]));

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

  const requestVersion = useRef(0);
  const reviewing = useRef(false);

  const load = useCallback(async () => {
    if (reviewing.current) return;
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    try {
      const { data, error: queryError } = await supabase
        .from("community_resources")
        .select("id,title,purpose,phase_slug,description,resource_type,file_path,source_url,submitted_by,created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .order("id")
        .limit(50);
      if (version !== requestVersion.current) return;
      if (queryError) throw queryError;
      const paths = (data ?? []).flatMap(item => item.file_path ? [item.file_path] : []);
      const previews = new Map<string, string>();
      if (paths.length) {
        const { data: signed, error: signedError } = await supabase.storage
          .from("community-resources").createSignedUrls(paths, 15 * 60);
        if (version !== requestVersion.current) return;
        if (signedError) setError("Đã tải hàng chờ nhưng chưa tạo được liên kết xem tệp. Hãy làm mới để thử lại.");
        for (const file of signed ?? []) if (file.path && file.signedUrl) previews.set(file.path, file.signedUrl);
      }
      setItems((data ?? []).map(item => ({ ...item, preview_url: previews.get(item.file_path ?? '') })) as PendingResource[]);
    } catch {
      if (version === requestVersion.current) {
        setError("Không tải được hàng chờ. Hãy kiểm tra kết nối, migration V3 và quyền quản trị trong Supabase.");
        setItems([]);
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const requests = requestVersion;
    const frame = window.requestAnimationFrame(() => { void load(); });
    return () => { window.cancelAnimationFrame(frame); requests.current++; };
  }, [load]);

  const review = async (item: PendingResource, status: "approved" | "rejected") => {
    if (reviewing.current) return;
    reviewing.current = true;
    // Invalidate an older refresh so it cannot restore a row after moderation.
    const version = ++requestVersion.current;
    setLoading(false);
    setBusyId(item.id);
    setError("");
    setNotice("");
    let committed = false;
    try {
      const { data: updated, error: updateError } = await supabase
        .from("community_resources")
        .update({ status, moderation_note: notes[item.id]?.trim() || null,
          reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
        .eq("id", item.id).eq("status", "pending")
        .select("id,file_path").maybeSingle();
      if (updateError) throw updateError;
      if (!updated) {
        if (version === requestVersion.current) setError("Tài liệu đã được xử lý hoặc quyền truy cập đã thay đổi. Làm mới danh sách trước khi thử lại.");
        return;
      }
      committed = true;
      if (version === requestVersion.current) {
        setItems(current => current.filter(entry => entry.id !== item.id));
        setNotice(status === "approved" ? "Tài liệu đã có trong kho." : "Đã từ chối tài liệu.");
      }
      // A zero-row update means another reviewer won; never delete in that case.
      if (status === "rejected" && updated.file_path) {
        const { error: deleteError } = await supabase.storage
          .from("community-resources").remove([updated.file_path]);
        if (deleteError) throw deleteError;
      }
    } catch {
      if (version === requestVersion.current) setError(committed
        ? "Đã từ chối tài liệu nhưng chưa xóa được tệp riêng tư."
        : "Chưa xác nhận được quyết định. Làm mới danh sách để kiểm tra rồi thử lại.");
    } finally {
      reviewing.current = false;
      if (version === requestVersion.current) setBusyId("");
    }
  };

  return (
    <section className="admin-resource-queue" aria-labelledby="resource-queue-title">
      <div className="admin-resource-heading">
        <div>
          <span className="eyebrow">TÀI LIỆU CỘNG ĐỒNG</span>
          <h2 id="resource-queue-title">Chờ duyệt <span>{items.length}</span></h2>
          <p>Kiểm tra nội dung, quyền chia sẻ và chặng phù hợp trước khi công khai.</p>
        </div>
        <button type="button" className="resource-refresh-button" onClick={() => void load()} disabled={loading || Boolean(busyId)}>
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
          {items.map((item) => {
            const preview = safeResourceUrl(item.preview_url);
            const source = safeResourceUrl(item.source_url);
            return (
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
                  {preview ? (
                    <a href={preview} target="_blank" rel="noreferrer">
                      Mở tệp gửi lên <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ) : source ? (
                    <a href={source} target="_blank" rel="noreferrer">
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
                  <button type="button" className="resource-approve-button" onClick={() => review(item, "approved")} disabled={Boolean(busyId)}>
                    <Check size={15} aria-hidden="true" /> Duyệt và đăng
                  </button>
                  <button type="button" className="resource-reject-button" onClick={() => review(item, "rejected")} disabled={Boolean(busyId)}>
                    <X size={15} aria-hidden="true" /> Từ chối
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

