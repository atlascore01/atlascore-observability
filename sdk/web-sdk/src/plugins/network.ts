import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import type { AtlasPlugin } from "../core/plugin";
import type { ResolvedConfig } from "../core/config";
import { logger } from "../core/logger";

export class NetworkPlugin implements AtlasPlugin {
  name = "network";

  setup(provider: WebTracerProvider, config: ResolvedConfig): void | (() => void) {
    const instrumentations = [];
    const ignoredUrls = [config.endpoint, `${config.endpoint}/v1/traces`];

    if (config.trackFetch) {
      instrumentations.push(
        new FetchInstrumentation({
          propagateTraceHeaderCorsUrls: [/.*/],
          clearTimingResources: true,
          ignoreUrls: ignoredUrls,
          applyCustomAttributesOnSpan: (span, request, result) => {
            if (result instanceof Response) {
              const contentLength = parseInt(result.headers.get("content-length") ?? "0") || 0;
              span.setAttribute("http.response_content_length", contentLength);
            }
            span.setAttribute("atlascore.instrumentation", "fetch");
            void request;
          },
        })
      );
    }

    if (config.trackXHR) {
      instrumentations.push(
        new XMLHttpRequestInstrumentation({
          propagateTraceHeaderCorsUrls: [/.*/],
          ignoreUrls: ignoredUrls,
        })
      );
    }

    if (instrumentations.length === 0) {
      return;
    }

    const unload = registerInstrumentations({
      tracerProvider: provider,
      instrumentations,
    });

    logger.info("Plugin 'Network' (Fetch & XHR) inicializado");

    return () => {
      unload();
      logger.debug("[NetworkPlugin] Cleaned up");
    };
  }
}

export function Network() {
  return new NetworkPlugin();
}
