/**
 * AtlasCore Web SDK - Logger interno
 *
 * Wrapper sobre console que respeta el flag debug de la configuración.
 * Nunca llama a console en producción salvo que debug=true.
 */

let debugEnabled = false;
const PREFIX = "[AtlasCore]";

export const logger = {
  init(debug: boolean): void {
    debugEnabled = debug;
  },

  debug(...args: unknown[]): void {
    if (debugEnabled) {
      console.debug(PREFIX, ...args);
    }
  },

  info(...args: unknown[]): void {
    if (debugEnabled) {
      console.info(PREFIX, ...args);
    }
  },

  warn(...args: unknown[]): void {
    // Los warnings siempre se muestran (son errores de configuración)
    console.warn(PREFIX, ...args);
  },

  error(...args: unknown[]): void {
    // Los errores siempre se muestran
    console.error(PREFIX, ...args);
  },
};
