import { trace } from "@opentelemetry/api";
import type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import type { AtlasPlugin } from "../core/plugin";
import type { ResolvedConfig } from "../core/config";
import { getSessionAttributes } from "../core/session";
import { logger } from "../core/logger";

const TRACER_NAME = "@atlascore/web-sdk/sessions";

export class SessionsPlugin implements AtlasPlugin {
  name = "sessions";

  setup(_provider: WebTracerProvider, _config: ResolvedConfig): void {
    const tracer = trace.getTracer(TRACER_NAME);
    const sessionAttrs = getSessionAttributes();

    // Generar un span de inicio de sesión único
    // Esto nos permite mapear cuándo se inicia una sesión y contar sesiones en Tempo
    const span = tracer.startSpan("session.start", {
      attributes: {
        ...sessionAttrs,
        "page.url": window.location.href,
        "page.path": window.location.pathname,
        "browser.language": navigator.language,
      },
    });

    // Finalizar inmediatamente el span de inicio de sesión ya que es un evento discreto
    span.end();

    logger.info(`Plugin 'Sessions' inicializado - Session ID: ${sessionAttrs["session.id"]}`);
  }
}

export function Sessions() {
  return new SessionsPlugin();
}
