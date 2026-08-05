/**
 * AtlasCore Web SDK - Trace Provider
 *
 * Configura y retorna el WebTracerProvider de OTel con:
 * - OTLP HTTP Exporter apuntando al endpoint del usuario
 * - BatchSpanProcessor para enviar en lotes (eficiente)
 * - SimpleSpanProcessor para flush antes de unload (garantizar envío)
 * - Resource con todos los atributos del SDK
 */

import {
  WebTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import type { Resource } from "@opentelemetry/resources";
import type { ResolvedConfig } from "../core/config";
import { logger } from "../core/logger";

export function createTraceProvider(
  config: ResolvedConfig,
  resource: Resource
): WebTracerProvider {
  const exporter = new OTLPTraceExporter({
    url: `${config.endpoint}/v1/traces`,
    headers: {
      // Cabecera custom para identificar el SDK en el collector
      "X-AtlasCore-SDK": "@atlascore/web-sdk",
    },
  });

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      // BatchSpanProcessor: agrupa spans y los envía en lotes
      new BatchSpanProcessor(exporter, {
        scheduledDelayMillis: config.exportIntervalMs,
        maxExportBatchSize: 512,
        maxQueueSize: 2048,
      }),
      // SimpleSpanProcessor con otro exporter para el flush en unload
      // Esto garantiza que los spans pendientes se envíen antes de cerrar la página
      new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url: `${config.endpoint}/v1/traces`,
        })
      ),
    ],
  });

  logger.debug("TraceProvider inicializado →", config.endpoint);
  return provider;
}
