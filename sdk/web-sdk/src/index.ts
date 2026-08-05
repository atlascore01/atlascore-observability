/**
 * AtlasCore Web SDK - Public API
 *
 * Este es el único archivo que los clientes importan.
 * Todo lo demás es un detalle de implementación.
 *
 * @example
 * import { AtlasCore } from "@atlascore/web-sdk";
 *
 * AtlasCore.init({
 *   application: "mi-app",
 *   environment: "production",
 *   endpoint: "http://localhost:4318",
 * });
 */

export { AtlasCore } from "./atlascore";
export type { AtlasCoreConfig } from "./core/config";
