import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description?: string;
  ogImage?: string;
}

function upsertMeta(key: string, value: string): void {
  const isProp = key.startsWith('og:') || key.startsWith('twitter:');
  const attr = isProp ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

export function setPageMeta(title: string, description?: string, ogImage?: string): void {
  const full = title ? `${title} | Havtel` : 'Havtel | Store';
  document.title = full;
  upsertMeta('og:title', full);
  if (description) {
    upsertMeta('description', description);
    upsertMeta('og:description', description);
  }
  if (ogImage) upsertMeta('og:image', ogImage);

  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = window.location.origin + window.location.pathname;
}

export function usePageMeta({ title, description, ogImage }: PageMeta): void {
  useEffect(() => {
    setPageMeta(title, description, ogImage);
  }, [title, description, ogImage]);
}
