export type FeedbackTone = "success" | "error" | "info";

export function showFeedback(message: string, tone: FeedbackTone = "info") {
  window.dispatchEvent(new CustomEvent("pf:feedback", { detail: { message, tone } }));
}