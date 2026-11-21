import { FormEvent, useState } from "react";
import { Pin } from "../data/pins";
import { db, Incident } from "../db";
import { useI18n } from "../lib/i18n";
import { resizePhoto } from "../lib/photo";
import { PLACES, Profile } from "../lib/profile";
import { flushOutbox } from "../sync";
import Icon from "./Icon";
import { showFeedback } from "../lib/feedback";

/** Mostra o registro no mapa deste aparelho na hora (a API devolve a versão aproximada depois). */
function addLocalPin(i: Incident) {
  const pin: Pin = {
    id: `c-${i.id}`, type: "occurrence", la: i.lat, lo: i.lon, custom: true, photo: i.photo,
    name: `Ocorrência • ${i.locality ?? ""}`, info: `${i.predator} → ${i.animal} (${i.quantity}). Impacto: ${i.impact}.`
  };
  try {
    const cur: Pin[] = JSON.parse(localStorage.getItem("pf_pins") || "[]");
    localStorage.setItem("pf_pins", JSON.stringify([...cur, pin]));
  } catch { /* armazenamento cheio */ }
}

export function ReportForm({ onSaved, profile }: { onSaved: () => void; profile: Profile | null }) {
  const { t } = useI18n();
  const [msg, setMsg] = useState("");
  const [gps, setGps] = useState<{ lat: number; lon: number } | null>(null);
  const [photo, setPhoto] = useState<string | undefined>();
  const places = Object.keys(PLACES);
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toTimeString().slice(0, 5);

  const useGps = () => navigator.geolocation?.getCurrentPosition(
    p => setGps({ lat: p.coords.latitude, lon: p.coords.longitude }),
    () => setMsg("GPS indisponível.")
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);   // guarda antes do await
    const locality = String(f.get("locality")), [plat, plon] = PLACES[locality];
    const inc: Incident = {
      id: crypto.randomUUID(), predator: String(f.get("predator")), animal: "Não informado",
      quantity: 0, impact: String(f.get("impact")), notes: String(f.get("notes") || "") || undefined,
      occurredAt: new Date(`${f.get("date")}T${f.get("time")}:00`).toISOString(), locality, lat: gps?.lat ?? plat, lon: gps?.lon ?? plon, photo
    };
    await db.outbox.add(inc);
    await db.incidents.put(inc);
    addLocalPin(inc);
    window.dispatchEvent(new Event("pf:incident-saved"));
    setMsg(t("rep.saved")); setPhoto(undefined); setGps(null); form.reset();
    showFeedback("Ocorrência salva no aparelho.", "success");
    onSaved();
    flushOutbox().then(onSaved).catch(() => {});
  }

  return (
    <form onSubmit={submit} className="stack report-form">
      <div className="report-datetime">
        <label>Data<input name="date" type="date" defaultValue={defaultDate} required /></label>
        <label>Hora<input name="time" type="time" defaultValue={defaultTime} required /></label>
      </div>
      <label>Localidade (Teresópolis)<select name="locality" defaultValue={profile?.loc ?? places[0]}>{places.map(p => <option key={p}>{p}</option>)}</select></label>
      <button type="button" className="ghost report-gps" onClick={useGps}><Icon name="locate" size={14} /> Usar GPS{gps ? ` (${gps.lat.toFixed(3)}, ${gps.lon.toFixed(3)})` : ""}</button>
      <label>Animal observado<select name="predator"><option>Onça-parda (Suçuarana)</option><option>Jaguatirica</option><option>Gato-do-mato / Mourisco</option><option>Cachorro-do-mato</option><option>Apenas pegadas</option></select></label>
      <label>Foto (pegada, dano ou local)<input type="file" accept="image/*" capture="environment" onChange={async e => { const f = e.target.files?.[0]; if (f) setPhoto(await resizePhoto(f)); }} /></label>
      {photo && <img className="photo" src={photo} alt="" />}
      <label>Impacto no rebanho<input name="impact" required placeholder="Ex: Nenhuma perda, ou 2 galinhas..." /></label>
      <button type="submit">{t("rep.save")}</button>
      {msg && <small>{msg}</small>}
    </form>
  );
}
