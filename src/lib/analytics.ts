/**
 * Google Analytics GA4 - Event tracking utility
 * ID: G-Q6FL69BY01
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

type GAEventName =
  // Funnel SaaS events
  | 'signup_created'
  | 'page_published'
  | 'trial_started'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'lead_received'
  // CTA click events
  | 'cta_start_trial'
  | 'cta_signup'
  | 'cta_pricing';

export function trackEvent(eventName: GAEventName, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
