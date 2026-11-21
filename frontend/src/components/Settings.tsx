import { useState } from "react";
import { getToken } from "../api";
import { disableNotif, enableNotif, notifOn } from "../lib/notify";
import { Lang, useI18n } from "../lib/i18n";
import { PLACES, Profile, saveProfile } from "../lib/profile";
import { ThemePref, useTheme } from "../lib/theme";
import Icon from "./Icon";
import { Sheet } from "./Sheets";
import { showFeedback } from "../lib/feedback";

interface Props { online: boolean; pending: number; profile: Profile | null; onProfile: (p: Profile | null) => void; onSync: () => Promise<void>; onLogout: () => void; onClose: () => void }

export default function Settings({ online, pending, profile, onProfile, onSync, onLogout, onClose }: Props) {
  const { t, lang, setLang } = useI18n();
  const [theme, setTheme] = useTheme();
  const [field, setField] = useState(localStorage.getItem("pf_field") === "1");
  const [alerts, setAlerts] = useState(notifOn());
  const [loc, setLoc] = useState(profile?.loc ?? Object.keys(PLACES)[0]);
  const [msg, setMsg] = useState("");
  const authenticated = !!getToken();
  let user: { name: string; email: string } | null = null;
  try { user = JSON.parse(localStorage.getItem("pf_user") || "null"); } catch { /* sem usuário */ }
  const last = Number(localStorage.getItem("pf_last_sync") || 0);

  const toggleField = () => { const v = !field; setField(v); localStorage.setItem("pf_field", v ? "1" : "0"); document.documentElement.classList.toggle("field", v); };
  const toggleAlerts = async () => {
    if (alerts) { disableNotif(); setAlerts(false); return; }
    const ok = await enableNotif(t("notif.title"), t("notif.body"));
    setAlerts(ok); if (!ok) setMsg(t("set.denied"));
  };
  const save = () => { const [lat, lon] = PLACES[loc]; const p = { loc, lat, lon }; saveProfile(p); onProfile(p); setMsg(t("set.saved")); showFeedback(t("set.saved"), "success"); };
  const sync = async () => {
    if (!online) { setMsg(t("set.nooff")); return; }
    if (!authenticated) { setMsg(t("set.login")); return; }
    try { await onSync(); setMsg(t("set.synced")); showFeedback("Registros publicados com sucesso.", "success"); } catch { setMsg(t("set.login")); showFeedback(t("set.login"), "error"); }
  };
  const Switch = ({ on, fn }: { on: boolean; fn: () => void }) => <button className={`switch ${on ? "on" : ""}`} role="switch" aria-checked={on} onClick={fn}><span /></button>;

  return (
    <Sheet title={t("set.title")} onClose={onClose} className="profile-menu" overlayClassName="profile-overlay">
      <h3 className="eyebrow">{t("set.account")}</h3>
      <div className="box between">
        <div><b>{user?.name ?? t("set.guest")}</b>{user && <p className="mute">{user.email}</p>}</div>
        <button className="ghost" onClick={onLogout}>{user ? t("set.logout") : t("au.login")}</button>
      </div>
      <h3 className="eyebrow">{t("home.profile")}</h3>
      <div className="box stack">
        <select value={loc} onChange={e => setLoc(e.target.value)}>{Object.keys(PLACES).map(k => <option key={k}>{k}</option>)}</select>
        <button className="primary" onClick={save}>{t("set.save")}</button>
      </div>
      <h3 className="eyebrow">{t("set.conn")}</h3>
      <div className="box stack">
        <div className="between"><b><span className={`dot ${online ? "on" : "off"}`} /> {online ? t("set.online") : t("set.offline")}</b><span>{t("set.pending")}: <b>{pending}</b></span></div>
        {online && !authenticated && pending > 0 && <small className="mute">Entre na sua conta para enviar os registros pendentes.</small>}
        <small>{t("set.last")}: {last ? new Date(last).toLocaleTimeString(lang === "pt" ? "pt-BR" : lang, { hour: "2-digit", minute: "2-digit" }) : t("set.never")}</small>
        <button className="primary" onClick={sync}><Icon name="refresh" /> {t("set.sync")}</button>
      </div>
      <h3 className="eyebrow">{t("set.pref")}</h3>
      <div className="box stack">
        <div><small>{t("set.lang")}</small><div className="seg">{(["pt", "en", "es"] as Lang[]).map(l => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div></div>
        <div className="seg">{(["light", "dark", "system"] as ThemePref[]).map(k => <button key={k} className={theme === k ? "on" : ""} onClick={() => setTheme(k)}>{t(`set.${k}`)}</button>)}</div>
        <div className="between"><span>{t("set.field")}</span><Switch on={field} fn={toggleField} /></div>
        <div className="between"><span>{t("set.alerts")}</span><Switch on={alerts} fn={toggleAlerts} /></div>
      </div>
      {msg && <small className="msg">{msg}</small>}
    </Sheet>
  );
}
