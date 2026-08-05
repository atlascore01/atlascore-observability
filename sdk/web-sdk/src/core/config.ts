/**
 * AtlasCore Web SDK - Configuración
 *
 * Define la interfaz pública de configuración que el usuario pasa a AtlasCore.init().
 * Internamente, todos los valores tienen defaults sensatos.
 */

export interface AtlasCoreConfig {
  /** Nombre de la aplicación (service.name en OTel) */
  application: string;

  /** Entorno de despliegue: production | staging | development */
  environment: "production" | "staging" | "development" | string;

  /** Versión del servicio (service.version en OTel) */
  serviceVersion?: string;

  /** Endpoint OTLP HTTP (sin path final, ej: http://localhost:4318) */
  endpoint: string;

  /**
   * Intervalo en ms para el batch export de spans.
   * Default: 5000ms
   */
  exportIntervalMs?: number;

  /**
   * Ratio de sampling: 1.0 = 100%, 0.5 = 50%.
   * Default: 1.0
   */
  sampleRate?: number;

  /**
   * Habilita/deshabilita el logging interno del SDK en consola.
   * Default: false
   */
  debug?: boolean;

  /**
   * Habilita la instrumentación automática de Page Views.
   * Default: true
   */
  trackPageViews?: boolean;

  /**
   * Habilita la instrumentación automática de Fetch.
   * Default: true
   */
  trackFetch?: boolean;

  /**
   * Habilita la instrumentación automática de XMLHttpRequest.
   * Default: true
   */
  trackXHR?: boolean;

  /**
   * Habilita la captura de errores JavaScript no manejados.
   * Default: true
   */
  trackErrors?: boolean;
}

/**
 * Configuración interna con todos los valores resueltos (con defaults aplicados).
 */
export interface ResolvedConfig extends Required<AtlasCoreConfig> {}

/**
 * Aplica defaults a la configuración del usuario.
 */
export function resolveConfig(config: AtlasCoreConfig): ResolvedConfig {
  return {
    application: config.application,
    environment: config.environment,
    serviceVersion: config.serviceVersion ?? "0.0.0",
    endpoint: config.endpoint,
    exportIntervalMs: config.exportIntervalMs ?? 5000,
    sampleRate: config.sampleRate ?? 1.0,
    debug: config.debug ?? false,
    trackPageViews: config.trackPageViews ?? true,
    trackFetch: config.trackFetch ?? true,
    trackXHR: config.trackXHR ?? true,
    trackErrors: config.trackErrors ?? true,
  };
}
