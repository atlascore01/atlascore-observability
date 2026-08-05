/**
 * Inicialización de AtlasCore Web SDK para la Landing/Docs de AtlasCore
 */
(function () {
  // Esperar a que el SDK esté disponible en el objeto global window
  function initSDK() {
    if (window.AtlasCoreWebSDK) {
      const { AtlasCore } = window.AtlasCoreWebSDK;
      
      // Inicializar el SDK
      AtlasCore.init({
        application: "atlascore-landing",
        environment: "development", // Cambiar a "production" al desplegar
        endpoint: "http://localhost:4318", // Endpoint de Grafana Alloy
        debug: true,
        serviceVersion: "0.1.0"
      });
      
      console.log("[AtlasCore] SDK inicializado en la landing page.");
    } else {
      console.error("[AtlasCore] Error: AtlasCoreWebSDK no está cargado globalmente.");
    }
  }

  // Ejecutar cuando el DOM esté listo o inmediatamente si ya lo está
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initSDK();
  } else {
    document.addEventListener("DOMContentLoaded", initSDK);
  }
})();
