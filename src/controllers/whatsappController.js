const WhatsappService = require('../services/whatsappService');
const WhatsappModel = require('../models/WhatsappModel');

class WhatsappController {
  constructor() {
    this.service = new WhatsappService();
    this.model = new WhatsappModel();
  }


  async sendLeadMessage(req, res) {
    try {
      const { phone, message } = req.body;

      // Validaciones básicas
      if (!phone || !message) {
        return res.status(400).json(
          this.model.createResponse(false, null, 'Números de teléfono y mensaje son requeridos')
        );
      }

      // Procesar lista de números
      const phoneNumbers = this.service.processCommaSeparatedList(phone);
      
      if (phoneNumbers.length === 0) {
        return res.status(400).json(
          this.model.createResponse(false, null, 'Debe proporcionar al menos un número de teléfono válido')
        );
      }

      // Enviar mensajes
      const results = await this.service.sendLeadMessages(phoneNumbers, message);

      // Responder con los resultados
      res.json(this.model.createResponse(true, results));

    } catch (error) {
      console.error('Error en sendLeadMessage:', error);
      res.status(500).json(
        this.model.createResponse(false, null, 'Error interno del servidor')
      );
    }
  }

 
    async sendGroupMessage(req, res) {
    try {
        const { groupCodes, message, tipo, imageUrls } = req.body;

        // Validación base
        if (!groupCodes || !tipo) {
        return res.status(400).json(
            this.model.createResponse(false, null, 'groupCodes y tipo son requeridos')
        );
        }

        // Validar tipo de mensaje
        if (tipo === this.model.messageTypes.TEXT && !message) {
        return res.status(400).json(
            this.model.createResponse(false, null, 'El mensaje es requerido para tipo "texto"')
        );
        }

        if (tipo === this.model.messageTypes.IMAGE) {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return res.status(400).json(
            this.model.createResponse(false, null, 'Debe enviar imageUrls como arreglo con al menos un objeto { imagen, message }')
            );
        }

        const invalidItem = imageUrls.find(item =>
            typeof item !== 'object' ||
            typeof item.imagen !== 'string' ||
            !/^https?:\/\/.+/.test(item.imagen)
        );

        if (invalidItem) {
            return res.status(400).json(
            this.model.createResponse(false, null, 'Cada item de imageUrls debe tener una propiedad "imagen" con una URL válida')
            );
        }
        }

        // Procesar lista de códigos de grupo
        const codes = this.service.processCommaSeparatedList(groupCodes);

        if (codes.length === 0) {
        return res.status(400).json(
            this.model.createResponse(false, null, 'Debe proporcionar al menos un código de grupo válido')
        );
        }

        // Enviar mensajes
        const results = await this.service.sendGroupMessages(codes, message, tipo, imageUrls);

        res.json(this.model.createResponse(true, results));
    } catch (error) {
        console.error('Error en sendGroupMessage:', error);
        res.status(500).json(
        this.model.createResponse(false, null, 'Error interno del servidor')
        );
    }
    }


 
  async getStatus(req, res) {
    try {
      // Aquí podrías agregar lógica para verificar el estado de la conexión
      res.json(this.model.createResponse(true, { status: 'WhatsApp API is running' }));
    } catch (error) {
      console.error('Error en getStatus:', error);
      res.status(500).json(
        this.model.createResponse(false, null, 'Error al verificar el estado')
      );
    }
  }
}

module.exports = WhatsappController;
