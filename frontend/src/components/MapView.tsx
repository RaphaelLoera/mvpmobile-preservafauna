import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { api } from "../api";
import { approx, COLORS, LABELS, LAYER_NAMES, MAP_PINS, Pin, PinType, RADIUS } from "../data/pins";
import { db } from "../db";
import { Profile } from "../lib/profile";
import { showFeedback } from "../lib/feedback";
import Icon from "./Icon";

type TileKey = "topo" | "osm";
const TILES: Record<TileKey, { url: string; att: string; max: number }> = {
  topo: { url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png", att: "© OpenStreetMap contributors, SRTM | © OpenTopoMap", max: 16 },
  osm: { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", att: "© OpenStreetMap contributors", max: 18 }
};
interface ApiPoint { id: string; predator: string; animal: string; impact: string; locality?: string; lat: number; lon: number }

const tx = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const ty = (lat: number, z: number) => { const r = (lat * Math.PI) / 180; return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z); };

/** Baixa os blocos da região (zooms 10 a 13). O service worker guarda em cache (CacheFirst). */
async function saveOffline(tile: TileKey, setMsg: (m: string) => void) {
  const urls: string[] = [];
  for (let z = 10; z <= 13; z++)
    for (let x = tx(-43.1, z); x <= tx(-42.7, z); x++)
      for (let y = ty(-22.2, z); y <= ty(-22.55, z); y++)
        urls.push(TILES[tile].url.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y)));
  const total = urls.length; let done = 0, ok = 0;
  const worker = async () => {
    while (urls.length) {
      const u = urls.pop()!;
      try { await fetch(u, { mode: "no-cors" }); ok++; } catch { /* sem rede */ }
      done++; setMsg(`Salvando mapa: ${done}/${total}`);
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  setMsg(ok ? `Mapa offline salvo (${ok} blocos).` : "Não foi possível baixar o mapa (sem rede).");
}

function ClickHandler({ onClick }: { onClick: (la: number, lo: number) => void }) {
  useMapEvents({ click: e => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}
const labelIcon = (name: string) => L.divIcon({ className: "pf-label", html: `<span class="pf-lb">${name}</span>`, iconSize: [0, 0] });

export default function MapView({ profile }: { profile: Profile | null }) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [layers, setLayers] = useState<Record<PinType, boolean>>({ occurrence: true, sighting: true, conflict: true, protected: true });
  const [tile, setTile] = useState<TileKey>("topo");
  const [heat, setHeat] = useState(false);
  const [mark, setMark] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);
  const [gps, setGps] = useState<[number, number] | null>(null);
  const [msg, setMsg] = useState("");
  const [custom, setCustom] = useState<Pin[]>(() => {
    try {
      const pins = JSON.parse(localStorage.getItem("pf_pins") || "[]") as Pin[];
      return pins.map(pin => pin.name.startsWith("Ocorrência") ? { ...pin, type: "occurrence" } : pin);
    } catch { return []; }
  });
  const [localIncidents, setLocalIncidents] = useState<Pin[]>([]);
  const [remote, setRemote] = useState<Pin[]>([]);

  useEffect(() => {
    const reloadLocal = async () => {
      try {
        const pins = JSON.parse(localStorage.getItem("pf_pins") || "[]") as Pin[];
        setCustom(pins.map(pin => pin.name.startsWith("Ocorrência") ? { ...pin, type: "occurrence" } : pin));
        const incidents = await db.incidents.toArray();
        setLocalIncidents(incidents.map(incident => ({
          id: `c-${incident.id}`,
          type: "occurrence",
          la: incident.lat,
          lo: incident.lon,
          custom: true,
          photo: incident.photo,
          name: `Ocorrência • ${incident.locality ?? "Região"}`,
          info: `${incident.predator} → ${incident.animal}. Impacto: ${incident.impact}.`
        })));
      } catch { setCustom([]); }
    };
    window.addEventListener("pf:incident-saved", reloadLocal);
    reloadLocal().catch(() => {});
    return () => window.removeEventListener("pf:incident-saved", reloadLocal);
  }, []);

  useEffect(() => {
    api<ApiPoint[]>("/map/points")
      .then(r => setRemote(r.map(p => ({ id: `api-${p.id}`, type: "occurrence" as PinType, la: p.lat, lo: p.lon, name: `Ocorrência • ${p.locality ?? "Região"}`, info: `${p.predator} → ${p.animal}. Impacto: ${p.impact}.` }))))
      .catch(() => {});
  }, []);
  useEffect(() => { localStorage.setItem("pf_pins", JSON.stringify(custom)); }, [custom]);

  const pins = useMemo(() => {
    const local = [...custom, ...localIncidents.filter(i => !custom.some(c => c.id === i.id))];
    return [...MAP_PINS, ...remote.filter(r => !local.some(c => c.id === `c-${r.id.slice(4)}`)), ...local].filter(p => layers[p.type]);
  }, [layers, remote, custom, localIncidents]);
  const sel = pins.find(p => p.id === selId) ?? null;

  const focus = (p: Pin) => { const a = approx(p); setSelId(p.id); map?.setView([a.la, a.lo], Math.max(map.getZoom(), 12)); };
  const addMark = (la: number, lo: number) => {
    if (!mark) return;
    const p: Pin = { id: `c-${Date.now()}`, type: "sighting", la, lo, name: "Avistamento marcado", info: "Ponto marcado manualmente neste aparelho.", custom: true };
    setCustom(c => [...c, p]); setSelId(p.id);
  };
  const locate = () => navigator.geolocation?.getCurrentPosition(
    p => { const c: [number, number] = [p.coords.latitude, p.coords.longitude]; setGps(c); map?.setView(c, 12); },
    () => setMsg("Não foi possível obter sua posição.")
  );
  const pa = profile ? approx({ type: "conflict", la: profile.lat, lo: profile.lon }) : null;

  return (
    <div className="mp">
      <div className="mp-title"><h2>Mapa · Teresópolis e entorno</h2><p>Arraste e use o zoom. Use o botão de marcar e toque no mapa para registrar um avistamento.</p></div>
      <div className="mp-main stack">
        <div className="chips">
          {(Object.keys(LAYER_NAMES) as PinType[]).map(k => (
            <button key={k} className={`chip ${layers[k] ? "on" : ""}`} onClick={() => setLayers(l => ({ ...l, [k]: !l[k] }))}>
              <i style={{ background: COLORS[k] }} />{LAYER_NAMES[k]}
            </button>
          ))}
        </div>
        <div className="map-wrap">
          <MapContainer ref={setMap} center={[-22.36, -42.88]} zoom={10} minZoom={9} maxZoom={TILES[tile].max} zoomControl={false} className="map">
            <TileLayer key={tile} url={TILES[tile].url} attribution={TILES[tile].att} maxZoom={TILES[tile].max} />
            <ClickHandler onClick={addMark} />
            <Circle center={[-22.45, -43.0]} radius={9000} pathOptions={{ color: "#2D6A4F", weight: 2, dashArray: "6 6", fillColor: "#2D6A4F", fillOpacity: 0.12 }} interactive={false} />
            {heat && pins.filter(p => p.type === "conflict" || p.type === "sighting").map(p => { const a = approx(p); return <Circle key={`h-${p.id}`} center={[a.la, a.lo]} radius={p.type === "conflict" ? 6000 : 4500} pathOptions={{ stroke: false, fillColor: "#DC2626", fillOpacity: 0.2 }} interactive={false} />; })}
            {pins.map(p => { const a = approx(p); return <Circle key={`z-${p.id}`} center={[a.la, a.lo]} radius={p.custom ? 800 : RADIUS[p.type]} pathOptions={{ stroke: false, fillColor: COLORS[p.type], fillOpacity: 0.28 }} interactive={false} />; })}
            {pa && <Circle center={[pa.la, pa.lo]} radius={5000} pathOptions={{ color: "#7C3AED", weight: 2, dashArray: "6 6", fillColor: "#7C3AED", fillOpacity: 0.07 }} interactive={false} />}
            {pa && <Marker position={[pa.la, pa.lo]} icon={labelIcon("Minha propriedade")} interactive={false} />}
            {LABELS.map(([n, la, lo]) => <Marker key={n} position={[la, lo]} icon={labelIcon(n)} interactive={false} />)}
            {pins.map(p => {
              const a = approx(p);
              return (
                <CircleMarker key={p.id} center={[a.la, a.lo]} radius={sel?.id === p.id ? 12 : 9} pathOptions={{ color: "#fff", weight: 2, fillColor: COLORS[p.type], fillOpacity: 1 }} eventHandlers={{ click: () => setSelId(p.id) }}>
                  {p.type === "conflict" && (
                    <Popup>
                      <strong>{p.name}</strong>
                      <p><b>Tipo:</b> Conflito registrado</p>
                      <p>{p.info}</p>
                      <small>Localização aproximada para proteger propriedades e animais.</small>
                    </Popup>
                  )}
                </CircleMarker>
              );
            })}
            {gps && <CircleMarker center={gps} radius={8} pathOptions={{ color: "#fff", weight: 2, fillColor: "#2563EB", fillOpacity: 1 }} interactive={false} />}
          </MapContainer>
          <div className="ctl">
            <button onClick={() => map?.zoomIn()} aria-label="Aproximar"><Icon name="plus" size={20} /></button>
            <button onClick={() => map?.zoomOut()} aria-label="Afastar"><Icon name="minus" size={20} /></button>
            <button onClick={locate} aria-label="Minha posição"><Icon name="locate" size={20} /></button>
            <button className={mark ? "on" : ""} onClick={() => setMark(m => !m)} aria-label="Marcar avistamento" aria-pressed={mark}><Icon name="pinPlus" size={20} /></button>
          </div>
        </div>
        <div className="between">
          <div className="seg">
            <button className={tile === "topo" ? "on" : ""} onClick={() => setTile("topo")}>Relevo</button>
            <button className={tile === "osm" ? "on" : ""} onClick={() => setTile("osm")}>Ruas</button>
            <button className={heat ? "on" : ""} onClick={() => setHeat(h => !h)} aria-label="Calor"><Icon name="flame" size={14} /></button>
          </div>
          <button className="ghost" onClick={() => saveOffline(tile, setMsg)}><Icon name="download" size={14} /> Mapa offline</button>
        </div>
        {msg && <small>{msg}</small>}
      </div>
      <div className="mp-side stack">
        {sel && (
          <div className="card sheet-in">
            <div className="between"><h3>{sel.name}</h3>{sel.custom && <button className="link danger" onClick={() => {
              if (!window.confirm("Remover este ponto do mapa?")) {
                showFeedback("Remoção cancelada.", "info");
                return;
              }
              setCustom(c => c.filter(x => x.id !== sel.id));
              setSelId(null);
              showFeedback("Ponto removido do mapa.", "success");
            }}>Remover</button>}</div>
            {sel.photo && <img className="photo" src={sel.photo} alt="" />}
            <p>{sel.info}</p>
            <small>≈ {approx(sel).la.toFixed(2)}, {approx(sel).lo.toFixed(2)} · localização aproximada para proteger propriedades e animais</small>
          </div>
        )}
        <div className="mp-list">
          <h4 className="eyebrow">Pontos no mapa ({pins.length})</h4>
          {pins.map(p => (
            <button key={p.id} className="list-item" onClick={() => focus(p)}>
              <i style={{ background: COLORS[p.type] }} /><span><b>{p.name}</b><small>{LAYER_NAMES[p.type]}</small></span>
            </button>
          ))}
        </div>
        <small>Pontos de exemplo. Localidades usam coordenadas reais; PARNASO e Três Picos são aproximados.</small>
      </div>
    </div>
  );
}
