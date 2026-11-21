/** Retratos ilustrados das espécies (SVG). */
export function felineSvg(id: string): string {
  interface Palette { c: string; l: string; d: string; e: string; m: string; ear: string; pup: string }
  const P: Record<string, Palette> = {
    puma: { c: "#C79B62", l: "#E8CE9E", d: "#6E4A2B", e: "#C8B04C", m: "#F4ECDD", ear: "r", pup: "v" },
    jaguatirica: { c: "#D9A458", l: "#F1D9A9", d: "#33200F", e: "#9DB56B", m: "#F6EEDD", ear: "p", pup: "v" },
    gato_mato: { c: "#D3A869", l: "#F2DFBB", d: "#34200F", e: "#C9A23C", m: "#F7EFE0", ear: "p", pup: "o" },
    gato_mourisco: { c: "#5F554D", l: "#8E8176", d: "#241E1A", e: "#C98C2E", m: "#85786D", ear: "s", pup: "v" },
    cachorro_mato: { c: "#8E7B66", l: "#C4B59F", d: "#33261B", e: "#B07A2A", m: "#D2C6B0", ear: "c", pup: "o" }
  };
  const k = P[id] || P.puma, canid = id === "cachorro_mato", u = id.replace(/\W/g, "");
  const ears = ({
    p: ["M31 42 C26 26 28 14 32 10 C43 14 51 25 53 35Z", "M34 38 C31 27 32 19 34 16 C41 19 47 26 49 33Z"],
    r: ["M30 44 C24 32 26 20 33 17 C42 18 50 26 52 35Z", "M34 38 C31 31 32 24 35 22 C41 23 46 28 48 34Z"],
    s: ["M31 43 C27 34 29 26 35 24 C42 25 48 30 50 37Z", "M35 39 C33 33 34 29 37 28 C41 29 45 32 47 37Z"],
    c: ["M32 40 C25 26 28 12 35 9 C45 13 52 24 53 34Z", "M35 36 C31 26 33 17 36 15 C42 18 47 25 49 32Z"]
  } as Record<string, string[]>)[k.ear];
  const dk = "#1B120D";
  const base = `
    <path d="${ears[0]}" fill="${k.c}" stroke="${k.d}" stroke-width="1" stroke-linejoin="round"/>
    <path d="${ears[1]}" fill="${canid ? k.d : "#3A261D"}" opacity=".85"/>
    <path d="M60 26 C44 26 30 34 26 50 C23 62 28 78 40 88 C46 93 53 96 60 96 Z" fill="url(#hd${u})"/>
    <ellipse cx="37" cy="72" rx="11" ry="13" fill="${k.l}" opacity=".5"/>
    <path d="M56 30 L55 40 M51 29 L49 38 M45 31 L43 39" stroke="${k.d}" stroke-width=".9" opacity=".35" stroke-linecap="round"/>`;
  const mark = ({
    puma: `<path d="M40 58 C38 66 40 73 44 78" stroke="${k.d}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>`,
    jaguatirica: `<path d="M36 61 C30 63 27 67 26 71 M38 67 C33 70 31 74 31 78" stroke="${k.d}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M37 46 Q45 41 54 46" stroke="#F6EEDD" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".85"/>
      <ellipse cx="51" cy="33" rx="2.4" ry="1.6" fill="${k.d}"/><ellipse cx="44" cy="37" rx="2.2" ry="1.5" fill="${k.d}"/><ellipse cx="53" cy="39" rx="2" ry="1.4" fill="${k.d}"/><ellipse cx="38" cy="41" rx="1.8" ry="1.3" fill="${k.d}"/>`,
    gato_mato: ["52,33", "46,36", "54,41", "40,40", "36,60", "40,66", "33,66"].map(p => `<circle cx="${p.split(",")[0]}" cy="${p.split(",")[1]}" r="1.7" fill="${k.d}"/>`).join("") + `<path d="M37 46 Q45 42 54 46" stroke="#F7EFE0" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>`,
    gato_mourisco: `<ellipse cx="46" cy="66" rx="9" ry="7" fill="${k.l}" opacity=".35"/>`,
    cachorro_mato: `<path d="M60 30 L60 62" stroke="${k.d}" stroke-width="6" opacity=".3" stroke-linecap="round"/><path d="M36 51 Q45 44 54 50" stroke="${k.d}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`
  } as Record<string, string>)[id] || "";
  const eye = `
    <ellipse cx="45" cy="52" rx="11" ry="8" fill="${k.d}" opacity=".22"/>
    <path d="M36 53 Q45 43 54 51 Q46 60 36 53Z" fill="${k.e}"/>
    ${k.pup === "v" ? `<ellipse cx="45" cy="52" rx="1.9" ry="5.2" fill="#0B0705"/>` : `<circle cx="45" cy="52" r="3.6" fill="#0B0705"/>`}
    <path d="M36 53 Q45 43 54 51" stroke="${dk}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M36 53 Q46 60 54 51" stroke="${dk}" stroke-width=".9" fill="none" opacity=".6"/>
    <circle cx="47.5" cy="49.8" r="1.3" fill="#fff" opacity=".9"/>`;
  const mouth = `
    <path d="M60 84 Q56 90 50 86" stroke="#3A241A" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="80" r=".9" fill="${dk}" opacity=".55"/><circle cx="47" cy="83" r=".9" fill="${dk}" opacity=".55"/><circle cx="52" cy="83" r=".9" fill="${dk}" opacity=".55"/>
    <path d="M48 80 L13 72 M48 83 L11 82 M49 86 L15 93" stroke="#fff" stroke-width=".7" opacity=".6" stroke-linecap="round"/>`;
  const mir = (s: string) => `${s}<g transform="translate(120 0) scale(-1 1)">${s}</g>`;
  return `
    <svg viewBox="0 0 120 120" class="w-full h-full" role="img" aria-label="${id}">
      <defs>
        <linearGradient id="bg${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27493B"/><stop offset="1" stop-color="#A5BBA6"/></linearGradient>
        <radialGradient id="hd${u}" gradientUnits="userSpaceOnUse" cx="60" cy="52" r="46"><stop offset="0" stop-color="${k.l}"/><stop offset=".55" stop-color="${k.c}"/><stop offset="1" stop-color="${k.d}"/></radialGradient>
        <radialGradient id="vg${u}" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient>
      </defs>
      <rect width="120" height="120" fill="url(#bg${u})"/>
      <circle cx="92" cy="26" r="12" fill="#F4E6B8" opacity=".25"/>
      <path d="M0 78 L18 52 L34 66 L58 36 L80 62 L100 46 L120 64 L120 120 L0 120Z" fill="#1F3C30" opacity=".5"/>
      <path d="M0 96 L24 72 L46 86 L70 64 L96 84 L120 74 L120 120 L0 120Z" fill="#14291F" opacity=".7"/>
      <path d="M30 82 C30 102 40 118 60 120 C80 118 90 102 90 82Z" fill="${k.c}"/>
      <path d="M30 82 C30 102 40 118 60 120 C80 118 90 102 90 82Z" fill="${k.d}" opacity=".35"/>
      ${mir(base)}
      <ellipse cx="60" cy="79" rx="${canid ? 11 : 15}" ry="${canid ? 15 : 11}" fill="${k.m}" opacity="${id === "gato_mourisco" ? ".55" : ".95"}"/>
      ${mir(mark)}
      ${mir(eye)}
      <path d="M54 71 Q60 68 66 71 Q64 77 60 79 Q56 77 54 71Z" fill="${canid || id === "gato_mourisco" ? "#1A1210" : "#B9776E"}" stroke="#4A2824" stroke-width=".8"/>
      <path d="M60 79 L60 84" stroke="#3A241A" stroke-width="1.2"/>
      ${mir(mouth)}
      <rect width="120" height="120" fill="url(#vg${u})"/>
    </svg>`;
}
