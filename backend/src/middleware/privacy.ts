/** Arredonda ~1 km (2 casas) para proteger propriedades e animais ameaçados. */
export const approx = (n: number) => Math.round(n * 100) / 100;

export function canSeeExact(user: { role?: string } | null | undefined) {
  return user?.role === "tecnico" || user?.role === "admin";
}
