import { felineSvg } from "../lib/felines";

export default function FelineArt({ id, size = 72 }: { id: string; size?: number }) {
  return <div className="art" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: felineSvg(id) }} />;
}
