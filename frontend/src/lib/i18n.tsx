import { createContext, ReactNode, useContext, useState } from "react";

export type Lang = "pt" | "en" | "es";
type Tri = [string, string, string]; // pt, en, es

const D: Record<string, Tri> = {
  "nav.community": ["Comunidade", "Community", "Comunidad"],
  "gd.title": ["Como prevenir ataques", "How to prevent attacks", "Cómo prevenir ataques"], "gd.sub": ["Texto curto e direto, para ler no campo.", "Short and direct, to read in the field.", "Texto corto y directo, para leer en el campo."],
  "gd.t1": ["Cerca elétrica", "Electric fence", "Cerca eléctrica"], "gd.b1": ["Use fios em alturas diferentes, aterramento correto e mantenha a vegetação limpa sob a cerca. Verifique a energia toda semana.", "Use wires at different heights, proper grounding and keep vegetation clear under the fence. Check the power weekly.", "Usa hilos a distintas alturas, buena conexión a tierra y mantén limpia la vegetación bajo la cerca. Revisa la energía cada semana."],
  "gd.t2": ["Cães de guarda", "Guard dogs", "Perros guardianes"], "gd.b2": ["Raças de proteção de rebanho, criadas com os animais desde filhotes, reduzem os ataques. Exigem vacina, alimentação e acompanhamento.", "Livestock-guardian breeds raised with the animals from puppyhood reduce attacks. They need vaccines, food and follow-up.", "Las razas guardianas criadas con los animales desde cachorros reducen los ataques. Requieren vacunas, alimentación y seguimiento."],
  "gd.t3": ["Abrigo noturno", "Night shelter", "Refugio nocturno"], "gd.b3": ["Recolha aves, ovelhas e cabras ao anoitecer em curral fechado e coberto. A maioria dos ataques acontece à noite.", "Bring poultry, sheep and goats into a closed, covered pen at dusk. Most attacks happen at night.", "Recoge aves, ovejas y cabras al anochecer en un corral cerrado y cubierto. La mayoría de los ataques ocurre de noche."],
  "gd.t4": ["Luz e som", "Light and sound", "Luz y sonido"], "gd.b4": ["Luz com sensor de movimento perto do curral ajuda a afastar animais, mas deve variar para eles não se acostumarem.", "Motion-sensor lights near the pen help deter animals, but vary them so they do not get used to it.", "La luz con sensor de movimiento cerca del corral ayuda a alejar animales, pero debe variar para que no se acostumbren."],
  "gd.t5": ["Carcaças e restos", "Carcasses and scraps", "Carcasas y restos"], "gd.b5": ["Enterre ou remova animais mortos e restos de abate para não atrair predadores para a propriedade.", "Bury or remove dead animals and slaughter scraps so predators are not drawn to the property.", "Entierra o retira animales muertos y restos de faena para no atraer depredadores a la propiedad."],
  "gd.t6": ["Depois de um ataque", "After an attack", "Después de un ataque"], "gd.b6": ["Não mate o felino: é crime ambiental (Lei 9.605/1998) e a espécie é protegida (Lei 5.197/1967). Registre no app e procure o órgão ambiental.", "Do not kill the cat: it is an environmental crime (Law 9,605/1998) and the species is protected (Law 5,197/1967). Log it in the app and contact the environmental agency.", "No mates al felino: es delito ambiental (Ley 9.605/1998) y la especie está protegida (Ley 5.197/1967). Regístralo en la app y busca al órgano ambiental."],
  "au.sub": ["Convivência segura com os felinos da Serra", "Safe coexistence with the cats of the Serra", "Convivencia segura con los felinos de la Sierra"],
  "au.login": ["Entrar", "Sign in", "Entrar"], "au.register": ["Criar conta", "Create account", "Crear cuenta"], "au.name": ["Nome", "Name", "Nombre"], "au.email": ["E-mail", "Email", "Correo"],
  "au.pass": ["Senha", "Password", "Contraseña"], "au.pass2": ["Confirmar senha", "Confirm password", "Confirmar contraseña"], "au.show": ["Mostrar senha", "Show password", "Mostrar contraseña"],
  "au.guest": ["Continuar sem conta", "Continue without an account", "Continuar sin cuenta"], "au.note": ["Sem conta, os registros ficam só no aparelho e não sincronizam.", "Without an account, reports stay on the device and do not sync.", "Sin cuenta, los registros quedan solo en el dispositivo y no se sincronizan."],
  "au.short": ["A senha precisa ter pelo menos 8 caracteres.", "Password must be at least 8 characters.", "La contraseña debe tener al menos 8 caracteres."], "au.passwordRule": ["Use no mínimo 8 caracteres, com uma letra minúscula e uma maiúscula.", "Use at least 8 characters, including one lowercase and one uppercase letter.", "Usa al menos 8 caracteres, con una letra minúscula y una mayúscula."], "au.mismatch": ["As senhas não coincidem.", "Passwords do not match.", "Las contraseñas no coinciden."],
  "au.invalid": ["E-mail ou senha incorretos.", "Wrong email or password.", "Correo o contraseña incorrectos."], "au.exists": ["Este e-mail já está cadastrado.", "This email is already registered.", "Este correo ya está registrado."],
  "au.check": ["Confira os dados informados.", "Check the information entered.", "Revisa los datos ingresados."], "au.server": ["Sem conexão com o servidor. Tente de novo ou continue sem conta.", "Cannot reach the server. Try again or continue without an account.", "Sin conexión con el servidor. Inténtalo de nuevo o continúa sin cuenta."],
  "set.account": ["Conta", "Account", "Cuenta"], "set.logout": ["Sair", "Sign out", "Salir"], "set.guest": ["Visitante", "Guest", "Visitante"],
  "rep.guest": ["Modo visitante: os registros ficam no aparelho. Entre para sincronizar.", "Guest mode: reports stay on the device. Sign in to sync.", "Modo visitante: los registros quedan en el dispositivo. Inicia sesión para sincronizar."],
  "nav.home": ["Início", "Home", "Inicio"], "nav.species": ["Espécies", "Species", "Especies"], "nav.map": ["Mapa", "Map", "Mapa"], "nav.report": ["Registrar", "Report", "Registrar"],
  "head.sub": ["Felinos da Serra · Teresópolis", "Mountain Cats · Teresópolis", "Felinos de la Sierra · Teresópolis"],
  "offline.msg": ["Sem conexão: os registros ficam no aparelho e serão enviados depois.", "No connection: reports stay on this device and will be sent later.", "Sin conexión: los registros quedan en el dispositivo y se enviarán después."],
  "home.none": ["Cadastre sua propriedade para receber alertas personalizados.", "Add your property to get personalized alerts.", "Registra tu propiedad para recibir alertas personalizadas."],
  "home.near": ["conflito(s) a até 5 km da sua propriedade.", "conflict(s) within 5 km of your property.", "conflicto(s) a menos de 5 km de tu propiedad."],
  "home.clear": ["Nenhum conflito registrado a 5 km da sua propriedade.", "No conflicts recorded within 5 km of your property.", "Ningún conflicto registrado a 5 km de tu propiedad."],
  "home.protection": ["Nível de proteção", "Protection level", "Nivel de protección"], "home.open": ["Abrir checklist", "Open checklist", "Abrir lista"],
  "home.profile": ["Minha propriedade", "My property", "Mi propiedad"], "home.tracks": ["Guia de pegadas", "Track guide", "Guía de huellas"],
  "home.contacts": ["Contatos úteis", "Useful contacts", "Contactos útiles"], "home.report": ["Registrar ataque", "Report an attack", "Registrar ataque"],
  "chk.hint": ["Marque o que já existe na sua propriedade.", "Check what already exists on your property.", "Marca lo que ya existe en tu propiedad."],
  "chk.1": ["Cerca elétrica com 5 fios", "Electric fence with 5 wires", "Cerca eléctrica con 5 hilos"], "chk.2": ["Cães de guarda criados com o rebanho", "Guard dogs raised with the herd", "Perros guardianes criados con el rebaño"],
  "chk.3": ["Abrigo noturno fechado", "Closed night shelter", "Refugio nocturno cerrado"], "chk.4": ["Iluminação com sensor de movimento", "Motion-sensor lighting", "Iluminación con sensor de movimiento"],
  "chk.5": ["Tela do galinheiro enterrada 30 cm", "Henhouse mesh buried 30 cm", "Malla del gallinero enterrada 30 cm"], "chk.6": ["Carcaças removidas ou enterradas", "Carcasses removed or buried", "Carcasas retiradas o enterradas"],
  "trk.n1": ["Onça-parda", "Puma", "Puma"], "trk.n2": ["Jaguatirica", "Ocelot", "Ocelote"], "trk.n3": ["Gatos-do-mato e mourisco", "Small cats and jaguarundi", "Gatos pequeños y yaguarundí"], "trk.n4": ["Cachorro-do-mato (canídeo)", "Crab-eating fox (canid)", "Zorro cangrejero (cánido)"],
  "trk.d1": ["Pegada grande (cerca de 8 a 10 cm de largura), quatro dedos sem marca de garras e almofada com três lóbulos na base.", "Large track (about 8 to 10 cm wide), four toes with no claw marks and a three-lobed pad.", "Huella grande (unos 8 a 10 cm de ancho), cuatro dedos sin marcas de garras y almohadilla con tres lóbulos."],
  "trk.d2": ["Média (cerca de 5 a 6 cm), dedos arredondados e sem marca de garras.", "Medium (about 5 to 6 cm), rounded toes, no claw marks.", "Mediana (unos 5 a 6 cm), dedos redondeados y sin marcas de garras."],
  "trk.d3": ["Pequena (cerca de 3 a 4 cm) e difícil de ver. Também sem garras.", "Small (about 3 to 4 cm) and hard to spot. Also no claws.", "Pequeña (unos 3 a 4 cm) y difícil de ver. También sin garras."],
  "trk.d4": ["Quatro dedos com marcas de unhas e almofada em forma de triângulo.", "Four toes with claw marks and a triangular pad.", "Cuatro dedos con marcas de uñas y almohadilla triangular."],
  "trk.note": ["Medidas aproximadas. Fotografe a pegada com uma moeda ao lado e confirme com um técnico.", "Approximate sizes. Photograph the track next to a coin and confirm with a technician.", "Medidas aproximadas. Fotografía la huella junto a una moneda y confirma con un técnico."],
  "ct.fire": ["Corpo de Bombeiros", "Fire Department", "Bomberos"], "ct.firedesc": ["Resgate de animais silvestres em risco", "Rescue of wild animals at risk", "Rescate de animales silvestres en riesgo"],
  "ct.civil": ["Defesa Civil", "Civil Defense", "Defensa Civil"], "ct.civildesc": ["Emergências e áreas de risco", "Emergencies and risk areas", "Emergencias y zonas de riesgo"],
  "ct.parnasodesc": ["Parque Nacional da Serra dos Órgãos: consulte o canal oficial", "Serra dos Órgãos National Park: check the official channel", "Parque Nacional Serra dos Órgãos: consulta el canal oficial"],
  "ct.emater": ["Emater-Rio", "Emater-Rio", "Emater-Rio"], "ct.ematerdesc": ["Orientação técnica ao produtor: escritório local", "Technical support for farmers: local office", "Orientación técnica al productor: oficina local"],
  "ct.env": ["Órgão ambiental (INEA / ICMBio)", "Environmental agency (INEA / ICMBio)", "Órgano ambiental (INEA / ICMBio)"], "ct.envdesc": ["Comunicar ocorrências com fauna silvestre", "Report incidents involving wildlife", "Comunicar incidentes con fauna silvestre"],
  "ct.warn": ["Nunca mate o felino: é crime ambiental. Registre a ocorrência no app.", "Never kill the cat: it is an environmental crime. Log the incident in the app.", "Nunca mates al felino: es delito ambiental. Registra el incidente en la app."],
  "rep.predator": ["Predador", "Predator", "Depredador"], "rep.animal": ["Animal atacado", "Animal attacked", "Animal atacado"], "rep.qty": ["Quantidade", "Quantity", "Cantidad"],
  "rep.impact": ["Impacto", "Impact", "Impacto"], "rep.impactph": ["Ex.: 2 galinhas", "e.g. 2 hens", "Ej.: 2 gallinas"], "rep.notes": ["Observações", "Notes", "Observaciones"],
  "rep.place": ["Localidade", "Area", "Localidad"], "rep.gps": ["Usar GPS", "Use GPS", "Usar GPS"], "rep.photo": ["Foto (pegada, dano ou local)", "Photo (track, damage or place)", "Foto (huella, daño o lugar)"],
  "rep.save": ["Salvar registro", "Save report", "Guardar registro"], "rep.saved": ["Registro salvo no aparelho.", "Report saved on this device.", "Registro guardado en el dispositivo."], "rep.login": ["Entrar para sincronizar", "Sign in to sync", "Inicia sesión para sincronizar"],
  "set.title": ["Perfil e ajustes", "Profile & settings", "Perfil y ajustes"], "set.save": ["Salvar", "Save", "Guardar"], "set.saved": ["Propriedade salva neste aparelho.", "Property saved on this device.", "Propiedad guardada en este dispositivo."],
  "set.conn": ["Conexão e sincronização", "Connection & sync", "Conexión y sincronización"], "set.online": ["Online", "Online", "En línea"], "set.offline": ["Offline", "Offline", "Sin conexión"],
  "set.pending": ["Pendentes", "Pending", "Pendientes"], "set.last": ["Última sincronização", "Last sync", "Última sincronización"], "set.never": ["ainda não sincronizou", "never synced", "aún sin sincronizar"],
  "set.sync": ["Sincronizar agora", "Sync now", "Sincronizar ahora"], "set.synced": ["Sincronizado.", "Synced.", "Sincronizado."], "set.nooff": ["Sem conexão: os registros ficam no aparelho.", "No connection: reports stay on this device.", "Sin conexión: los registros quedan en el dispositivo."],
  "set.login": ["Entre na sua conta (aba Registrar) para sincronizar.", "Sign in (Report tab) to sync.", "Inicia sesión (pestaña Registrar) para sincronizar."],
  "set.pref": ["Preferências", "Preferences", "Preferencias"], "set.light": ["Claro", "Light", "Claro"], "set.dark": ["Escuro", "Dark", "Oscuro"], "set.system": ["Sistema", "System", "Sistema"],
  "set.field": ["Modo campo (texto maior)", "Field mode (larger text)", "Modo campo (texto más grande)"], "set.lang": ["Idioma", "Language", "Idioma"],
  "set.alerts": ["Alertas de ocorrências", "Incident alerts", "Alertas de incidentes"], "set.denied": ["Permissão de notificação negada.", "Notification permission denied.", "Permiso de notificaciones denegado."],
  "notif.title": ["Alerta na sua região", "Alert in your area", "Alerta en tu zona"], "notif.body": ["Há conflitos registrados a até 5 km da sua propriedade.", "Conflicts were recorded within 5 km of your property.", "Hay conflictos registrados a menos de 5 km de tu propiedad."]
};

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }
const I18n = createContext<Ctx>({ lang: "pt", setLang: () => {}, t: k => D[k]?.[0] ?? k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<Lang>(() => (localStorage.getItem("pf_lang") as Lang) || "pt");
  const setLang = (l: Lang) => { localStorage.setItem("pf_lang", l); document.documentElement.lang = l === "pt" ? "pt-BR" : l; setL(l); };
  const i = { pt: 0, en: 1, es: 2 }[lang];
  const t = (k: string) => D[k]?.[i] ?? k;
  return <I18n.Provider value={{ lang, setLang, t }}>{children}</I18n.Provider>;
}
export const useI18n = () => useContext(I18n);
