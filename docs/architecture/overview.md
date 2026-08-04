# Arquitectura General

## Introducción

AtlasCore Observability es una plataforma modular que integra diferentes fuentes de telemetría utilizando estándares abiertos para proporcionar una visión unificada del estado de aplicaciones, infraestructura y servicios.

La plataforma se basa en OpenTelemetry como estándar de instrumentación y utiliza el ecosistema open source de Grafana para el almacenamiento y visualización de la información.

---

# Objetivos de la Arquitectura

La arquitectura fue diseñada para cumplir los siguientes objetivos:

- Modularidad
- Escalabilidad
- Alta disponibilidad
- Bajo acoplamiento
- Independencia de proveedores
- Reutilización de componentes
- Observabilidad de extremo a extremo

---

# Arquitectura de Alto Nivel

```text
                    +----------------------+
                    |    Aplicaciones      |
                    |----------------------|
                    | Frontend             |
                    | Backend              |
                    | Bases de Datos       |
                    | Infraestructura      |
                    +----------+-----------+
                               |
                               |
                 OpenTelemetry / Exporters / eBPF
                               |
                               ▼
                    +----------------------+
                    |    Grafana Alloy     |
                    +----------+-----------+
                               |
       +-----------+-----------+-----------+-----------+
       |           |           |           |           |
       ▼           ▼           ▼           ▼           ▼
   Mimir        Loki        Tempo     Pyroscope   Prometheus
       \           |           |           |           /
        \          |           |           |          /
         +-------------------------------------------+
                             |
                             ▼
                     Grafana OSS
                             |
                             ▼
              AtlasCore Dashboards & Alertas
```

---

# Capas de la Plataforma

La plataforma se divide en cinco capas funcionales.

## 1. Instrumentación

Responsable de capturar la telemetría desde los distintos sistemas.

Ejemplos:

- OpenTelemetry SDK
- Grafana Beyla
- Node Exporter
- Windows Exporter
- SNMP Exporter
- PostgreSQL Exporter

---

## 2. Recolección

La información es recibida por Grafana Alloy utilizando OTLP y otros protocolos compatibles.

Alloy centraliza la recepción, procesamiento y distribución de la telemetría.

---

## 3. Almacenamiento

Cada tipo de dato se almacena en una plataforma especializada.

| Tipo | Plataforma |
|-------|------------|
| Métricas | Grafana Mimir |
| Logs | Grafana Loki |
| Trazas | Grafana Tempo |
| Perfiles | Grafana Pyroscope |

---

## 4. Visualización

Grafana OSS proporciona dashboards, exploración de datos, correlación y alertas.

AtlasCore incorpora dashboards predefinidos sobre Grafana.

---

## 5. Consumo

La información será utilizada por distintos perfiles.

- DevOps
- SRE
- Networking
- Desarrollo
- Operaciones
- Negocio

Cada perfil dispondrá de dashboards adaptados a sus necesidades.

---

# Principios Arquitectónicos

La plataforma sigue los siguientes principios.

## OpenTelemetry First

Toda nueva instrumentación deberá utilizar OpenTelemetry siempre que sea posible.

---

## Vendor Neutral

Ningún componente debe depender exclusivamente de un proveedor específico.

---

## Modularidad

Cada módulo podrá instalarse o eliminarse de forma independiente.

---

## Reutilización

Todos los dashboards, alertas y configuraciones deberán poder reutilizarse entre distintos clientes.

---

## Automatización

Toda configuración deberá poder desplegarse mediante Infrastructure as Code.

---

# Evolución

La arquitectura permite incorporar nuevos módulos sin modificar los existentes.

Ejemplos:

- SAP Observability
- Oracle Observability
- VMware Observability
- Cisco Observability
- Kubernetes Observability

Todos seguirán la misma arquitectura general.

---

# Próximo Documento

El siguiente documento describe el flujo completo de la telemetría desde el origen hasta la visualización.

Ver: **Telemetry Pipeline**