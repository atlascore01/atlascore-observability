/**
 * AtlasCore Web SDK - Instrumentaciones automáticas
 *
 * Registra las instrumentaciones de OTel según la configuración del usuario.
 * Cada instrumentación es opcional y se activa/desactiva mediante flags.
 */

import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import type { ResolvedConfig } from "../core/config";
import { logger } from "../core/logger";

/**
 * URLs que el SDK ignora para no crear spans de sus propias peticiones al collector.
 * Esto evita que el exporter OTLP genere trazas de sí mismo.
 */
function getIgnoredUrls(endpoint: string): string[] {
  return [endpoint, `${endpoint}/v1/traces`, `${endpoint}/v1/metrics`];
}

export function registerAutoInstrumentations(
  provider: WebTracerProvider,
  config: ResolvedConfig
): void {
  const instrumentations = [];

  // --- Document Load: traza completa de carga de la página ---
  if (config.trackPageViews) {
    instrumentations.push(
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
      })
    );
    logger.debug("Instrumentación DocumentLoad registrada");
  }

  // --- Fetch: instrumenta llamadas fetch() ---
  if (config.trackFetch) {
    instrumentations.push(
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/.*/],
        clearTimingResources: true,
        ignoreUrls: getIgnoredUrls(config.endpoint),
        applyCustomAttributesOnSpan: (span, request, result) => {
          // Enriquecer el span con info adicional
          if (result instanceof Response) {
            span.setAttribute("http.response_content_length", 
              parseInt(result.headers.get("content-length") ?? "0") || 0
            );
          }
          // Marcar el tipo de request para filtrar en dashboards
          span.setAttribute("atlascore.instrumentation", "fetch");
          void request;
        },
      })
    );
    logger.debug("Instrumentación Fetch registrada");
  }

  // --- XMLHttpRequest: instrumenta llamadas XHR ---
  if (config.trackXHR) {
    instrumentations.push(
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: [/.*/],
        ignoreUrls: getIgnoredUrls(config.endpoint),
      })
    );
    logger.debug("Instrumentación XMLHttpRequest registrada");
  }

  registerInstrumentations({
    instrumentations,
    tracerProvider: provider,
  });

  logger.info(
    `${instrumentations.length} instrumentaciones automáticas activas`
  );
}
