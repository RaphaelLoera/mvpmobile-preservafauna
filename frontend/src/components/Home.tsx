import { useEffect, useState } from "react";
import { api, getToken } from "../api";
import { MAP_PINS, Pin } from "../data/pins";
import { db, Incident } from "../db";
import { useI18n } from "../lib/i18n";
import { notifyNear } from "../lib/notify";
import { Profile } from "../lib/profile";
import Icon, { IconName } from "./Icon";
import { CHECK_ITEMS, ChecklistSheet, ContactsSheet, TracksSheet } from "./Sheets";

const R = Math.PI / 180;
const km = (a: { la: number; lo: number }, b: { la: number; lo: number }) => {
  const dl = (b.la - a.la) * R, dn = (b.lo - a.lo) * R;
  const x = Math.sin(dl / 2) ** 2 + Math.cos(a.la * R) * Math.cos(b.la * R) * Math.sin(dn / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};
const loadChecked = (): number[] => { try { return JSON.parse(localStorage.getItem("pf_check") || "[]"); } catch { return []; } };

interface Props { profile: Profile | null; onProfile: () => void; onReport: () => void; onMap: () => void }

export default function Home({ profile, onProfile, onReport, onMap }: Props) {
  const { t } = useI18n();
  const [near, setNear] = useState<number | null>(null);
  const [checked, setChecked] = useState<number[]>(loadChecked);
  const [recent, setRecent] = useState<Incident[]>([]);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  let userName = "";
  try { userName = JSON.parse(localStorage.getItem("pf_user") || "null")?.name ?? ""; } catch { /* visitante */ }
  const [sheet, setSheet] = useState<"check" | "tracks" | "contacts" | null>(null);

  useEffect(() => {
    const loadRecent = async () => {
      const incidents = await db.incidents.orderBy("occurredAt").reverse().limit(3).toArray();
      const pending = new Set((await db.outbox.bulkGet(incidents.map(incident => incident.id))).filter(Boolean).map(incident => incident!.id));
      setRecent(incidents);
      setPendingIds(pending);
    };
    const refresh = () => { loadRecent().catch(() => {}); };
    window.addEventListener("pf:incident-saved", refresh);
    window.addEventListener("pf:incident-synced", refresh);
    window.addEventListener("focus", refresh);
    refresh();
    return () => {
      window.removeEventListener("pf:incident-saved", refresh);
      window.removeEventListener("pf:incident-synced", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    if (!profile) { setNear(null); return; }
    const me = { la: profile.lat, lo: profile.lon };
    let custom: Pin[] = [];
    try { custom = JSON.parse(localStorage.getItem("pf_pins") || "[]"); } catch { /* vazio */ }
    const local = [...MAP_PINS, ...custom].filter(p => p.type === "conflict" && km(me, p) <= 5).length;
    setNear(local);
    api<{ id: string }[]>(`/alerts?lat=${profile.lat}&lon=${profile.lon}&km=5`)
      .then(r => { const own = new Set(custom.map(c => c.id)); setNear(local + r.filter(x => !own.has(`c-${x.id}`)).length); })
      .catch(() => {});
  }, [profile]);
  useEffect(() => { if (near) notifyNear(near, t("notif.title"), t("notif.body")); }, [near]);

  const toggle = (i: number) => setChecked(c => {
    const n = c.includes(i) ? c.filter(x => x !== i) : [...c, i];
    localStorage.setItem("pf_check", JSON.stringify(n)); return n;
  });
  const pct = Math.round((checked.length / CHECK_ITEMS.length) * 100);
  const msg = near === null ? t("home.none") : near > 0 ? `${near} ${t("home.near")}` : t("home.clear");
  const shortcuts: [IconName, string, () => void][] = [
    ["user", t("home.profile"), onProfile], ["paw", t("home.tracks"), () => setSheet("tracks")],
    ["pinPlus", t("home.contacts"), () => setSheet("contacts")]
  ];

  return (
    <div className="home">
      <section className="banner">
        <p className="eyebrow light">{userName ? `${userName} • ` : ""}Serra dos Órgãos • Teresópolis</p>
        <p className="banner-msg">{msg}</p>
        <svg viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,110 L0,72 L40,52 L80,64 L118,34 L130,14 L138,42 L152,36 L190,60 L232,42 L272,68 L322,46 L362,62 L400,50 L400,110Z" fill="#fff" opacity=".14" />
          <path d="M0,110 L0,90 L60,74 L110,86 L170,68 L240,88 L300,72 L360,86 L400,78 L400,110Z" fill="#0F2A1F" opacity=".75" />
        </svg>
      </section>
      <section className="home-intro box">
        <div>
          <h2>Convivência segura na Serra</h2>
          <p>Monitore avistamentos e proteja sua criação rural em Teresópolis.</p>
        </div>
        <button className="primary" onClick={onReport}><Icon name="edit" size={16} /> Registrar ocorrência</button>
      </section>
      <section className="alert-wrap">
        <div className="section-heading"><p className="eyebrow">Alerta recente</p><button className="link">Ver todos</button></div>
        <article className="alert-card box">
          <div className="between"><small><span className="alert-dot" /> Atenção na região • há 3 horas</small><small>Setor Norte (4,2 km)</small></div>
          <h3>Pegadas de Onça-parda no Vale de Bonsucesso</h3>
          <p>Pegadas frescas vistas próximas ao córrego. Recolha ovelhas e bezerros em abrigo fechado antes das 18h.</p>
          <div className="between alert-actions"><button className="link" onClick={() => setSheet("tracks")}>◖ Ouvir</button><button className="link" onClick={onMap}>Ver no mapa →</button></div>
        </article>
      </section>
      <section className="quick-section">
        <p className="eyebrow">Acesso rápido</p>
        <div className="quick-actions">
          <button className="box quick-action" onClick={() => setSheet("tracks")}><Icon name="paw" size={20} />Felinos</button>
          <button className="box quick-action" onClick={() => setSheet("check")}><Icon name="shield" size={20} />Prevenção</button>
          <button className="box quick-action" onClick={() => setSheet("contacts")}><Icon name="user" size={20} />Especialista</button>
        </div>
      </section>
      <section className="recent-wrap">
        <div className="section-heading"><p className="eyebrow">Seus registros recentes</p><small>Salvos neste aparelho</small></div>
        {recent.length ? recent.map(incident => (
          <article className="recent-card box" key={incident.id}>
            <div className="recent-item">
              <Icon name="paw" size={18} />
              <div><b>{incident.predator}</b><small>{incident.locality} • {new Date(incident.occurredAt).toLocaleDateString("pt-BR")}</small></div>
              <span>{pendingIds.has(incident.id) ? (getToken() ? "Pendente" : "Aguardando login") : "Publicado"}</span>
            </div>
          </article>
        )) : <article className="recent-card box"><small>Nenhuma ocorrência registrada ainda.</small></article>}
      </section>
      <section className="box protection">
        <div className="between"><b>{t("home.protection")}</b><b className="brand">{pct}%</b></div>
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        <button className="link" onClick={() => setSheet("check")}>{t("home.open")} →</button>
        <div className="shortcuts">
          {shortcuts.map(([icon, label, fn]) => <button key={label} className="shortcut" onClick={fn}><Icon name={icon} size={20} />{label}</button>)}
        </div>
      </section>
      {sheet === "check" && <ChecklistSheet checked={checked} onToggle={toggle} onClose={() => setSheet(null)} />}
      {sheet === "tracks" && <TracksSheet onClose={() => setSheet(null)} />}
      {sheet === "contacts" && <ContactsSheet onClose={() => setSheet(null)} />}
    </div>
  );
}
