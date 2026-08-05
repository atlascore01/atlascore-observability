/**
 * AtlasCore Web SDK - Configuración
 *
 * Define la interfaz pública de configuración y el mapeo de presets/plugins.
 */

import type { AtlasPlugin } from "./plugin";
import type { AtlasPresetName } from "./presets";

export interface AtlasCoreConfig {
  /** Nombre de la aplicación (service.name en OTel) */
  application: string;

  /** Endpoint OTLP HTTP (ej: http://localhost:4318) */
  endpoint: string;

  /** Entorno de despliegue. Si se omite, se infiere del hostname */
  environment?: "production" | "staging" | "development" | string;

  /** Preset de plugins a cargar. Default: "frontend-standard" */
  preset?: AtlasPresetName;

  /** Lista de plugins adicionales custom */
  plugins?: AtlasPlugin[];

  /** Versión del servicio (service.version en OTel) */
  serviceVersion?: string;

  /** Intervalo en ms para el batch export de spans. Default: 5000ms */
  exportIntervalMs?: number;

  /** Ratio de sampling. Default: 1.0 */
  sampleRate?: number;

  /** Habilita/deshabilita el logging interno del SDK. Default: false */
  debug?: boolean;

  // --- Flags de compatibilidad para plugins ---
  trackPageViews?: boolean;
  trackFetch?: boolean;
  trackXHR?: boolean;
  trackErrors?: boolean;
}

/**
 * Configuración interna resuelta.
 */
export interface ResolvedConfig extends Required<Omit<AtlasCoreConfig, "plugins">> {
  plugins: AtlasPlugin[];
}

/**
 * Infiere el entorno de ejecución basado en el hostname del navegador.
 */
function inferEnvironment(): string {
  try {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
      return "development";
    }
    if (host.includes("staging") || host.includes("dev.")) {
      return "staging";
    }
    return "production";
  } catch {
    return "production";
  }
}

/**
 * Resuelve la configuración aplicando valores por defecto.
 */
export function resolveConfig(config: AtlasCoreConfig): ResolvedConfig {
  return {
    application: config.application,
    endpoint: config.endpoint,
    environment: config.environment ?? inferEnvironment(),
    preset: config.preset ?? "frontend-standard",
    plugins: config.plugins ?? [],
    serviceVersion: config.serviceVersion ?? "0.0.0",
    exportIntervalMs: config.exportIntervalMs ?? 5000,
    sampleRate: config.sampleRate ?? 1.0,
    trackPageViews: config.trackPageViews ?? true,
    trackFetch: config.trackFetch ?? true,
    trackXHR: config.trackXHR ?? true,
    trackErrors: config.trackErrors ?? true,
    debug: config.debug ?? false,
  };
}
