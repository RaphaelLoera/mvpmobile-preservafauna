import { useEffect, useState } from "react";
import FelineArt from "./components/FelineArt";
import Icon, { IconName } from "./components/Icon";
import Home from "./components/Home";
import Auth from "./components/Auth";
import Community from "./components/Community";
import { ReportForm } from "./components/Report";
import Splash from "./components/Splash";
import MapView from "./components/MapView";
import Settings from "./components/Settings";
import { api, getToken, setToken } from "./api";
import { db, Species } from "./db";
import { useI18n } from "./lib/i18n";
import { loadProfile } from "./lib/profile";
import { flushOutbox, startAutoSync } from "./sync";
import { FeedbackTone, showFeedback } from "./lib/feedback";

const RISK = { Alto: "▲", "Médio": "●", Baixo: "■" } as const;

type Tab = "home" | "species" | "map" | "community" | "report";
type Phase = "splash" | "auth" | "app";

function useOnline() {
  const [on, setOn] = useState(navigator.onLine);
  useEffect(() => {
    const u = () => setOn(true), d = () => setOn(false);
    window.addEventListener("online", u); window.addEventListener("offline", d);
    return () => { window.removeEventListener("online", u); window.removeEventListener("offline", d); };
  }, []);
  return on;
}

function SpeciesList() {
  const [list, setList] = useState<Species[]>([]);
  const [catalogTab, setCatalogTab] = useState<"felines" | "prevention">("felines");
  const [selected, setSelected] = useState<Species | null>(null);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    api<Species[] | { data: Species[] }>("/species")
      .then(async response => {
        const species = Array.isArray(response) ? response : response.data;
        if (!Array.isArray(species)) throw new Error("Resposta inválida de espécies");
        setList(species);
        await db.species.bulkPut(species);
      })
      .catch(async () => setList(await db.species.toArray()));           // offline: usa o cache
  }, []);
  return (
    <div className="species-page">
      <div className="catalog-tabs">
        <button className={catalogTab === "felines" ? "on" : ""} onClick={() => setCatalogTab("felines")}>Felinos da Serra</button>
        <button className={catalogTab === "prevention" ? "on" : ""} onClick={() => setCatalogTab("prevention")}>Prevenção</button>
      </div>
      {catalogTab === "prevention" ? <PreventionCatalog /> : <>
      <div className="species-heading">
        <div><h2>Felinos da Serra</h2><p className="mute">Conheça as espécies encontradas na região de Teresópolis.</p></div>
        <span className="species-count">{list.length} espécies</span>
      </div>
      <div className="species-grid">
        {list.map(s => (
          <button type="button" key={s.id} className="card species species-card" onClick={() => setSelected(s)}>
            <FelineArt id={s.id} />
            <div>
              <h3>{s.name} <span className={`tag ${s.risk}`}>{RISK[s.risk]} {s.risk}</span></h3>
              <i>{s.scientific}</i>
              <p>{s.habitat}</p>
            </div>
            <span className="species-arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {selected && <SpeciesDetails species={selected} speaking={speaking} onSpeaking={setSpeaking} onClose={() => setSelected(null)} />}
      </>}
    </div>
  );
}

const preventionCards = [
  ["Cerca Elétrica Solar", "Eficácia de 95% para currais e apriscos noturnos.", ["Instale 5 a 6 fios alternados (positivo e terra) ao redor do abrigo noturno.", "Deixe o primeiro fio a 15 cm do solo para impedir passagem por baixo.", "Use eletrificador solar 12V e mantenha o capim roçado sob os fios."]],
  ["Abrigo Noturno e Tela Enterrada", "Proteção essencial contra jaguatiricas e cachorros-do-mato.", ["Recolha aves, ovinos e bezerros novos antes do anoitecer.", "Enterre a tela do galinheiro 30 cm no chão dobrada para fora.", "Feche frestas entre o telhado e a parede."]],
  ["Sinalizadores Luminosos (Foxlights)", "Flashes irregulares simulam presença humana à noite.", ["Fixe luzes solares estroboscópicas voltadas para a borda da mata.", "Mude as luzes de lugar a cada 15 dias para evitar adaptação do animal."]],
  ["Cães de Guarda e Manejo", "Boas práticas que reduzem ataques em até 80%.", ["Cães de guarda criados junto ao rebanho afastam predadores.", "Nunca deixe carcaças de animais mortos perto da mata; enterre longe do pasto."]]
] as const;

function PreventionCatalog() {
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState(false);
  useEffect(() => () => {
    window.speechSynthesis?.cancel();
  }, []);

  const listen = (index: number, title: string, description: string, steps: readonly string[]) => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setSpeechError(true);
      return;
    }
    if (speaking === index) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      setSpeechError(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${title}. ${description}. ${steps.join(" ")}`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.volume = 1;
    utterance.onstart = () => {
      setSpeaking(index);
      setSpeechError(false);
    };
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => {
      setSpeaking(null);
      setSpeechError(true);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    window.setTimeout(() => window.speechSynthesis.speak(utterance), 0);
  };
  return <div className="prevention-grid">
    {preventionCards.map(([title, description, steps], index) => (
      <article className="prevention-card box" key={title}>
        <div className="between"><div><h3>{title}</h3><p>{description}</p></div><button type="button" className="listen-small" onClick={() => listen(index, title, description, steps)} aria-label={`Ouvir ${title}`}>{speaking === index ? "■" : "🔊"}</button></div>
        <ul>{steps.map(step => <li key={step}>{step}</li>)}</ul>
      </article>
    ))}
    {speechError && <p className="speech-error" role="status">Não foi possível reproduzir o áudio neste navegador. Verifique se o som está habilitado.</p>}
  </div>;
}

function SpeciesDetails({ species, speaking, onSpeaking, onClose }: {
  species: Species; speaking: boolean; onSpeaking: (value: boolean) => void; onClose: () => void;
}) {
  const speech = `${species.name}. ${species.habitat || "Habitat em áreas de floresta da Serra de Teresópolis."}. ${species.diet || "Alimentação variada conforme a espécie."}. ${species.behavior || "Observe a espécie à distância e não ofereça alimento."}`;

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
  }, []);

  function toggleSpeech() {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      onSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speech);
    utterance.lang = "pt-BR";
    utterance.onend = () => onSpeaking(false);
    utterance.onerror = () => onSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    onSpeaking(true);
  }

  return (
    <div className="overlay" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="species-modal sheet">
        <div className="species-modal-head">
          <div className="species-modal-title">
          <FelineArt id={species.id} size={64} />
          <div><h2>{species.name}</h2><i>{species.scientific}</i></div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        <button type="button" className="primary listen-button" onClick={toggleSpeech}>
          {speaking ? "■ Parar" : "🔊 Ouvir"}
        </button>
        <div className="species-details">
          <section><h3>Habitat em Teresópolis</h3><p>{species.habitat || "Florestas densas e bordas do PARNASO e do Parque Estadual dos Três Picos."}</p></section>
          <section><h3>Alimentação</h3><p>{species.diet || "Pequenos mamíferos, aves e outros animais disponíveis no ambiente."}</p></section>
          <section><h3>Identificação de Pegadas</h3><p>{species.behavior || "Observe pegadas arredondadas e sem marcas de unhas; registre a ocorrência sem se aproximar."}</p></section>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("splash");
  const [tab, setTab] = useState<Tab>("home");
  const [pending, setPending] = useState(0);
  const [logged, setLogged] = useState(!!getToken());
  const [settings, setSettings] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: FeedbackTone } | null>(null);
  const [profile, setProfile] = useState(loadProfile);
  const online = useOnline();
  const refresh = () => db.outbox.count().then(setPending);

  useEffect(() => { if (phase !== "app") return; refresh(); return startAutoSync(refresh); }, [logged, phase]);
  useEffect(() => {
    const handleFeedback = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; tone: FeedbackTone }>).detail;
      setFeedback(detail);
      window.setTimeout(() => setFeedback(current => current === detail ? null : current), 3200);
    };
    window.addEventListener("pf:feedback", handleFeedback);
    return () => window.removeEventListener("pf:feedback", handleFeedback);
  }, []);

  const afterSplash = () => setPhase(getToken() || localStorage.getItem("pf_guest") === "1" ? "app" : "auth");
  const logout = () => {
    setToken(null); localStorage.removeItem("pf_user"); localStorage.removeItem("pf_guest");
    setLogged(false); setSettings(false); setTab("home"); setPhase("splash");
    showFeedback("Sessão encerrada.", "info");
  };
  if (phase === "splash") return <Splash onDone={afterSplash} />;
  if (phase === "auth") return <Auth onDone={message => { setLogged(!!getToken()); setPhase("app"); showFeedback(message, "success"); }} />;

  const tabs: [Tab, IconName][] = [["home", "house"], ["species", "paw"], ["map", "map"], ["community", "shield"]];

  return (
    <div className="app">
      <header>
        <button className="logo" onClick={() => setSettings(true)} aria-label="Perfil e ajustes" title="Perfil e ajustes">
          <Icon name="paw" size={20} />
          <span className={`dot ${online ? "on" : "off"}`} title={online ? "Online" : "Offline"} />
          {pending > 0 && <span className="badge-dot" />}
        </button>
        <h1>Preserva Fauna<small>{t("head.sub")}</small></h1>
      </header>
      {!online && <div className="offline">{t("offline.msg")} ({pending})</div>}
      <div className="body">
        <main>
          {tab === "home" && <Home profile={profile} onProfile={() => setSettings(true)} onReport={() => setReportOpen(true)} onMap={() => setTab("map")} />}
          {tab === "species" && <SpeciesList />}
          {tab === "community" && <Community />}
          {tab === "map" && <MapView profile={profile} />}
          {tab === "report" && <>{!logged && <div className="box guest">{t("rep.guest")}</div>}<ReportForm onSaved={refresh} profile={profile} /></>}
        </main>
        <nav>
          {tabs.map(([k, icon]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}><Icon name={icon} size={20} /><span>{t(`nav.${k}`)}</span></button>
          ))}
        </nav>
      </div>
      {settings && <Settings online={online} pending={pending} profile={profile} onProfile={setProfile} onSync={() => flushOutbox().then(refresh).then(() => undefined)} onLogout={logout} onClose={() => setSettings(false)} />}
      {reportOpen && <div className="overlay report-overlay" onClick={event => { if (event.target === event.currentTarget) setReportOpen(false); }}>
        <section className="report-modal">
          <div className="report-modal-head"><h2>Registrar ocorrência</h2><button type="button" className="icon-btn" onClick={() => setReportOpen(false)} aria-label="Fechar">×</button></div>
          <ReportForm onSaved={() => { refresh(); setReportOpen(false); }} profile={profile} />
        </section>
      </div>}
      {feedback && <div className={`toast ${feedback.tone}`} role="status">{feedback.message}</div>}
    </div>
  );
}
