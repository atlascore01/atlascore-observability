# Métodos de Despliegue del Web SDK
## Frontend Observability Capability

El SDK de Frontend Observability de **AtlasCore** está diseñado para ser flexible en su adopción. Ofrecemos cuatro métodos oficiales de despliegue según el nivel de acceso al código fuente, requerimientos de performance y flujos de trabajo del equipo.

---

## 📊 Matriz Comparativa de Métodos

| Método | Modifica Código | Complejidad | Caso de Uso Principal | Rendimiento |
|---|---|---|---|---|
| **1. NPM Package** | Sí | Media | Aplicaciones modernas propias (React, Vue, NextJS) | Excelente (compilado en el bundle) |
| **2. Script Tag UMD** | Sí | Baja | Sitios web tradicionales estáticos, HTML simple | Muy bueno (carga asíncrona) |
| **3. Google Tag Manager** | No | Baja | Sitios de marketing, landings corporativas, zero-code | Bueno (sujeto a la carga de GTM) |
| **4. Reverse Proxy (Nginx)** | No | Alta | Sitios legados donde no hay acceso al repositorio | Muy bueno (inyectado en el borde) |

---

## 1. Paquete NPM (`@atlascore/web-sdk`)

Es el método estándar para aplicaciones modernas donde el equipo de desarrollo tiene acceso al repositorio y utiliza un bundler (Vite, Webpack, etc.).

### Instalación
```bash
npm install @atlascore/web-sdk
```

### Inicialización en Código
```typescript
import { AtlasCore } from "@atlascore/web-sdk";

// Inicializar el SDK lo antes posible (ej. index.ts o App.tsx)
AtlasCore.init({
  application: "mi-aplicacion",
  endpoint: "https://alloy.mi-empresa.com",
});
```

---

## 2. Script Tag UMD (HTML)

Ideal para blogs, sitios estáticos o plataformas administradas (como WordPress o MkDocs) que admiten código HTML directo.

### Añadir en el `<head>` del HTML:
```html
<!-- Cargar el SDK compilado -->
<script src="https://cdn.mi-empresa.com/atlascore-web-sdk.umd.js" defer></script>

<!-- Inicializar -->
<script>
  window.addEventListener("DOMContentLoaded", () => {
    if (window.AtlasCore) {
      window.AtlasCore.init({
        application: "mi-sitio-estatico",
        endpoint: "https://alloy.mi-empresa.com"
      });
    }
  });
</script>
```

---

## 3. Google Tag Manager (GTM)

Permite el despliegue a través del contenedor de GTM. Ideal para equipos que no quieren recompilar la aplicación o dependen de flujos de aprobación de marketing.

### Instrucciones breves:
1. Sube `atlascore-web-sdk.umd.js` a tu hosting o utiliza un CDN.
2. Crea una etiqueta **Custom HTML (HTML Personalizado)** en GTM.
3. Configura la inicialización asíncrona y robusta:

```html
<script src="https://cdn.mi-empresa.com/atlascore-web-sdk.umd.js" defer></script>
<script>
  (function () {
    function init() {
      if (window.AtlasCore) {
        window.AtlasCore.init({
          application: "mi-web-gtm",
          endpoint: "https://alloy.mi-empresa.com"
        });
      } else {
        setTimeout(init, 50);
      }
    }
    init();
  })();
</script>
```
4. Configura el trigger para activarse en **All Pages (Todas las páginas)** y publica el contenedor.

---

## 4. Inyección en Reverse Proxy (Nginx)

Permite instrumentar aplicaciones sin realizar ningún cambio en la infraestructura de la aplicación ni en sus tags de contenedor, inyectando el script directamente en las respuestas HTML en el borde (Edge).

### Configuración en Nginx (módulo `ngx_http_sub_filter_module`):

```nginx
server {
    listen 80;
    server_name atlascore.com.ar;

    location / {
        proxy_pass http://backend_landing;
        
        # Filtro de sustitución para inyectar el SDK al final del <head>
        sub_filter '</head>' '
<script src="https://cdn.mi-empresa.com/atlascore-web-sdk.umd.js" defer></script>
<script>
  window.addEventListener("DOMContentLoaded", function() {
    if (window.AtlasCore) {
      window.AtlasCore.init({
        application: "atlascore-landing",
        endpoint: "https://alloy.mi-empresa.com"
      });
    }
  });
</script>
</head>';
        
        # Ejecutar la inyección una única vez por respuesta
        sub_filter_once on;
        
        # Asegura que Nginx no intente comprimir antes de realizar la sustitución
        proxy_set_header Accept-Encoding "";
    }
}
```

### Ventajas:
* **Zero Touch**: 100% transparente para los desarrolladores y el equipo de marketing.
* **Seguridad**: Control total sobre qué scripts se sirven desde la infraestructura de red propia.
