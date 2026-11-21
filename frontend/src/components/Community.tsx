import { FormEvent, useEffect, useState } from "react";
import Guides from "./Guides";
import Icon from "./Icon";

type SubTab = "forum" | "chat" | "guides";
type Post = { id: number; author: string; place: string; time: string; text: string; likes: number; liked: boolean };
type Message = { sender: "user" | "bot"; name: string; text: string };

const initialPosts: Post[] = [
  { id: 10, author: "Antônio Ferreira", place: "Vieira • Produtor de Ovinos", time: "Há 5h", text: "Instalamos 5 fios de cerca elétrica solar no aprisco noturno com orientação da Emater. Faz mais de um ano que não temos nenhum prejuízo.", likes: 18, liked: false },
  { id: 11, author: "Mariana Costa", place: "Bonsucesso • Avicultura", time: "Há 2d", text: "Enterrar a tela do galinheiro 30 cm para fora e fechar as frestas do telhado resolveu o problema com jaguatirica aqui no sítio.", likes: 24, liked: true }
];
const initialMessages: Message[] = [{ sender: "bot", name: "Dra. Camila Mendes • Bióloga", text: "Olá! Sou especialista da Serra dos Órgãos. Como posso ajudar a proteger sua propriedade hoje?" }];

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

export default function Community() {
  const [tab, setTab] = useState<SubTab>("forum");
  const [posts, setPosts] = useState<Post[]>(() => read("pf2_forum", initialPosts));
  const [messages, setMessages] = useState<Message[]>(() => read("pf2_chat", initialMessages));

  useEffect(() => { localStorage.setItem("pf2_forum", JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem("pf2_chat", JSON.stringify(messages)); }, [messages]);

  function addPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = new FormData(form).get("text")?.toString().trim();
    if (!text) return;
    setPosts(current => [{ id: Date.now(), author: "Você", place: "Teresópolis • Produtor Rural", time: "Agora", text, likes: 1, liked: true }, ...current]);
    form.reset();
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = new FormData(form).get("message")?.toString().trim();
    if (!text) return;
    const lower = text.toLowerCase();
    let reply = "Recomendamos recolher animais jovens antes das 18h e registrar o local no mapa para orientação técnica.";
    if (lower.includes("pegada")) reply = "Felinos não deixam marca de unhas na pegada. O cachorro-do-mato deixa marca de unhas na frente dos dedos.";
    if (lower.includes("cerca")) reply = "Para cerca elétrica solar, utilize 5 fios, com o primeiro a 15 cm do solo ao redor do curral noturno.";
    setMessages(current => [...current, { sender: "user", name: "Você", text }, { sender: "bot", name: "Dra. Camila Mendes • Bióloga", text: reply }]);
    form.reset();
  }

  return (
    <div className="community stack">
      <div className="community-tabs">
        {([["forum", "Fórum"], ["chat", "Especialista"], ["guides", "Guias e Leis"]] as const).map(([key, label]) => (
          <button key={key} className={tab === key ? "on" : ""} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {tab === "forum" && (
        <div className="stack">
          <form onSubmit={addPost} className="box community-compose">
            <textarea name="text" rows={3} required placeholder="Compartilhe uma experiência ou dica com produtores da Serra..." />
            <button type="submit" className="primary">Publicar</button>
          </form>
          {posts.map(post => (
            <article className="box community-post" key={post.id}>
              <div className="between"><div><b>{post.author}</b><small>{post.place}</small></div><small>{post.time}</small></div>
              <p>{post.text}</p>
              <button className={`link ${post.liked ? "brand" : ""}`} onClick={() => setPosts(current => current.map(item => item.id === post.id ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 } : item))}>{post.liked ? "▲" : "△"} Útil ({post.likes})</button>
            </article>
          ))}
        </div>
      )}
      {tab === "chat" && (
        <section className="box community-chat">
          <header><div><b>Plantão Técnico • Fauna</b><small>Biólogos PARNASO / Emater</small></div><span className="dot on" /></header>
          <div className="chat-feed">
            {messages.map((message, index) => <div className={`chat-message ${message.sender}`} key={`${message.name}-${index}`}><small>{message.name}</small><p>{message.text}</p></div>)}
          </div>
          <form onSubmit={sendMessage}><input name="message" required placeholder="Escreva sua dúvida..." /><button type="submit" className="primary">Enviar</button></form>
        </section>
      )}
      {tab === "guides" && <Guides />}
    </div>
  );
}
