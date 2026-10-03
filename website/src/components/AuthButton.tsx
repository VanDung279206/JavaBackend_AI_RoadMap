"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type AuthMode = "signIn" | "signUp" | "reset";
type AuthFeedback = { kind: "error" | "success"; message: string };

function getAuthCallbackUrl() {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/JavaBackend_AI_RoadMap").replace(/\/$/, "");
  return new URL(`${basePath}/auth/callback`, window.location.origin).toString();
}

function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (/invalid login credentials/i.test(message)) return "Email hoặc mật khẩu chưa đúng.";
  if (/email not confirmed/i.test(message)) return "Hãy xác nhận email trước khi đăng nhập.";
  if (/already registered|user already exists/i.test(message)) return "Email này đã có tài khoản. Hãy chuyển sang Đăng nhập.";
  if (/password.*(6 characters|at least|short)/i.test(message)) return "Mật khẩu cần có ít nhất 6 ký tự.";

  return "Chưa thể đăng nhập. Kiểm tra thông tin rồi thử lại.";
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fieldId = useId();
  const emailInputId = `${fieldId}-email`;
  const passwordInputId = `${fieldId}-password`;
  const dialogTitleId = `${fieldId}-title`;

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (dialogOpen && !dialog.open) dialog.showModal();
    if (!dialogOpen && dialog.open) dialog.close();
  }, [dialogOpen]);

  const closeDialog = () => {
    setDialogOpen(false);
    setFeedback(null);
    setPassword("");
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      if (mode === "reset") {
        const redirectTo=getAuthCallbackUrl().replace(/callback$/, "reset");
        const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo});
        if(error)throw error;
        setFeedback({kind:"success",message:"Nếu email có tài khoản, bạn sẽ nhận liên kết đặt lại mật khẩu."});
      } else if (mode === "signIn") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setUser(data.user);
        closeDialog();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: getAuthCallbackUrl() },
        });
        if (error) throw error;

        if (data.session && data.user) {
          setUser(data.user);
          closeDialog();
        } else {
          setFeedback({
            kind: "success",
            message: "Đã gửi email xác nhận. Mở thư trong hộp thư đến để hoàn tất đăng ký.",
          });
        }
      }
    } catch (error) {
      setFeedback({ kind: "error", message: getAuthErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div aria-hidden="true" style={{ width: 76, height: 32, borderRadius: 6, background: "var(--muted)" }} />
    );
  }

  if (user) {
    const avatar = user.user_metadata?.avatar_url;
    const username = user.user_metadata?.user_name || user.user_metadata?.display_name || user.email || "Tài khoản";

    return (
      <div className="auth-user">
        {avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={username} width={32} height={32} />
        )}
        <span className="auth-user-name" title={username}>
          {username}
        </span>
        <button onClick={logout} className="auth-logout" type="button">
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setMode("signIn");
          setFeedback(null);
          setDialogOpen(true);
        }}
        className="auth-button"
        type="button"
      >
        Đăng nhập
      </button>

      <dialog
        ref={dialogRef}
        className="auth-dialog"
        aria-labelledby={dialogTitleId}
        onCancel={closeDialog}
        onClose={() => setDialogOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <div className="auth-dialog-content">
          <div className="auth-dialog-heading">
            <div>
              <span className="eyebrow">TÀI KHOẢN</span>
              <h2 id={dialogTitleId}>{mode === "reset" ? "Quên mật khẩu" : mode === "signIn" ? "Đăng nhập" : "Tạo tài khoản"}</h2>
            </div>
            <button className="auth-dialog-close" type="button" onClick={closeDialog} aria-label="Đóng">
              ×
            </button>
          </div>

          <p className="auth-dialog-description">Dùng email để lưu tiến độ học trên các thiết bị.</p>

          <form className="auth-dialog-form" onSubmit={submitAuth}>
            <label className="auth-dialog-field" htmlFor={emailInputId}>
              Email
              <input
                id={emailInputId}
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
              />
            </label>
            {mode!=="reset" && <label className="auth-dialog-field" htmlFor={passwordInputId}>
              Mật khẩu
              <input
                id={passwordInputId}
                type="password"
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                minLength={mode === "signUp" ? 6 : undefined}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={submitting}
              />
            </label>

            }
            {feedback && (
              <p
                className={`auth-dialog-feedback auth-dialog-feedback-${feedback.kind}`}
                role={feedback.kind === "error" ? "alert" : "status"}
              >
                {feedback.message}
              </p>
            )}

            <button className="button-primary auth-dialog-submit" type="submit" disabled={submitting}>
              {submitting ? "Đang xử lý…" : mode === "reset" ? "Gửi liên kết" : mode === "signIn" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>

          <button type="button" onClick={()=>{setMode("reset");setFeedback(null);}}>Quên mật khẩu?</button>
          <p className="auth-dialog-switch">
            {mode === "signIn" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode((current) => current === "signIn" ? "signUp" : "signIn");
                setFeedback(null);
              }}
              disabled={submitting}
            >
              {mode === "signIn" ? "Đăng ký" : "Đăng nhập"}
            </button>
          </p>
        </div>
      </dialog>
    </>
  );
}
