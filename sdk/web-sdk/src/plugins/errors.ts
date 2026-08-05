import { trace, SpanStatusCode } from "@opentelemetry/api";
import type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import type { AtlasPlugin } from "../core/plugin";
import type { ResolvedConfig } from "../core/config";
import { getSessionAttributes } from "../core/session";
import { logger } from "../core/logger";

const TRACER_NAME = "@atlascore/web-sdk/errors";

export class ErrorsPlugin implements AtlasPlugin {
  name = "errors";

  setup(_provider: WebTracerProvider, config: ResolvedConfig): void | (() => void) {
    if (!config.trackErrors) {
      return;
    }

    const tracer = trace.getTracer(TRACER_NAME);

    // Handler para errores JavaScript sincrónicos
    const errorHandler = (event: ErrorEvent) => {
      const span = tracer.startSpan("browser.error");
      const sessionAttrs = getSessionAttributes();

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

      logger.debug("[ErrorsPlugin] Error capturado:", event.message);
    };

    // Handler para Promise rejections no manejadas
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const span = tracer.startSpan("browser.unhandled_rejection");
      const sessionAttrs = getSessionAttributes();

      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);

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

      logger.debug("[ErrorsPlugin] Promise rejection capturada:", message);
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);

    logger.info("Plugin 'Errors' inicializado y escuchando");

    // Retornamos cleanup
    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
      logger.debug("[ErrorsPlugin] Cleaned up");
    };
  }
}

// Helper factory function
export function Errors() {
  return new ErrorsPlugin();
}
