/**
 * AtlasCore Web SDK - Punto de entrada principal
 *
 * Esta clase es la única API pública que los clientes deben conocer.
 * Toda la complejidad de OpenTelemetry vive detrás de este facade.
 *
 * Uso:
 *   import { AtlasCore } from "@atlascore/web-sdk";
 *
 *   AtlasCore.init({
 *     application: "mi-app",
 *     environment: "production",
 *     endpoint: "http://localhost:4318",
 *   });
 */

import { trace } from "@opentelemetry/api";
import type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";

import type { AtlasCoreConfig } from "./core/config";
import { resolveConfig } from "./core/config";
import { logger } from "./core/logger";
import { buildResource } from "./telemetry/resources";
import { createTraceProvider } from "./telemetry/traces";
import { registerAutoInstrumentations } from "./browser/instrumentation";
import { setupErrorTracking } from "./browser/errors";

// Estado interno del SDK (singleton)
let _initialized = false;
let _provider: WebTracerProvider | null = null;
let _cleanupErrors: (() => void) | null = null;

export const AtlasCore = {
  /**
   * Inicializa el SDK con la configuración del usuario.
   * Debe llamarse una sola vez, lo antes posible (idealmente en el <head>).
   *
   * @param config - Configuración del SDK
   */
  init(config: AtlasCoreConfig): void {
    if (_initialized) {
      logger.warn(
        "AtlasCore.init() fue llamado más de una vez. Ignorando llamada duplicada."
      );
      return;
    }

    // 1. Resolver configuración (aplicar defaults)
    const resolved = resolveConfig(config);

    // 2. Inicializar logger
    logger.init(resolved.debug);
    logger.info("Inicializando AtlasCore Web SDK...", {
      application: resolved.application,
      environment: resolved.environment,
      endpoint: resolved.endpoint,
    });

    // 3. Construir Resource
    const resource = buildResource(resolved);

    // 4. Crear y registrar el TraceProvider
    _provider = createTraceProvider(resolved, resource);
    _provider.register();

    // 5. Registrar instrumentaciones automáticas
    registerAutoInstrumentations(_provider, resolved);

    // 6. Configurar error tracking
    _cleanupErrors = setupErrorTracking(resolved);

    // 7. Registrar flush antes de cerrar la página
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        void _provider?.forceFlush?.();
        logger.debug("Flush enviado (visibilitychange)");
      }
    });

    _initialized = true;
    logger.info("✓ AtlasCore Web SDK listo");
  },

  /**
   * Retorna el tracer de OTel para uso manual (spans custom).
   * Solo disponible después de init().
   *
   * @param name - Nombre del tracer (ej: "mi-componente")
   */
  getTracer(name: string = "@atlascore/web-sdk") {
    if (!_initialized) {
      logger.warn("AtlasCore.getTracer() llamado antes de init()");
    }
    return trace.getTracer(name);
  },

  /**
   * Indica si el SDK fue inicializado.
   */
  get isInitialized(): boolean {
    return _initialized;
  },

  /**
   * Fuerza el envío de todos los spans pendientes.
   * Útil antes de navegar fuera de la SPA o hacer logout.
   */
  async flush(): Promise<void> {
    if (_provider) {
      await _provider.forceFlush?.();
      logger.debug("Flush manual completado");
    }
  },

  /**
   * Detiene el SDK y libera recursos.
   * Normalmente no hace falta llamarlo; es útil para tests.
   */
  async shutdown(): Promise<void> {
    if (_cleanupErrors) {
      _cleanupErrors();
      _cleanupErrors = null;
    }
    if (_provider) {
      await _provider.shutdown();
      _provider = null;
    }
    _initialized = false;
    logger.info("AtlasCore Web SDK detenido");
  },
};
