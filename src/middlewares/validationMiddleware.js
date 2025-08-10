const WhatsappModel = require("../models/WhatsappModel");

class ValidationMiddleware {
  constructor() {
    this.model = new WhatsappModel();
  }

  validateRequiredFields(requiredFields) {
    return (req, res, next) => {
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res
          .status(400)
          .json(
            this.model.createResponse(
              false,
              null,
              `Campos requeridos faltantes: ${missingFields.join(", ")}`
            )
          );
      }

      next();
    };
  }

  validateJsonContent(req, res, next) {
    if (req.method === "POST" || req.method === "PUT") {
      if (!req.is("application/json")) {
        return res
          .status(400)
          .json(
            this.model.createResponse(
              false,
              null,
              "Content-Type debe ser application/json"
            )
          );
      }
    }
    next();
  }

  validateMessageType = (req, res, next) => {
    const { tipo, imageUrls } = req.body;

    if (tipo) {
      const validation = this.model.validateMessageType(tipo);
      if (!validation.isValid) {
        return res
          .status(400)
          .json(this.model.createResponse(false, null, validation.error));
      }

      if (tipo === this.model.messageTypes.IMAGE) {
        const urlValidation = this.model.validateImageUrls(imageUrls);
        if (!urlValidation.isValid) {
          return res
            .status(400)
            .json(this.model.createResponse(false, null, urlValidation.error));
        }
      }
    }

    next();
  };

  sanitizeInput(req, res, next) {
    // Limpiar espacios en blanco de strings
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    }
    next();
  }

  logRequest(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);

    // Log del body (sin datos sensibles)
    if (req.body && Object.keys(req.body).length > 0) {
      const logBody = { ...req.body };
      // Ocultar información sensible si es necesario
      if (logBody.message && logBody.message.length > 100) {
        logBody.message = logBody.message.substring(0, 100) + "...";
      }
    }

    next();
  }

  handleErrors = (err, req, res, next) => {
    console.error("Error capturado por middleware:", err);
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res
        .status(400)
        .json(this.model.createResponse(false, null, "JSON malformado"));
    }
    res
      .status(500)
      .json(
        this.model.createResponse(false, null, "Error interno del servidor")
      );
  };

  /**
   * Middleware para limitar la frecuencia de llamadas por IP o identificador
   * @param {number} intervalSeconds - Tiempo mínimo entre peticiones en segundos
   * @returns {Function}
   */
  rateLimit(intervalSeconds = 5) {
    const cooldownMap = new Map(); // clave: IP, valor: timestamp

    return (req, res, next) => {
      const key = req.ip; // puedes usar también req.body.phone, etc.
      const now = Date.now();

      if (cooldownMap.has(key)) {
        const lastAccess = cooldownMap.get(key);
        const diff = (now - lastAccess) / 1000;

        if (diff < intervalSeconds) {
          return res
            .status(429)
            .json(
              this.model.createResponse(
                false,
                null,
                `Espera ${Math.ceil(
                  intervalSeconds - diff
                )} segundos antes de volver a intentar`
              )
            );
        }
      }

      cooldownMap.set(key, now);
      next();
    };
  }
}

module.exports = new ValidationMiddleware();
