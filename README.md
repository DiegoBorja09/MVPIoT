# MVPMixer - IoT Monitoring Dashboard

MVP rápido para monitoreo IoT con sensores que envían datos a un webhook y visualización en un dashboard web.

## 🚀 Características

- ✅ Recepción de webhooks con validación de payload (MVP sin secret)
- ✅ Almacenamiento en PostgreSQL con Prisma ORM
- ✅ Dashboard interactivo con gráficas de línea
- ✅ Medidores tipo gauge para valores numéricos
- ✅ Indicadores LED para estados ON/OFF
- ✅ Rangos de tiempo: LIVE, 1H, 1D, 7D, 15D
- ✅ Polling automático para modo LIVE (cada 3 segundos)
- ✅ Idempotencia en la ingesta de datos

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL
- npm o yarn

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Editar `.env` y configurar:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mvpmixer?schema=public"
```
(En este MVP el webhook no requiere `WEBHOOK_SECRET`.)

3. **Configurar la base de datos:**
```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas en la base de datos
npm run db:push
```

4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

5. **Abrir en el navegador:**
```
http://localhost:3000/dashboard
```

## 📡 Endpoints API

### Webhook (POST /api/webhook)
Recibe datos de los sensores IoT. En este MVP no se requiere autenticación por secret.

**Body:**
```json
{
  "event_id": "EVENT_UUID",
  "webhook_id": "WEBHOOK_ID",
  "device_id": "DEVICE_UUID",
  "thing_id": "THING_UUID",
  "values": [
    {
      "id": "PROPERTY_UUID",
      "name": "humidity",
      "value": "65.5",
      "persist": true,
      "updated_at": "2024-01-01T12:00:00Z",
      "created_by": "USERID"
    }
  ]
}
```

### Obtener Dispositivos (GET /api/devices)
Lista todos los dispositivos registrados.

### Obtener Datos (GET /api/data)
Obtiene datos históricos de una propiedad.

**Query Parameters:**
- `device_id`: UUID del dispositivo
- `property`: Nombre de la propiedad
- `range`: Rango de tiempo (LIVE, 1H, 1D, 7D, 15D)

## 🗄️ Estructura de Base de Datos

- **Device**: Información de dispositivos IoT
- **Property**: Propiedades/métricas de cada dispositivo
- **PropertyValue**: Valores históricos con timestamps

## 📦 Stack Tecnológico

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Gráficas**: Recharts
- **Estilos**: Tailwind CSS
- **Validación**: Zod

## 🔒 Seguridad

- Validación de payloads con Zod
- Idempotencia para prevenir duplicados
- (Opcional en el futuro: autenticación por header `X-Webhook-Key` / `WEBHOOK_SECRET`)

## 📝 Notas

- Los valores se parsean automáticamente (número, booleano, string)
- Las fechas se almacenan en UTC
- El modo LIVE hace polling cada 3 segundos
- Los valores con `persist: false` se guardan pero pueden filtrarse
