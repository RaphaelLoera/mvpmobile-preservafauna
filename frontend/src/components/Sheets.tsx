import { ReactNode } from "react";
import { useI18n } from "../lib/i18n";
import Icon from "./Icon";

export function Sheet({ title, onClose, children, className = "", overlayClassName = "" }: { title: string; onClose: () => void; children: ReactNode; className?: string; overlayClassName?: string }) {
  return (
    <div className={`overlay ${overlayClassName}`} onClick={onClose}>
      <div className={`sheet ${className}`} onClick={e => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="sheet-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="×"><Icon name="x" /></button></div>
        <div className="stack" style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

export const CHECK_ITEMS = [1, 2, 3, 4, 5, 6];

export function ChecklistSheet({ checked, onToggle, onClose }: { checked: number[]; onToggle: (i: number) => void; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Sheet title={t("home.protection")} onClose={onClose}>
      <small>{t("chk.hint")}</small>
      {CHECK_ITEMS.map(i => (
        <label key={i} className="check"><input type="checkbox" checked={checked.includes(i)} onChange={() => onToggle(i)} /> {t(`chk.${i}`)}</label>
      ))}
    </Sheet>
  );
}

export function TracksSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Sheet title={t("home.tracks")} onClose={onClose}>
      {[1, 2, 3, 4].map(i => <div key={i} className="box"><b>{t(`trk.n${i}`)}</b><p className="mute">{t(`trk.d${i}`)}</p></div>)}
      <small>{t("trk.note")}</small>
    </Sheet>
  );
}

export function ContactsSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const rows: [string, string, string?][] = [
    [t("ct.fire"), t("ct.firedesc"), "193"], [t("ct.civil"), t("ct.civildesc"), "199"],
    ["PARNASO", t("ct.parnasodesc")], [t("ct.emater"), t("ct.ematerdesc")], [t("ct.env"), t("ct.envdesc")]
  ];
  return (
    <Sheet title={t("home.contacts")} onClose={onClose}>
      {rows.map(([n, d, tel]) => (
        <div key={n} className="box between"><div><b>{n}</b><p className="mute">{d}</p></div>{tel && <a className="call" href={`tel:${tel}`}>{tel}</a>}</div>
      ))}
      <small>{t("ct.warn")}</small>
    </Sheet>
  );
}
