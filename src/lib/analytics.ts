type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

const CONSENT_KEY = 'havtel.cookie_consent';
const GA_ID = 'G-3EMPM1PQ24';

let analyticsEnabled = false;

export type ConsentChoice = 'granted' | 'denied';

export function getStoredConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

// Load Google Analytics only after consent — nothing is sent to Google before this.
export function enableAnalytics(): void {
  if (analyticsEnabled || typeof document === 'undefined') return;
  analyticsEnabled = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    (window.dataLayer as unknown[]).push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
}

export function grantConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, 'granted');
  } catch {
    /* storage unavailable */
  }
  enableAnalytics();
}

export function denyConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, 'denied');
  } catch {
    /* storage unavailable */
  }
}

export function trackPageView(path: string, title: string): void {
  if (!analyticsEnabled || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path, page_title: title });
}
