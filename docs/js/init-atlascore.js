/**
 * Inicialización simplificada de AtlasCore Web SDK para la Landing/Docs
 */
(function () {
  function initSDK() {
    if (window.AtlasCore) {
      // Inicializar el SDK de forma directa y simplificada (el entorno y preset se infieren automáticamente)
      window.AtlasCore.init({
        application: "atlascore-landing",
        endpoint: "http://localhost:4318", // Endpoint de Grafana Alloy
        debug: true
      });
      console.log("[AtlasCore] SDK inicializado directamente en la landing page.");
    } else {
      console.error("[AtlasCore] Error: window.AtlasCore no está definido.");
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initSDK();
  } else {
    document.addEventListener("DOMContentLoaded", initSDK);
  }
})();
