const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

export function initGA(): void {
  if (!GA_ID) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  const gtag: GtagFn = (...args) => { window.dataLayer!.push(args); };
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
}

export function trackPageView(path: string, title: string): void {
  if (!GA_ID || !window.gtag) return;
  window.gtag('config', GA_ID, { page_path: path, page_title: title });
}
