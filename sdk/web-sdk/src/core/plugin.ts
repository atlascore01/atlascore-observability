import type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import type { ResolvedConfig } from "./config";

/**
 * Interfaz que deben implementar todos los plugins de AtlasCore.
 */
export interface AtlasPlugin {
  /** Nombre único del plugin */
  name: string;

  /**
   * Método de inicialización del plugin.
   * Se ejecuta durante la inicialización de AtlasCore.init().
   *
   * Puede retornar una función de limpieza (cleanup) que se ejecutará
   * cuando se llame a AtlasCore.shutdown().
   *
   * @param provider - El proveedor de trazas de OpenTelemetry
   * @param config - La configuración resuelta del SDK
   */
  setup(provider: WebTracerProvider, config: ResolvedConfig): void | (() => void);
}
