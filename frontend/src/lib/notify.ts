export const notifOn = () => localStorage.getItem("pf_notif") === "1";

async function show(title: string, body: string) {
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) await reg.showNotification(title, { body, icon: "/icon-192.png" });
    else new Notification(title, { body });
  } catch { /* navegador sem suporte */ }
}

/** Pede permissão e liga os alertas. Alertas reais (push) exigem um servidor; aqui são locais. */
export async function enableNotif(title: string, body: string): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if ((await Notification.requestPermission()) !== "granted") return false;
  localStorage.setItem("pf_notif", "1");
  show(title, body);
  return true;
}
export const disableNotif = () => localStorage.setItem("pf_notif", "0");

/** No máximo uma notificação por dia quando há conflito perto da propriedade. */
export function notifyNear(n: number, title: string, body: string) {
  if (!notifOn() || n <= 0 || !("Notification" in window) || Notification.permission !== "granted") return;
  const day = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem("pf_notif_day") === day) return;
  localStorage.setItem("pf_notif_day", day);
  show(title, body);
}
