import fs from "fs";
import path from "path";

// Đọc file markdown từ public/content/
export function readMarkdown(relativePath: string): string {
  const fullPath = path.join(process.cwd(), "public", "content", relativePath);
  if (!fs.existsSync(fullPath)) return "";
  return fs.readFileSync(fullPath, "utf-8");
}

// Lấy danh sách phase có trong public/content/
export function getPhases(): string[] {
  const dir = path.join(process.cwd(), "public", "content");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => {
    return fs.statSync(path.join(dir, f)).isDirectory();
  });
}
