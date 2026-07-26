/**
 * UI Helpers and Constants
 * Contains shared visual constants and DOM helpers used across the legacy vanilla adapter.
 */

export const $ = (sel: string) => document.querySelector(sel);
export const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));

export const PLAY_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
export const INFO_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

export function showToast(msg: string) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

export function flashProgress() {
  const bar = $("#topProgress") as HTMLElement;
  if (!bar) return;
  bar.style.opacity = "1"; 
  bar.style.width = "30%";
  setTimeout(() => { bar.style.width = "100%"; }, 120);
  setTimeout(() => { 
    bar.style.opacity = "0"; 
    setTimeout(() => bar.style.width = "0", 350); 
  }, 500);
}
