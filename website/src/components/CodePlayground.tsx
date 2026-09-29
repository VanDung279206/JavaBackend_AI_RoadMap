"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, RotateCcw, SquareTerminal } from "lucide-react";
import type { PlaygroundSeed } from "@/lib/playground-seeds";

type Props = {
  exerciseId: string;
  seed: PlaygroundSeed;
};

type EditorFile = { name: string; content: string };
type EditorMessage = { language?: string; files?: EditorFile[] };

const EDITOR_ORIGIN = "https://onecompiler.com";

function toEditorFiles(files: unknown): EditorFile[] | null {
  if (!Array.isArray(files) || files.length === 0 || files.length > 12) return null;
  const valid = files.filter((file): file is EditorFile =>
    typeof file === "object" && file !== null &&
    "name" in file && typeof file.name === "string" &&
    "content" in file && typeof file.content === "string" &&
    file.name.length <= 160 && file.content.length <= 120_000,
  );
  return valid.length === files.length ? valid : null;
}

export default function CodePlayground({ exerciseId, seed }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const seedRef = useRef(seed);
  const [ready, setReady] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [message, setMessage] = useState("Đang mở trình chạy…");
  const storageKey = `roadmap-code-${exerciseId}`;
  const [files, setFiles] = useState<EditorFile[]>([{ name: seed.filename, content: seed.code }]);

  const src = useMemo(() => {
    const query = new URLSearchParams({
      listenToEvents: "true",
      codeChangeEvent: "true",
      hideLanguageSelection: "true",
      hideNew: "true",
      hideTitle: "true",
      hideEditorOptions: "true",
      fontSize: "14",
    });
    return `${EDITOR_ORIGIN}/embed/${seed.language}?${query.toString()}`;
  }, [seed.language]);

  const sendFiles = useCallback((files: EditorFile[]) => {
    frameRef.current?.contentWindow?.postMessage(
      { eventType: "populateCode", language: seed.language, files },
      EDITOR_ORIGIN,
    );
  }, [seed.language]);

  const loadEditor = useCallback(() => {
    let files = [{ name: seedRef.current.filename, content: seedRef.current.code }];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as EditorMessage;
        const restored = toEditorFiles(parsed.files);
        if (parsed.language === seedRef.current.language && restored) {
          files = restored;
          setFiles(restored);
          setHasDraft(true);
          setMessage("Đã khôi phục bản nháp");
        } else {
          localStorage.removeItem(storageKey);
          setMessage("Trình chạy sẵn sàng");
        }
      } else {
        setMessage("Trình chạy sẵn sàng");
      }
    } catch {
      setMessage("Trình chạy sẵn sàng");
    }
    window.setTimeout(() => sendFiles(files), 180);
  }, [sendFiles, storageKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<EditorMessage>) => {
      if (event.origin !== EDITOR_ORIGIN || event.source !== frameRef.current?.contentWindow) return;
      const data = event.data;
      const files = toEditorFiles(data?.files);
      if (!data || data.language !== seed.language || !files) return;
      setFiles(files);
      try {
        localStorage.setItem(storageKey, JSON.stringify({ language: data.language, files }));
        setHasDraft(true);
        setMessage("Bản nháp đã lưu trên thiết bị này");
      } catch {
        setMessage("Không thể lưu bản nháp trên thiết bị này");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [seed.language, storageKey]);

  const reset = () => {
    try { localStorage.removeItem(storageKey); } catch { /* Storage can be disabled by the browser. */ }
    setHasDraft(false);
    const initialFiles = [{ name: seed.filename, content: seed.code }];
    setFiles(initialFiles);
    setMessage("Đã nạp lại mã mẫu");
    sendFiles(initialFiles);
  };

  const download = () => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(new Blob([file.content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="code-playground" aria-labelledby={`runner-${exerciseId}`}>
      <header className="code-playground-header">
        <div className="code-playground-title">
          <SquareTerminal size={18} aria-hidden="true" />
          <div>
            <h3 id={`runner-${exerciseId}`}>Chạy {seed.filename}</h3>
            <p>{seed.language === "java" ? "Java · một file" : "PostgreSQL · dữ liệu mẫu"}</p>
          </div>
        </div>
        <div className="code-playground-actions">
          <span className="code-playground-status" role="status">{message}</span>
          <button type="button" className="code-reset-button" onClick={reset} title="Nạp lại mã mẫu" disabled={!ready}>
            <RotateCcw size={14} aria-hidden="true" />
            <span>{hasDraft ? "Nạp lại mã mẫu" : "Mã mẫu"}</span>
          </button>
          <button type="button" className="code-reset-button" onClick={download} title="Tải file đang sửa" disabled={!ready}>
            <Download size={14} aria-hidden="true" />
            <span>Tải file</span>
          </button>
        </div>
      </header>
      <iframe
        ref={frameRef}
        className="code-playground-frame"
        src={src}
        title={`Trình chạy ${seed.language} cho ${exerciseId}`}
        loading="lazy"
        allow="clipboard-read; clipboard-write"
        onLoad={() => { setReady(true); loadEditor(); }}
      />
      <p className="code-playground-note">
        Bản nháp được lưu trên trình duyệt này. Khi bấm Run, mã được gửi tới OneCompiler để biên dịch và chạy.
      </p>
      {!ready && <span className="sr-only">Đang tải trình chạy</span>}
    </section>
  );
}
