import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import type { AtlasPlugin } from "../core/plugin";
import type { ResolvedConfig } from "../core/config";
import { logger } from "../core/logger";

export class PageLoadPlugin implements AtlasPlugin {
  name = "page-load";

  setup(provider: WebTracerProvider, config: ResolvedConfig): void | (() => void) {
    if (!config.trackPageViews) {
      return;
    }

    const unload = registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [
        new DocumentLoadInstrumentation({
          applyCustomAttributesOnSpan: {
            documentLoad: (span) => {
              span.setAttribute("page.url", window.location.href);
              span.setAttribute("page.path", window.location.pathname);
              span.setAttribute("page.title", document.title);
            },
            documentFetch: () => {},
            resourceFetch: () => {},
          },
        }),
      ],
    });

    logger.info("Plugin 'PageLoad' inicializado");

    return () => {
      unload();
      logger.debug("[PageLoadPlugin] Cleaned up");
    };
  }
}

export function PageLoad() {
  return new PageLoadPlugin();
}
