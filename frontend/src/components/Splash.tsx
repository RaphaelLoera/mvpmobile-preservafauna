import { useEffect } from "react";
import Icon from "./Icon";

export default function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 500 : 1800;
    const id = setTimeout(onDone, ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="splash" role="status" aria-label="Preserva Fauna">
      <svg className="splash-mt" viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,110 L0,72 L40,52 L80,64 L118,34 L130,14 L138,42 L152,36 L190,60 L232,42 L272,68 L322,46 L362,62 L400,50 L400,110Z" fill="#fff" opacity=".14" />
        <path d="M0,110 L0,90 L60,74 L110,86 L170,68 L240,88 L300,72 L360,86 L400,78 L400,110Z" fill="#0F2A1F" opacity=".75" />
      </svg>
      <div className="splash-logo"><Icon name="paw" size={40} /></div>
      <h1>Preserva Fauna</h1>
      <p>Felinos da Serra • Teresópolis</p>
      <div className="splash-bar"><span /></div>
    </div>
  );
}
