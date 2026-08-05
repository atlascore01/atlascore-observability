/**
 * AtlasCore Web SDK - Session Manager
 *
 * Genera y persiste un Session ID y un Anonymous User ID usando sessionStorage/localStorage.
 * No recolecta ningún dato personal. Solo genera identificadores anónimos para
 * poder correlacionar eventos dentro de una misma sesión/usuario.
 */

const SESSION_KEY = "atlascore.session_id";
const USER_KEY = "atlascore.user_id";

/**
 * Genera un UUID v4 simple sin dependencias externas.
 */
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retorna el Session ID actual o crea uno nuevo.
 * El session ID vive en sessionStorage (se borra al cerrar la pestaña).
 */
export function getSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    // sessionStorage no disponible (SSR, modo privado estricto, etc.)
    return generateId();
  }
}

/**
 * Retorna el Anonymous User ID o crea uno nuevo.
 * El user ID vive en localStorage (persiste entre sesiones).
 */
export function getAnonymousUserId(): string {
  try {
    let userId = localStorage.getItem(USER_KEY);
    if (!userId) {
      userId = generateId();
      localStorage.setItem(USER_KEY, userId);
    }
    return userId;
  } catch {
    // localStorage no disponible
    return generateId();
  }
}

/**
 * Retorna los atributos de sesión listos para incluir en spans/metrics.
 */
export function getSessionAttributes(): Record<string, string> {
  return {
    "session.id": getSessionId(),
    "user.id": getAnonymousUserId(),
  };
}
