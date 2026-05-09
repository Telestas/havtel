type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

export function trackPageView(path: string, title: string): void {
  if (!window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path, page_title: title });
}
