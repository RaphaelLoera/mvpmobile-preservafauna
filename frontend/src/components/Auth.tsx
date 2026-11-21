import { FormEvent, useState } from "react";
import { api, setToken } from "../api";
import { Lang, useI18n } from "../lib/i18n";
import Icon from "./Icon";

interface Resp { token: string; user: { name: string; email: string } }

export default function Auth({ onDone }: { onDone: (message: string) => void }) {
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const reg = mode === "register";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim(), password = String(f.get("password")), name = String(f.get("name") ?? "").trim();
    const errors: Record<string, string> = {};
    if (reg && name.length < 2) errors.name = "Informe seu nome.";
    if (!email) errors.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido.";
    if (!password) errors.password = "Informe sua senha.";
    else if (reg && (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password))) errors.password = t("au.passwordRule");
    if (reg && password !== String(f.get("password2"))) errors.password2 = t("au.mismatch");
    setFieldErrors(errors);
    if (Object.keys(errors).length) return setErr("Confira os campos destacados.");
    setBusy(true); setErr("");
    try {
      const r = await api<Resp>(reg ? "/auth/register" : "/auth/login", { method: "POST", body: JSON.stringify(reg ? { name, email, password } : { email, password }) });
      setToken(r.token);
      localStorage.setItem("pf_user", JSON.stringify(r.user));
      localStorage.removeItem("pf_guest");
      onDone(reg ? "Conta criada com sucesso." : "Usuário logado com sucesso.");
    } catch (x) {
      const m = String((x as Error).message);
      const message = m.includes("401") ? t("au.invalid") : m.includes("409") ? t("au.exists") : m.includes("400") ? t("au.check") : t("au.server");
      setErr(message);
      if (m.includes("401")) setFieldErrors({ email: t("au.invalid"), password: t("au.invalid") });
    } finally { setBusy(false); }
  }
  const guest = () => { localStorage.setItem("pf_guest", "1"); localStorage.removeItem("pf_user"); onDone("Modo visitante ativado."); };
  const pw = show ? "text" : "password";

  return (
    <div className="auth">
      <div className="auth-top">
        <div className="seg langs">{(["pt", "en", "es"] as Lang[]).map(l => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
        <div className="auth-brand"><div className="splash-logo sm"><Icon name="paw" size={26} /></div><div><h1>Preserva Fauna</h1><p>{t("au.sub")}</p></div></div>
      </div>
      <div className="auth-card box stack">
        <div className="seg">
          <button className={!reg ? "on" : ""} onClick={() => { setMode("login"); setErr(""); }}>{t("au.login")}</button>
          <button className={reg ? "on" : ""} onClick={() => { setMode("register"); setErr(""); }}>{t("au.register")}</button>
        </div>
        <form onSubmit={submit} className="stack" noValidate>
          {reg && <label>{t("au.name")}<input name="name" autoComplete="name" aria-invalid={!!fieldErrors.name} />{fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}</label>}
          <label>{t("au.email")}<input name="email" type="email" autoComplete="email" aria-invalid={!!fieldErrors.email} />{fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}</label>
          <label>{t("au.pass")}<input name="password" type={pw} autoComplete={reg ? "new-password" : "current-password"} aria-invalid={!!fieldErrors.password} />{reg && <small className="field-hint">Mínimo de 8 caracteres, com uma letra minúscula e uma maiúscula.</small>}{fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}</label>
          {reg && <label>{t("au.pass2")}<input name="password2" type={pw} autoComplete="new-password" aria-invalid={!!fieldErrors.password2} />{fieldErrors.password2 && <small className="field-error">{fieldErrors.password2}</small>}</label>}
          <label className="check"><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> {t("au.show")}</label>
          {err && <div className="form-alert error" role="alert">{err}</div>}
          <button type="submit" disabled={busy}>{busy ? (reg ? "Criando conta..." : "Entrando..." ) : (reg ? t("au.register") : t("au.login"))}</button>
        </form>
        <button className="link" onClick={guest}>{t("au.guest")}</button>
      </div>
      <small className="auth-note">{t("au.note")}</small>
    </div>
  );
}
