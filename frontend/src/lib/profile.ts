export const PLACES: Record<string, [number, number]> = {
  "Vale de Bonsucesso": [-22.2714, -42.7947], "Vargem Grande": [-22.344, -42.894], "Vieira": [-22.262, -42.737],
  "Venda Nova": [-22.32, -42.87], "Pessegueiros": [-22.293, -42.945], "Imbuí": [-22.39, -42.998], "Teresópolis (centro)": [-22.4119, -42.9658]
};
export interface Profile { loc: string; lat: number; lon: number }

export const loadProfile = (): Profile | null => { try { return JSON.parse(localStorage.getItem("pf_profile") || "null"); } catch { return null; } };
export const saveProfile = (p: Profile | null) => (p ? localStorage.setItem("pf_profile", JSON.stringify(p)) : localStorage.removeItem("pf_profile"));
