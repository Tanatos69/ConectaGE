/**
 * Shared install-state detection, used by both the iOS install banner and
 * the push-subscription context (iOS only allows PushManager.subscribe()
 * once the app is already added to the home screen — asking before that
 * silently fails).
 */

/** True once the app is running as an installed, standalone PWA. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS exposes this instead of supporting the `display-mode` media query
  // reliably; check both since coverage differs by platform.
  const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * True on Safari running on iOS/iPadOS specifically — Chrome/Firefox/Edge
 * on iOS are still WebKit under the hood but never fire the install-related
 * behavior this is used to gate (the manual "Add to Home Screen" nudge).
 */
export function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iP(hone|od|ad)/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}
