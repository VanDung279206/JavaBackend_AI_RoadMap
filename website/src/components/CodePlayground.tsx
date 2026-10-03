"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, RotateCcw, SquareTerminal } from "lucide-react";
import {useLearning} from "@/lib/learning-store";
import type { PlaygroundSeed } from "@/lib/playground-seeds";

type Props = {
  exerciseId: string;
  seed: PlaygroundSeed;
};

type EditorFile = { name: string; content: string };
type EditorMessage = { language?: string; files?: EditorFile[] };

const EDITOR_ORIGIN = "https://onecompiler.com";
const JAVA_SNIPPETS: Record<string, string> = {
  classa: "public class Main {\n    \n}",
  maina: "public static void main(String args[]) {\n    \n}",
  sout: "System.out.println();",
};

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

function expandJavaSnippet(files: EditorFile[]): EditorFile[] | null {
  const source = files[0];
  if (!source) return null;

  const lines = source.content.split(/\r?\n/);
  const lineIndex = lines.findIndex((line) => Object.hasOwn(JAVA_SNIPPETS, line.trim()));
  if (lineIndex < 0) return null;

  const line = lines[lineIndex];
  const indentation = line.match(/^[\t ]*/)?.[0] ?? "";
  const snippet = JAVA_SNIPPETS[line.trim()];
  const lineEnding = source.content.includes("\r\n") ? "\r\n" : "\n";
  lines.splice(lineIndex, 1, ...snippet.split("\n").map((part) => `${indentation}${part}`));

  return files.map((file, index) => index === 0
    ? { ...file, content: lines.join(lineEnding) }
    : file,
  );
}

export default function CodePlayground(props:Props) {
 const {owner}=useLearning();
 if(owner===undefined)return <p>Đang xác định tài khoản cho bản nháp…</p>;
 return <ScopedPlayground key={owner||'guest'} {...props} owner={owner}/>;
}
function ScopedPlayground({ exerciseId, seed, owner }: Props & {owner:string|null}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const storageBlocked = useRef(false);
  const seedRef = useRef(seed);
  const [ready, setReady] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [message, setMessage] = useState("Đang mở trình chạy…");
  const storageKey = `roadmap-code-v3-${owner||"guest"}-${exerciseId}`;
  const [files, setFiles] = useState<EditorFile[]>([{ name: seed.filename, content: "" }]);
  const hasCode = files.some((file) => file.content.trim().length > 0);

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
    let files = [{ name: seedRef.current.filename, content: "" }];
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
          storageBlocked.current = true;
          setMessage("Bản nháp không hợp lệ; đã khóa ghi để giữ dữ liệu cũ");
        }
      } else {
        setMessage("Trình chạy sẵn sàng");
      }
    } catch {
      storageBlocked.current = true;
      setMessage("Không đọc được bản nháp; chưa thể lưu thay đổi");
    }
    window.setTimeout(() => sendFiles(files), 180);
  }, [sendFiles, storageKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<EditorMessage>) => {
      if (event.origin !== EDITOR_ORIGIN || event.source !== frameRef.current?.contentWindow) return;
      const data = event.data;
      const files = toEditorFiles(data?.files);
      if (!data || data.language !== seed.language || !files) return;
      const nextFiles = data.language === "java" ? expandJavaSnippet(files) ?? files : files;
      if (nextFiles !== files) sendFiles(nextFiles);
      setFiles(nextFiles);
      if (storageBlocked.current) return;
      try {
        if (nextFiles.some((file) => file.content.trim().length > 0)) {
          localStorage.setItem(storageKey, JSON.stringify({ language: data.language, files: nextFiles }));
          setHasDraft(true);
          setMessage("Bản nháp đã lưu trên thiết bị này");
        } else {
          localStorage.removeItem(storageKey);
          setHasDraft(false);
          setMessage("Trình chạy sẵn sàng");
        }
      } catch {
        setMessage("Không thể lưu bản nháp trên thiết bị này");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [seed.language, sendFiles, storageKey]);

  const reset = () => {
    try { localStorage.removeItem(storageKey); } catch { setMessage("Không xóa được bản nháp trên thiết bị"); return; }
    storageBlocked.current = false;
    setHasDraft(false);
    const initialFiles = [{ name: seed.filename, content: "" }];
    setFiles(initialFiles);
    setMessage("Đã xóa mã");
    sendFiles(initialFiles);
  };

  const importLegacy = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(`roadmap-code-v2-${exerciseId}`) || 'null') as EditorMessage | null;
      const restored = toEditorFiles(parsed?.files);
      if (!restored || parsed?.language !== seed.language) { setMessage("Không có bản nháp v2 hợp lệ cho bài này"); return; }
      if (hasCode || localStorage.getItem(storageKey)) { setMessage("Hãy tải và xử lý bản nháp hiện tại trước khi nhập bản cũ"); return; }
      localStorage.setItem(storageKey, JSON.stringify(parsed));
      setFiles(restored);setHasDraft(true);sendFiles(restored);
      setMessage("Đã sao chép bản nháp v2 vào khách; giữ nguyên bản gốc");
    } catch { setMessage("Không nhập được bản nháp cũ; dữ liệu gốc được giữ nguyên"); }
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
            <p>{seed.language === "java" ? "Java · một file" : "PostgreSQL · một file"}</p>
          </div>
        </div>
        <div className="code-playground-actions">
          {owner === null && <button type="button" className="code-reset-button" disabled={!ready || hasCode} onClick={importLegacy}>Nhập bản nháp v2</button>}
          <span className="code-playground-status" role="status">{message}</span>
          <button type="button" className="code-reset-button" onClick={reset} title="Xóa mã để bắt đầu lại" disabled={!ready || !hasCode}>
            <RotateCcw size={14} aria-hidden="true" />
            <span>{hasDraft ? "Xóa bản nháp" : "Xóa mã"}</span>
          </button>
          <button type="button" className="code-reset-button" onClick={download} title="Tải file đang sửa" disabled={!ready || !hasCode}>
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
      <div className="code-playground-note">
        {seed.language === "java" && (
          <p className="code-playground-hint">
            <strong>Gợi ý Java:</strong> gõ <kbd>classa</kbd> để tạo lớp, <kbd>maina</kbd> để tạo hàm main, hoặc <kbd>sout</kbd> để chèn lệnh in.
          </p>
        )}
        <p>Trình soạn thảo bắt đầu trống. Bản nháp lưu trên trình duyệt này; khi bấm Run, mã được gửi tới OneCompiler để chạy.</p>
      </div>
      {!ready && <span className="sr-only">Đang tải trình chạy</span>}
    </section>
  );
}
