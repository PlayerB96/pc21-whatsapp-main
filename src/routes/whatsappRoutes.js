const { Router } = require("express");
const WhatsappController = require("../controllers/whatsappController");
const validationMiddleware = require("../middlewares/validationMiddleware");

const router = Router();
const whatsappController = new WhatsappController();

// Middleware global para todas las rutas
router.use(validationMiddleware.logRequest);
router.use(validationMiddleware.validateJsonContent);
router.use(validationMiddleware.sanitizeInput);

/**
 * @route POST /lead
 * @description Envía mensajes a números de teléfono individuales
 * @body {string} phone - Números de teléfono separados por comas
 * @body {string} message - Mensaje a enviar
 */
router.post(
  "/lead",
  validationMiddleware.rateLimit(5),
  validationMiddleware.validateRequiredFields(["phone", "message"]),
  whatsappController.sendLeadMessage.bind(whatsappController)
);

/**
 * @route POST /group_message
 * @description Envía mensajes a grupos de WhatsApp
 * @body {string} groupCodes - Códigos de invitación separados por comas
 * @body {string} message - Mensaje a enviar
 * @body {string} tipo - Tipo de mensaje: "texto" o "imagen"
 * @body {Array} imageUrls - URLs de imágenes (requerido si tipo es "imagen")
 */
router.post(
  "/group_message",
  validationMiddleware.rateLimit(5),
  validationMiddleware.validateRequiredFields(["groupCodes", "tipo"]),
  validationMiddleware.validateMessageType,
  whatsappController.sendGroupMessage.bind(whatsappController)
);

/**
 * @route GET /status
 * @description Verifica el estado de la API de WhatsApp
 */
router.get("/status", whatsappController.getStatus.bind(whatsappController));

// Middleware de manejo de errores (debe ir al final)
router.use(validationMiddleware.handleErrors.bind(validationMiddleware));

module.exports = router;
