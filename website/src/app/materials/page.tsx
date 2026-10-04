"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, Check, Clock3, FilePlus2, Link2, Search, Upload } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import AuthButton from "@/components/AuthButton";
import { supabase } from "@/lib/supabase";

type ResourcePurpose = "lesson" | "notes" | "exercise" | "reference" | "project";
type ResourceType = "file" | "link";
type ResourceStatus = "pending" | "approved" | "rejected";

type Resource = {
  id: string;
  title: string;
  purpose: ResourcePurpose;
  phase_slug: string;
  description: string;
  resource_type: ResourceType;
  file_path: string | null;
  source_url: string | null;
  submitted_by: string;
  status: ResourceStatus;
  moderation_note: string | null;
  created_at: string;
  download_url?: string;
};

const PHASES = [
  ["00_Setup", "Chặng 00 · Cài đặt"],
  ["01_Java", "Chặng 01 · Java"],
  ["02_Http-Sql", "Chặng 02 · HTTP & SQL"],
  ["03_Spring", "Chặng 03 · Spring Boot"],
  ["04_Quality", "Chặng 04 · Kiểm thử & triển khai"],
  ["05_AI", "Chặng 05 · Tích hợp AI"],
  ["06_RAG", "Chặng 06 · RAG"],
] as const;

const PURPOSES: { id: ResourcePurpose; label: string; detail: string }[] = [
  { id: "lesson", label: "Bài giảng", detail: "Giải thích khái niệm hoặc quy trình." },
  { id: "notes", label: "Ghi chú", detail: "Tóm tắt ngắn, checklist hoặc sơ đồ." },
  { id: "exercise", label: "Bài tập & lời giải", detail: "Đề tự luyện, ví dụ hoặc cách giải." },
  { id: "reference", label: "Tham khảo", detail: "Tài liệu chính thức, sách hoặc bài đọc." },
  { id: "project", label: "Dự án mẫu", detail: "Mã nguồn và hướng dẫn chạy." },
];

const PURPOSE_LABELS = Object.fromEntries(PURPOSES.map((item) => [item.id, item.label])) as Record<ResourcePurpose, string>;
const PHASE_LABELS = Object.fromEntries(PHASES) as Record<string, string>;
const FILE_MIMES: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const MAX_FILE_SIZE = 15 * 1024 * 1024;

function displayError(error: { code?: string; message?: string }) {
  const detail = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  if (detail.includes("community_resources") || detail.includes("bucket") || detail.includes("42p01")) {
    return "Kho tài liệu chưa được khởi tạo. Quản trị viên cần chạy database/migrations/V3__community_resources.sql trong Supabase.";
  }
  return "Chưa kết nối được với kho tài liệu. Kiểm tra mạng rồi thử lại.";
}

function safeFileName(name: string) {
  const clean = name.normalize("NFKC").replace(/[\\/]/g, "_").replace(/[^\p{L}\p{N}._ -]/gu, "_");
  return clean.slice(-120) || "tai-lieu";
}

export default function MaterialsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"library" | "submit" | "mine">("library");
  const [resources, setResources] = useState<Resource[]>([]);
  const [mine, setMine] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [myLoading, setMyLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phaseSlug, setPhaseSlug] = useState<string>(PHASES[0][0]);
  const [purpose, setPurpose] = useState<ResourcePurpose>("reference");
  const [resourceType, setResourceType] = useState<ResourceType>("file");
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    let authEventSeen = false;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      authEventSeen = true;
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && !authEventSeen) setUser(data.session?.user ?? null);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadPublished = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await supabase
      .from("community_resources")
      .select("id,title,purpose,phase_slug,description,resource_type,file_path,source_url,submitted_by,status,moderation_note,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      setResources([]);
      setLoadError(displayError(error));
      setLoading(false);
      return;
    }

    const withLinks = await Promise.all((data ?? []).map(async (item) => {
      if (!item.file_path) return item as Resource;
      const { data: signed } = await supabase.storage
        .from("community-resources")
        .createSignedUrl(item.file_path, 60 * 60);
      return { ...item, download_url: signed?.signedUrl } as Resource;
    }));
    setResources(withLinks);
    setLoading(false);
  }, []);

  const loadMine = useCallback(async () => {
    if (!user) {
      setMine([]);
      return;
    }
    setMyLoading(true);
    const { data, error } = await supabase
      .from("community_resources")
      .select("id,title,purpose,phase_slug,description,resource_type,file_path,source_url,submitted_by,status,moderation_note,created_at")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) setNotice(displayError(error));
    else setMine((data ?? []) as Resource[]);
    setMyLoading(false);
  }, [user]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadPublished(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadPublished]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadMine(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadMine]);

  const visibleResources = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return resources.filter((item) => {
      const matchesPhase = phaseFilter === "all" || item.phase_slug === phaseFilter;
      const matchesPurpose = purposeFilter === "all" || item.purpose === purposeFilter;
      const matchesSearch = !query || `${item.title} ${item.description}`.toLocaleLowerCase("vi").includes(query);
      return matchesPhase && matchesPurpose && matchesSearch;
    });
  }, [resources, phaseFilter, purposeFilter, search]);

  const chooseFile = (next: File | null) => {
    setNotice("");
    if (!next) {
      setFile(null);
      return;
    }
    const extension = next.name.split(".").pop()?.toLowerCase() ?? "";
    if (!FILE_MIMES[extension]) {
      setNotice("Chỉ nhận PDF, DOCX, TXT hoặc Markdown.");
      setFile(null);
      return;
    }
    if (next.size > MAX_FILE_SIZE) {
      setNotice("Tệp vượt giới hạn 15 MB.");
      setFile(null);
      return;
    }
    setFile(next);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    if (!user) {
      setNotice("Đăng nhập để gửi tài liệu.");
      return;
    }
    if (title.trim().length < 5 || description.trim().length < 20) {
      setNotice("Tiêu đề cần từ 5 ký tự, phần mô tả cần ít nhất 20 ký tự.");
      return;
    }
    if (resourceType === "file" && !file) {
      setNotice("Chọn một tệp trước khi gửi.");
      return;
    }

    let normalizedUrl: string | null = null;
    if (resourceType === "link") {
      try {
        const parsed = new URL(sourceUrl.trim());
        if (parsed.protocol !== "https:") throw new Error("https only");
        normalizedUrl = parsed.toString();
      } catch {
        setNotice("Nhập một liên kết HTTPS hợp lệ.");
        return;
      }
    }

    setSaving(true);
    let filePath: string | null = null;
    try {
      const id = crypto.randomUUID();
      if (resourceType === "file" && file) {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        filePath = `${user.id}/${id}/${safeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("community-resources")
          .upload(filePath, file, { contentType: FILE_MIMES[extension], upsert: false });
        if (uploadError) throw uploadError;
      }

      const { error: insertError } = await supabase.from("community_resources").insert({
        id,
        title: title.trim(),
        purpose,
        phase_slug: phaseSlug,
        description: description.trim(),
        resource_type: resourceType,
        file_path: filePath,
        source_url: normalizedUrl,
        submitted_by: user.id,
        status: "pending",
      });
      if (insertError) throw insertError;

      setTitle("");
      setDescription("");
      setFile(null);
      setSourceUrl("");
      setNotice("Đã nhận tài liệu. Tài liệu sẽ xuất hiện trong kho sau khi được duyệt.");
      setTab("mine");
      await loadMine();
    } catch (submitError) {
      if (filePath) await supabase.storage.from("community-resources").remove([filePath]);
      const error = submitError as { code?: string; message?: string };
      setNotice(displayError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-shell materials-shell">
      <header className="page-heading materials-heading">
        <span className="eyebrow">KHO CHIA SẺ</span>
        <h1 className="page-title">Tài liệu học tập</h1>
        <p className="page-description">Gửi tài liệu đúng chủ đề. Nội dung được duyệt trước khi mọi người tải về.</p>
      </header>

      <div className="materials-tabs" role="tablist" aria-label="Tài liệu">
        <button type="button" role="tab" aria-selected={tab === "library"} className={tab === "library" ? "is-active" : ""} onClick={() => setTab("library")}>
          <BookOpenText size={16} aria-hidden="true" /> Kho tài liệu
        </button>
        <button type="button" role="tab" aria-selected={tab === "submit"} className={tab === "submit" ? "is-active" : ""} onClick={() => setTab("submit")}>
          <FilePlus2 size={16} aria-hidden="true" /> Gửi tài liệu
        </button>
        {user && (
          <button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "is-active" : ""} onClick={() => setTab("mine")}>
            <Clock3 size={16} aria-hidden="true" /> Bài đã gửi{mine.length ? ` · ${mine.length}` : ""}
          </button>
        )}
      </div>

      {notice && <p className="resource-alert" role="status">{notice}</p>}

      {tab === "library" && (
        <>
          <div className="materials-filters">
            <label className="materials-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Tìm tài liệu</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc nội dung" />
            </label>
            <label className="materials-select-label">
              <span className="sr-only">Lọc theo chặng</span>
              <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}>
                <option value="all">Tất cả chặng</option>
                {PHASES.map(([slug, label]) => <option key={slug} value={slug}>{label}</option>)}
              </select>
            </label>
          </div>
          <div className="materials-purpose-filters" aria-label="Lọc theo mục đích">
            <button type="button" className={purposeFilter === "all" ? "is-active" : ""} onClick={() => setPurposeFilter("all")}>Tất cả</button>
            {PURPOSES.map((item) => (
              <button type="button" key={item.id} className={purposeFilter === item.id ? "is-active" : ""} onClick={() => setPurposeFilter(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          {loadError ? (
            <div className="resource-empty-state resource-load-error" role="alert">
              <p>{loadError}</p>
              <button type="button" className="button-secondary" onClick={() => void loadPublished()}>Thử tải lại</button>
            </div>
          ) : loading ? (
            <p className="resource-empty-state">Đang tải tài liệu…</p>
          ) : visibleResources.length === 0 ? (
            <div className="resource-empty-state">
              <BookOpenText size={22} aria-hidden="true" />
              <p>{resources.length ? "Không có tài liệu khớp bộ lọc." : "Kho đang trống. Gửi tài liệu phù hợp để bắt đầu."}</p>
              <button type="button" className="button-primary" onClick={() => setTab("submit")}><FilePlus2 size={15} aria-hidden="true" /> Gửi tài liệu</button>
            </div>
          ) : (
            <div className="materials-grid">
              {visibleResources.map((item) => {
                const destination = item.download_url || item.source_url;
                return (
                  <article className="material-card" key={item.id}>
                    <div className="material-card-topline">
                      <span className="material-purpose-tag">{PURPOSE_LABELS[item.purpose]}</span>
                      <span className="material-date">{new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <h2>{item.title}</h2>
                    <p className="material-description">{item.description}</p>
                    <div className="material-card-footer">
                      <span>{PHASE_LABELS[item.phase_slug]}</span>
                      {destination ? (
                        <a href={destination} target="_blank" rel="noreferrer" download={item.resource_type === "file"}>
                          {item.resource_type === "file" ? "Tải tài liệu" : "Mở nguồn"}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      ) : <span className="material-link-expired">Liên kết tải đang lỗi</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "submit" && (
        <div className="resource-submit-layout">
          <form className="resource-submit-form" onSubmit={submit}>
            <div className="resource-form-heading">
              <span className="eyebrow">ĐÓNG GÓP</span>
              <h2>Gửi tài liệu vào kho</h2>
              <p>Ghi rõ ai sẽ dùng tài liệu này và họ nên dùng ở bước nào.</p>
            </div>
            {!user ? (
              <div className="resource-login-gate">
                <p>Đăng nhập bằng email để ghi nhận người gửi và xem trạng thái duyệt.</p>
                <AuthButton />
              </div>
            ) : (
              <>
                <label className="resource-field">
                  <span>Tiêu đề</span>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} minLength={5} required placeholder="Ví dụ: Java Collections — sơ đồ chọn cấu trúc dữ liệu" />
                </label>
                <div className="resource-field-row">
                  <label className="resource-field">
                    <span>Chặng phù hợp</span>
                    <select value={phaseSlug} onChange={(event) => setPhaseSlug(event.target.value)}>
                      {PHASES.map(([slug, label]) => <option key={slug} value={slug}>{label}</option>)}
                    </select>
                  </label>
                  <label className="resource-field">
                    <span>Mục đích</span>
                    <select value={purpose} onChange={(event) => setPurpose(event.target.value as ResourcePurpose)}>
                      {PURPOSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </label>
                </div>
                <p className="resource-purpose-help">{PURPOSES.find((item) => item.id === purpose)?.detail}</p>
                <label className="resource-field">
                  <span>Mô tả cách sử dụng</span>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1200} minLength={20} required rows={4} placeholder="Người học sẽ hiểu hoặc làm được gì? Nên đọc trước hay sau bài nào?" />
                </label>
                <fieldset className="resource-type-picker">
                  <legend>Loại tài liệu</legend>
                  <label><input type="radio" name="resource-type" checked={resourceType === "file"} onChange={() => setResourceType("file")} /> <Upload size={15} aria-hidden="true" /> Tải tệp lên</label>
                  <label><input type="radio" name="resource-type" checked={resourceType === "link"} onChange={() => setResourceType("link")} /> <Link2 size={15} aria-hidden="true" /> Gửi liên kết</label>
                </fieldset>
                {resourceType === "file" ? (
                  <label className="resource-file-picker">
                    <Upload size={18} aria-hidden="true" />
                    <span>{file ? file.name : "Chọn PDF, DOCX, TXT hoặc Markdown"}</span>
                    <small>Tối đa 15 MB</small>
                    <input type="file" accept=".pdf,.docx,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
                  </label>
                ) : (
                  <label className="resource-field">
                    <span>Liên kết HTTPS</span>
                    <input type="url" inputMode="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} required placeholder="https://…" />
                  </label>
                )}
                <label className="resource-share-confirm">
                  <input type="checkbox" required />
                  <span>Tôi có quyền chia sẻ tài liệu này và đã loại bỏ khóa, mật khẩu hoặc dữ liệu cá nhân.</span>
                </label>
                <button type="submit" className="button-primary resource-submit-button" disabled={saving}>
                  <Upload size={16} aria-hidden="true" /> {saving ? "Đang gửi…" : "Gửi để duyệt"}
                </button>
                <p className="resource-private-note"><Check size={14} aria-hidden="true" /> Tệp chỉ được công khai sau khi quản trị viên duyệt.</p>
              </>
            )}
          </form>
          <aside className="resource-guidelines">
            <span className="eyebrow">TRƯỚC KHI GỬI</span>
            <h2>Một tài liệu hữu ích cần có</h2>
            <ul>
              <li><Check size={15} aria-hidden="true" /><span>Chặng học và mục đích rõ ràng.</span></li>
              <li><Check size={15} aria-hidden="true" /><span>Mô tả ngắn nói tài liệu giúp giải quyết việc gì.</span></li>
              <li><Check size={15} aria-hidden="true" /><span>Nguồn có quyền truy cập và được phép chia sẻ.</span></li>
              <li><Check size={15} aria-hidden="true" /><span>Không chứa secret, thông tin riêng tư hay mã độc.</span></li>
            </ul>
            <Link href="/roadmap">Xem các chặng học <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </aside>
        </div>
      )}

      {tab === "mine" && user && (
        <div className="resource-own-submissions">
          <div className="resource-list-heading">
            <div><span className="eyebrow">THEO DÕI</span><h2>Tài liệu bạn đã gửi</h2></div>
            <button type="button" className="button-secondary" onClick={() => void loadMine()} disabled={myLoading}>Làm mới</button>
          </div>
          {myLoading ? <p className="resource-empty-state">Đang tải…</p> : mine.length === 0 ? (
            <div className="resource-empty-state"><p>Bạn chưa gửi tài liệu nào.</p><button type="button" className="button-primary" onClick={() => setTab("submit")}>Gửi tài liệu</button></div>
          ) : (
            <div className="resource-own-list">
              {mine.map((item) => (
                <article className="resource-own-row" key={item.id}>
                  <div><span>{PHASE_LABELS[item.phase_slug]} · {PURPOSE_LABELS[item.purpose]}</span><h3>{item.title}</h3>{item.moderation_note && <p>{item.moderation_note}</p>}</div>
                  <strong className={`resource-status resource-status-${item.status}`}>
                    {item.status === "pending" ? <><Clock3 size={14} /> Chờ duyệt</> : item.status === "approved" ? <><Check size={14} /> Đã đăng</> : "Cần chỉnh sửa"}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

