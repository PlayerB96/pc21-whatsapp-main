const express = require("express");
const cors = require("cors");
const { whatsapp } = require("./lib/whatsapp");
const app = express();

const puerto = process.env.PORT || 3001;

// Middlewares globales
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '10mb' })); // Aumentar límite para imágenes
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'WhatsApp API'
  });
});

// Rutas principales
app.use("/api/whatsapp", require("./routes/whatsappRoutes"));

// Ruta de fallback para mantener compatibilidad con rutas existentes
app.use("", require("./routes/whatsappRoutes"));

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    res: false,
    error: 'Endpoint no encontrado',
    availableEndpoints: [
      'POST /lead',
      'POST /group_message', 
      'GET /status',
      'GET /health'
    ]
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    res: false,
    error: 'Error interno del servidor'
  });
});

// Inicializar WhatsApp
whatsapp.initialize();

app.listen(puerto, () => {
  console.log(`🚀 WhatsApp API Server running on port ${puerto}`);
  console.log(`📱 Health check: http://localhost:${puerto}/health`);
});
