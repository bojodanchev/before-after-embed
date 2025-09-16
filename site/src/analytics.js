import posthog from 'posthog-js';

const POSTHOG_KEY =
  import.meta.env.VITE_POSTHOG_KEY ||
  import.meta.env.NEXT_PUBLIC_POSTHOG_KEY ||
  import.meta.env.PUBLIC_POSTHOG_KEY;

const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST ||
  import.meta.env.NEXT_PUBLIC_POSTHOG_HOST ||
  import.meta.env.PUBLIC_POSTHOG_HOST ||
  'https://app.posthog.com';

let initialized = false;
let capturedLandingView = false;

function ensureClient() {
  if (typeof window === 'undefined') return null;
  if (!POSTHOG_KEY) return null;
  if (!initialized) {
    if (import.meta.env.DEV) {
      console.info('[analytics] Initializing PostHog', {
        host: POSTHOG_HOST,
        keyPresent: Boolean(POSTHOG_KEY),
      });
    }
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: true,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: 'input, textarea, [data-ph-mask]',
      },
      person_profiles: 'identified_only',
    });
    initialized = true;
  }
  return posthog;
}

function withClient(callback) {
  const client = ensureClient();
  if (!client) return;
  callback(client);
}

function pickUTM() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const value = params.get(key);
    if (value) result[key] = value;
  });
  const referrer = document.referrer;
  if (referrer) result.referrer = referrer;
  const outreach = params.get('source');
  if (outreach) result.outreach_source = outreach;
  return result;
}

export function capture(event, properties = {}) {
  withClient((client) => {
    client.capture(event, properties);
  });
}

export function captureLandingView(extra = {}) {
  if (capturedLandingView) return;
  withClient((client) => {
    capturedLandingView = true;
    const urlMeta = typeof window !== 'undefined' ? {
      path: window.location.pathname,
      hash: window.location.hash || undefined,
    } : {};
    client.capture('landing_view', {
      page: 'marketing_home',
      ...pickUTM(),
      ...urlMeta,
      ...extra,
    });
  });
}

export function trackDemoStart(extra = {}) {
  capture('demo_start', {
    page: 'marketing_home',
    surface: 'live_demo',
    ...extra,
  });
}

export function trackDemoGenerate(state, extra = {}) {
  capture('demo_generate', {
    page: 'marketing_home',
    surface: 'live_demo',
    status: state,
    ...extra,
  });
}

export function trackCtaClick({ id, label, href, location, extra = {} }) {
  capture('cta_click', {
    page: 'marketing_home',
    id,
    label,
    href,
    location,
    ...extra,
  });
}

export function trackPricingSelect({ plan, interval, location, extra = {} }) {
  capture('pricing_select', {
    page: 'marketing_home',
    plan,
    interval,
    location,
    ...extra,
  });
}

export function trackLeadCapture(extra = {}) {
  capture('lead_capture', {
    page: 'marketing_home',
    ...extra,
  });
}

export function shutdownAnalytics() {
  withClient((client) => {
    client.shutdown();
    initialized = false;
    capturedLandingView = false;
  });
}
