/**
 * AtlasCore Web SDK - Public API
 */

import { AtlasCore } from "./atlascore";

// Exportar la clase/objeto principal para usuarios de ESM
export { AtlasCore };

// Exportar funciones directamente para que en el UMD de navegador
// se expongan directamente bajo window.AtlasCore.init(), etc.
export const init = AtlasCore.init.bind(AtlasCore);
export const getTracer = AtlasCore.getTracer.bind(AtlasCore);
export const flush = AtlasCore.flush.bind(AtlasCore);
export const shutdown = AtlasCore.shutdown.bind(AtlasCore);

// Tipos
export type { AtlasCoreConfig } from "./core/config";
export type { AtlasPlugin } from "./core/plugin";

// Plugins
export { PageLoad } from "./plugins/page-load";
export { Network } from "./plugins/network";
export { Errors } from "./plugins/errors";
export { Sessions } from "./plugins/sessions";
