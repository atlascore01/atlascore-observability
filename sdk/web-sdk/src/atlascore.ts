/**
 * AtlasCore Web SDK - Punto de entrada principal
 *
 * Facade que encapsula e inicializa todos los plugins y la instrumentación de OTel.
 */

import { trace } from "@opentelemetry/api";
import type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";

import type { AtlasCoreConfig } from "./core/config";
import { resolveConfig } from "./core/config";
import { logger } from "./core/logger";
import { buildResource } from "./telemetry/resources";
import { createTraceProvider } from "./telemetry/traces";
import { getPresetPlugins } from "./core/presets";

// Estado interno del SDK (singleton)
let _initialized = false;
let _provider: WebTracerProvider | null = null;
const _cleanups: (() => void)[] = [];

export const AtlasCore = {
  /**
   * Inicializa el SDK de forma modular.
   * Carga los presets y plugins configurados.
   *
   * @param config - Configuración de AtlasCore
   */
  init(config: AtlasCoreConfig): void {
    if (_initialized) {
      logger.warn(
        "AtlasCore.init() fue llamado más de una vez. Ignorando llamada duplicada."
      );
      return;
    }

    // 1. Resolver configuración (entorno auto-inferido, presets por defecto)
    const resolved = resolveConfig(config);

    // 2. Inicializar logger
    logger.init(resolved.debug);
    logger.info("Inicializando AtlasCore Web SDK...", {
      application: resolved.application,
      environment: resolved.environment,
      endpoint: resolved.endpoint,
      preset: resolved.preset,
    });

    // 3. Obtener plugins combinados (preset + plugins custom)
    const presetPlugins = getPresetPlugins(resolved.preset);
    const allPlugins = [...presetPlugins, ...resolved.plugins];
    logger.debug(`Combinando ${presetPlugins.length} plugins de preset con ${resolved.plugins.length} plugins custom`);

    // 4. Construir Resource
    const resource = buildResource(resolved);

    // 5. Crear y registrar el TraceProvider
    _provider = createTraceProvider(resolved, resource);
    _provider.register();

    // 6. Inicializar todos los plugins
    allPlugins.forEach((plugin) => {
      try {
        logger.debug(`Inicializando plugin: ${plugin.name}`);
        const cleanup = plugin.setup(_provider!, resolved);
        if (typeof cleanup === "function") {
          _cleanups.push(cleanup);
        }
      } catch (err) {
        logger.error(`Error inicializando plugin '${plugin.name}':`, err);
      }
    });

    // 7. Registrar flush antes de cerrar la página
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        void _provider?.forceFlush?.();
        logger.debug("Flush enviado (visibilitychange)");
      }
    });

    _initialized = true;
    logger.info(`✓ AtlasCore Web SDK inicializado con éxito. (${allPlugins.length} plugins activos)`);
  },

  /**
   * Retorna el tracer de OTel para spans manuales de negocio.
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
   */
  async flush(): Promise<void> {
    if (_provider) {
      await _provider.forceFlush?.();
      logger.debug("Flush manual completado");
    }
  },

  /**
   * Detiene el SDK y limpia todos los plugins.
   */
  async shutdown(): Promise<void> {
    // Ejecutar cleanups de plugins
    logger.debug(`Ejecutando ${_cleanups.length} cleanups de plugins...`);
    _cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (err) {
        logger.error("Error ejecutando cleanup de plugin:", err);
      }
    });
    _cleanups.length = 0;

    if (_provider) {
      await _provider.shutdown();
      _provider = null;
    }
    _initialized = false;
    logger.info("AtlasCore Web SDK detenido");
  },
};
