/**
 * AtlasCore Web SDK - Error Tracking
 *
 * Captura errores JavaScript no manejados y Promise rejections,
 * los convierte en spans de OTel y los envía como trazas de error.
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";
import { getSessionAttributes } from "../core/session";
import type { ResolvedConfig } from "../core/config";
import { logger } from "../core/logger";

const TRACER_NAME = "@atlascore/web-sdk";

/**
 * Registra los listeners globales de errores.
 * Retorna una función cleanup para desregistrarlos.
 */
export function setupErrorTracking(config: ResolvedConfig): () => void {
  if (!config.trackErrors) {
    return () => {};
  }

  const tracer = trace.getTracer(TRACER_NAME);
  const sessionAttrs = getSessionAttributes();

  // --- Handler para errores JavaScript sincrónicos ---
  const errorHandler = (event: ErrorEvent) => {
    const span = tracer.startSpan("browser.error");

    span.setAttributes({
      ...sessionAttrs,
      "error.type": "javascript_error",
      "error.message": event.message,
      "error.filename": event.filename,
      "error.lineno": event.lineno,
      "error.colno": event.colno,
      "page.url": window.location.href,
      "page.path": window.location.pathname,
    });

    if (event.error instanceof Error) {
      span.setAttributes({
        "error.stack": event.error.stack ?? "",
        "error.name": event.error.name,
      });
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message: event.message });
    span.end();

    logger.debug("Error capturado:", event.message);
  };

  // --- Handler para Promise rejections no manejadas ---
  const rejectionHandler = (event: PromiseRejectionEvent) => {
    const span = tracer.startSpan("browser.unhandled_rejection");

    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : String(reason);

    span.setAttributes({
      ...sessionAttrs,
      "error.type": "unhandled_rejection",
      "error.message": message,
      "page.url": window.location.href,
      "page.path": window.location.pathname,
    });

    if (reason instanceof Error) {
      span.setAttributes({
        "error.stack": reason.stack ?? "",
        "error.name": reason.name,
      });
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message });
    span.end();

    logger.debug("Promise rejection capturada:", message);
  };

  window.addEventListener("error", errorHandler);
  window.addEventListener("unhandledrejection", rejectionHandler);

  logger.info("Error tracking activo");

  // Retorna cleanup
  return () => {
    window.removeEventListener("error", errorHandler);
    window.removeEventListener("unhandledrejection", rejectionHandler);
  };
}
