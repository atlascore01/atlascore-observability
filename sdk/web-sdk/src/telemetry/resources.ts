/**
 * AtlasCore Web SDK - Resources
 *
 * Construye el OTel Resource con todos los atributos del navegador y la aplicación.
 * Un Resource describe "quién" genera la telemetría.
 */

import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from "@opentelemetry/semantic-conventions";
import { getSessionId, getAnonymousUserId } from "../core/session";
import type { ResolvedConfig } from "../core/config";

/**
 * Construye el Resource de OTel para el navegador.
 * Incluye atributos de servicio, browser, página y sesión.
 */
export function buildResource(config: ResolvedConfig): Resource {
  const nav = navigator;
  const loc = window.location;

  return new Resource({
    // --- Atributos de Servicio (OTel standard) ---
    [ATTR_SERVICE_NAME]: config.application,
    [ATTR_SERVICE_VERSION]: config.serviceVersion,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: config.environment,

    // --- Atributos de SDK ---
    "atlascore.sdk.name": "@atlascore/web-sdk",
    "atlascore.sdk.version": "__SDK_VERSION__",

    // --- Atributos de Sesión ---
    "session.id": getSessionId(),
    "user.id": getAnonymousUserId(),

    // --- Atributos de Browser ---
    "browser.language": nav.language,
    "browser.user_agent": nav.userAgent,
    "browser.platform": nav.platform,

    // --- Atributos de Página ---
    "page.url": loc.href,
    "page.path": loc.pathname,
    "page.hostname": loc.hostname,
    "page.title": document.title,

    // --- Referrer ---
    "page.referrer": document.referrer || "(direct)",
  });
}
