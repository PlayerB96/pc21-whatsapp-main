const { whatsapp } = require("../lib/whatsapp");
const axios = require("axios");
const { MessageMedia } = require("whatsapp-web.js");
const WhatsappModel = require("../models/WhatsappModel");

class WhatsappService {
  constructor() {
    this.model = new WhatsappModel();
  }

  async sendLeadMessages(phoneNumbers, message) {
    const results = [];

    for (const number of phoneNumbers) {
      const phoneValidation = this.model.validatePhone(number);

      if (!phoneValidation.isValid) {
        results.push(
          this.model.createResult(number, "error", null, phoneValidation.error)
        );
        continue;
      }

      try {
        // Verifica si el número es válido en WhatsApp
        const numberDetails = await whatsapp.getNumberId(
          phoneValidation.chatId
        );

        if (numberDetails) {
          // Envía el mensaje
          await whatsapp.sendMessage(phoneValidation.chatId, message);
          results.push(
            this.model.createResult(
              phoneValidation.normalizedPhone,
              "success",
              "Mensaje enviado correctamente"
            )
          );
        } else {
          results.push(
            this.model.createResult(
              phoneValidation.normalizedPhone,
              "error",
              null,
              "Número no encontrado en WhatsApp"
            )
          );
        }
      } catch (error) {
        console.error(
          `Error al enviar el mensaje al número ${phoneValidation.normalizedPhone}:`,
          error
        );
        results.push(
          this.model.createResult(
            phoneValidation.normalizedPhone,
            "error",
            null,
            "Error al enviar el mensaje"
          )
        );
      }
    }

    return results;
  }

  async sendGroupMessages(groupCodes, message, tipo, imageUrls = null) {
    const results = [];

    // Validar tipo de mensaje
    const typeValidation = this.model.validateMessageType(tipo);
    if (!typeValidation.isValid) {
      return [this.model.createResult("", "error", null, typeValidation.error)];
    }

    // Si es tipo imagen, validar URLs
    if (tipo === this.model.messageTypes.IMAGE) {
      const urlValidation = this.model.validateImageUrls(imageUrls);
      if (!urlValidation.isValid) {
        return [
          this.model.createResult("", "error", null, urlValidation.error),
        ];
      }
    }

    for (const rawCode of groupCodes) {
      const codeValidation = this.model.validateInviteCode(rawCode);

      if (!codeValidation.isValid) {
        results.push(
          this.model.createResult(
            rawCode,
            "error",
            null,
            codeValidation.error,
            { input: rawCode }
          )
        );
        continue;
      }

      try {
        const inviteInfo = await whatsapp.getInviteInfo(
          codeValidation.inviteCode
        );
        const groupId = inviteInfo.id._serialized;

        if (tipo === this.model.messageTypes.IMAGE) {
          await this.sendImageMessages(
            groupId,
            message,
            imageUrls,
            results,
            codeValidation.inviteCode
          );
        } else if (tipo === this.model.messageTypes.TEXT) {
          await whatsapp.sendMessage(groupId, message);
        }

        results.push(
          this.model.createResult(
            codeValidation.inviteCode,
            "success",
            "Mensaje(s) enviado(s) correctamente",
            null,
            {
              groupName: inviteInfo.subject,
              groupId,
            }
          )
        );
      } catch (error) {
        console.error(
          `Error con código ${codeValidation.inviteCode}:`,
          error.message
        );
        results.push(
          this.model.createResult(
            codeValidation.inviteCode,
            "error",
            null,
            "Error al procesar o enviar el mensaje al grupo"
          )
        );
      }
    }

    return results;
  }

  async sendImageMessages(groupId, message, imageUrls, results, inviteCode) {
    for (let i = 0; i < imageUrls.length; i++) {
      const { imagen, message: caption } = imageUrls[i]; // ← DESDE AQUÍ el fix

      try {
        const response = await axios.get(imagen, {
          responseType: "arraybuffer",
        });

        const contentType = response.headers["content-type"];
        const media = new MessageMedia(
          contentType,
          Buffer.from(response.data).toString("base64")
        );

        await whatsapp.sendMessage(groupId, media, { caption });
      } catch (imgError) {
        console.error(`Error con imagen ${imagen}:`, imgError.message);
        results.push(
          this.model.createResult(
            inviteCode,
            "error",
            null,
            "Error al descargar o enviar imagen",
            { imageUrl: imagen }
          )
        );
      }
    }
  }

  processCommaSeparatedList(list) {
    if (!list || typeof list !== "string") {
      return [];
    }
    return list
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}

module.exports = WhatsappService;
