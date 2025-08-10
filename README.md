# WhatsApp API con Arquitectura MVC

API para envío de mensajes de WhatsApp utilizando el patrón de diseño MVC (Modelo-Vista-Controlador).

## 🏗️ Arquitectura

```
src/
├── controllers/          # Controladores - Lógica de manejo de peticiones HTTP
│   └── whatsappController.js
├── models/              # Modelos - Validaciones y estructura de datos
│   └── WhatsappModel.js
├── services/            # Servicios - Lógica de negocio
│   └── whatsappService.js
├── middlewares/         # Middlewares - Validaciones y procesamiento intermedio
│   └── validationMiddleware.js
├── utils/               # Utilidades - Funciones auxiliares
│   └── helpers.js
├── routes/              # Rutas - Definición de endpoints
│   └── whatsappRoutes.js
├── lib/                 # Librerías - Configuraciones externas
│   └── whatsapp.js
└── index.js            # Punto de entrada de la aplicación
```

## 🚀 Características

- ✅ Arquitectura MVC implementada
- ✅ Validaciones robustas
- ✅ Manejo de errores centralizado
- ✅ Logging de peticiones
- ✅ Sanitización de datos
- ✅ Documentación de API
- ✅ Endpoints de health check
- ✅ Soporte para múltiples formatos

## 📡 Endpoints

### POST /lead
Envía mensajes a números de teléfono individuales.

**Body:**
```json
{
  "phone": "987654321,123456789",  // Números separados por comas
  "message": "Hola, este es un mensaje de prueba"
}
```

### POST /group_message
Envía mensajes a grupos de WhatsApp.

**Body para mensaje de texto:**
```json
{
  "groupCodes": "codigo1,codigo2",  // Códigos de invitación separados por comas
  "message": "Mensaje para el grupo",
  "tipo": "texto"
}
```

**Body para mensaje con imágenes:**
```json
{
  "groupCodes": "codigo1,codigo2",
  "message": "Mensaje con imágenes",
  "tipo": "imagen",
  "imageUrls": [
    "https://ejemplo.com/imagen1.jpg",
    "https://ejemplo.com/imagen2.png"
  ]
}
```

### GET /status
Verifica el estado de la API.

### GET /health
Health check de la aplicación.

## 🔧 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start

# Verificar sintaxis
npm test
```

## 🐳 Docker

```bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run
```

## 📝 Respuestas de la API

Todas las respuestas siguen el siguiente formato:

**Éxito:**
```json
{
  "res": true,
  "results": [
    {
      "number": "+51987654321",
      "status": "success",
      "message": "Mensaje enviado correctamente"
    }
  ]
}
```

**Error:**
```json
{
  "res": false,
  "error": "Descripción del error"
}
```

## 🛡️ Características de Seguridad

- Validación de entrada de datos
- Sanitización de strings
- Manejo seguro de errores
- Logging de peticiones
- Límites de tamaño de payload

## 🏛️ Patrones Implementados

### MVC (Modelo-Vista-Controlador)
- **Modelo**: Validaciones y estructura de datos (`WhatsappModel`)
- **Vista**: Respuestas JSON (no se necesita vista tradicional en API)
- **Controlador**: Manejo de peticiones HTTP (`WhatsappController`)

### Patrón Service
- Separación de lógica de negocio en servicios (`WhatsappService`)

### Middleware Pattern
- Procesamiento de peticiones por capas (`ValidationMiddleware`)

### Repository Pattern (implícito)
- Abstracción de acceso a datos a través de servicios

