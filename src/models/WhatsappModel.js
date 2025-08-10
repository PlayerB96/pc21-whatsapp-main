class WhatsappModel {
  constructor() {
    this.messageTypes = {
      TEXT: "texto",
      IMAGE: "imagen",
    };
  }

  validatePhone(phone) {
    if (!phone || typeof phone !== "string") {
      return { isValid: false, error: "Número de teléfono requerido" };
    }

    // Normaliza el número agregando +51 si no tiene prefijo
    const normalizedPhone = phone.startsWith("+") ? phone : `+51${phone}`;
    const chatId = normalizedPhone.replace("+", "") + "@c.us";

    return {
      isValid: true,
      normalizedPhone,
      chatId,
    };
  }

  validateInviteCode(rawCode) {
    if (!rawCode || typeof rawCode !== "string") {
      return { isValid: false, error: "Código de invitación requerido" };
    }

    const match = rawCode.match(/(?:chat\.whatsapp\.com\/)?([A-Za-z0-9]{20,})/);
    const inviteCode = match ? match[1] : null;

    if (!inviteCode) {
      return { isValid: false, error: "Código de invitación inválido" };
    }

    return { isValid: true, inviteCode };
  }

  validateMessageType(tipo) {
    const validTypes = Object.values(this.messageTypes);

    if (!tipo || !validTypes.includes(tipo)) {
      return {
        isValid: false,
        error: `Tipo no válido. Debe ser "${this.messageTypes.TEXT}" o "${this.messageTypes.IMAGE}"`,
      };
    }

    return { isValid: true, tipo };
  }

  validateImageUrls(imageUrls) {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return {
        isValid: false,
        error:
          "Debe enviar imageUrls como arreglo con al menos un objeto { imagen, message }",
      };
    }

    const urlRegex = /^https?:\/\/.+/;

    for (let i = 0; i < imageUrls.length; i++) {
      const entry = imageUrls[i];
      if (
        typeof entry !== "object" ||
        !entry.imagen ||
        typeof entry.imagen !== "string" ||
        !urlRegex.test(entry.imagen)
      ) {
        return {
          isValid: false,
          error: `Entrada inválida en imageUrls en índice ${i}. Se esperaba { imagen: URL, message: texto }`,
        };
      }
    }

    return { isValid: true, imageUrls };
  }

  createResponse(success, data = null, error = null) {
    return {
      res: success,
      ...(data && { results: data }),
      ...(error && { error }),
    };
  }

  createResult(
    identifier,
    status,
    message = null,
    error = null,
    additionalData = {}
  ) {
    return {
      [typeof identifier === "string" && identifier.includes("@")
        ? "number"
        : "inviteCode"]: identifier,
      status,
      ...(message && { message }),
      ...(error && { error }),
      ...additionalData,
    };
  }
}

module.exports = WhatsappModel;
