"use client";
import {
  bootstrapEnterAnalytics,
  replaceEventDefinitions,
  type EventDefinition,
} from '@enter-pro/analytics-sdk';

type EventDefinitionsPayload =
  | EventDefinition[]
  | {
      definitions?: EventDefinition[];
      events?: EventDefinition[];
      data?: {
        definitions?: EventDefinition[];
        events?: EventDefinition[];
      };
    };

declare global {
  interface Window {
    __ENTER_ANALYTICS_DEFINITIONS__?: EventDefinition[];
  }
  // eslint-disable-next-line no-var
  var __ENTER_ANALYTICS_ENV__: Record<string, string | undefined> | undefined;
}

// The @enter-pro/analytics-sdk dist bundle reads `import.meta.env.VITE_ENTER_*`
// (Vite-only). Next.js doesn't populate `import.meta.env`, so bridge our
// NEXT_PUBLIC_-prefixed env vars into the `globalThis.__ENTER_ANALYTICS_ENV__`
// object the SDK checks first, using the exact VITE_ key names it expects.
function bridgeEnterAnalyticsEnv(): void {
  globalThis.__ENTER_ANALYTICS_ENV__ = {
    VITE_ENTER_ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ENTER_ANALYTICS_ENABLED,
    VITE_ENTER_ANALYTICS_ENDPOINT: process.env.NEXT_PUBLIC_ENTER_ANALYTICS_ENDPOINT,
    VITE_ENTER_ANALYTICS_TOKEN: process.env.NEXT_PUBLIC_ENTER_ANALYTICS_TOKEN,
    VITE_ENTER_PROJECT_ID: process.env.NEXT_PUBLIC_ENTER_PROJECT_ID,
    VITE_ENTER_ANALYTICS_DEBUG: process.env.NEXT_PUBLIC_ENTER_ANALYTICS_DEBUG,
  };
}

function normalizeEventDefinitions(payload: EventDefinitionsPayload): EventDefinition[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.definitions ?? payload.events ?? payload.data?.definitions ?? payload.data?.events ?? [];
}

async function loadEventDefinitions(): Promise<EventDefinition[]> {
  if (typeof window !== 'undefined' && Array.isArray(window.__ENTER_ANALYTICS_DEFINITIONS__)) {
    return window.__ENTER_ANALYTICS_DEFINITIONS__;
  }

  const endpoint = process.env.NEXT_PUBLIC_ENTER_ANALYTICS_DEFINITIONS_ENDPOINT;
  if (!endpoint) {
    return [];
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      return [];
    }

    return normalizeEventDefinitions((await response.json()) as EventDefinitionsPayload);
  } catch {
    return [];
  }
}

export function bootstrapGeneratedSiteAnalytics(): void {
  bridgeEnterAnalyticsEnv();
  bootstrapEnterAnalytics();

  void loadEventDefinitions().then((definitions) => {
    if (definitions.length > 0) {
      replaceEventDefinitions(definitions);
    }
  });
}
