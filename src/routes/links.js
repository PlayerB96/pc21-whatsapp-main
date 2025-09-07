const { Router } = require('express');
const { whatsapp, isReady } = require('../lib/whatsapp'); // <-- asegúrate de exportar isReady en lib/whatsapp.js
const router = Router();
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

// Enviar mensaje a números individuales
router.post('/lead', async (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body);
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ res: false, error: 'Números de teléfono y mensaje son requeridos' });
  }

  if (!isReady()) {
    return res.status(503).json({ res: false, error: 'Cliente de WhatsApp no está listo aún' });
  }

  const phoneNumbers = phone.split(',').map(num => num.trim());
  const results = [];
  console.log('Números a procesar:', phoneNumbers);
  for (const number of phoneNumbers) {
    const normalizedNumber = number.startsWith('+') ? number : `+51${number}`;

    try {
      // getNumberId recibe solo el número con prefijo país (sin +, sin @c.us)
      const numberId = await whatsapp.getNumberId(normalizedNumber.replace('+', ''));
      console.log(`ID de número para ${normalizedNumber}:`, numberId);
      if (numberId) {
        await whatsapp.sendMessage(numberId._serialized, message);
        results.push({ number: normalizedNumber, status: 'success', message: 'Mensaje enviado correctamente' });
      } else {
        results.push({ number: normalizedNumber, status: 'error', error: 'Número no encontrado en WhatsApp' });
      }
    } catch (error) {
      console.error(`Error al enviar el mensaje al número ${normalizedNumber}:`, error.message);
      results.push({ number: normalizedNumber, status: 'error', error: 'Error al enviar el mensaje' });
    }
  }

  res.json({ res: true, results });
});

// Enviar mensajes a grupos
router.post('/group_message', async (req, res) => {
  const { groupCodes, message, tipo, imageUrls } = req.body;

  if (!groupCodes || !message || !tipo) {
    return res.status(400).json({ res: false, error: 'groupCodes, message y tipo son requeridos' });
  }

  if (!isReady()) {
    return res.status(503).json({ res: false, error: 'Cliente de WhatsApp no está listo aún' });
  }

  const codes = groupCodes.split(',').map(code => code.trim());
  const results = [];

  for (const rawCode of codes) {
    const match = rawCode.match(/(?:chat\.whatsapp\.com\/)?([A-Za-z0-9]{20,})/);
    const inviteCode = match ? match[1] : null;

    if (!inviteCode) {
      results.push({ input: rawCode, status: 'error', error: 'Código de invitación inválido' });
      continue;
    }

    try {
      const inviteInfo = await whatsapp.getInviteInfo(inviteCode);
      const groupId = inviteInfo.id._serialized;

      if (tipo === 'imagen') {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
          results.push({ inviteCode, status: 'error', error: 'Debe enviar imageUrls como arreglo con al menos una URL' });
          continue;
        }

        for (let i = 0; i < imageUrls.length; i++) {
          const { imagen, message: imgMessage } = imageUrls[i];
          try {
            const response = await axios.get(imagen, { responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];
            const media = new MessageMedia(contentType, Buffer.from(response.data).toString('base64'));
            await whatsapp.sendMessage(groupId, media, { caption: imgMessage || undefined });
          } catch (imgError) {
            console.error(`Error con imagen ${imagen}:`, imgError.message);
            results.push({ inviteCode, status: 'error', imageUrl: imagen, error: 'Error al descargar o enviar imagen' });
          }
        }
      } else if (tipo === 'texto') {
        await whatsapp.sendMessage(groupId, message);
      } else {
        results.push({ inviteCode, status: 'error', error: 'Tipo no válido. Debe ser "texto" o "imagen"' });
        continue;
      }

      results.push({
        groupName: inviteInfo.subject,
        groupId,
        status: 'success',
        message: 'Mensaje(s) enviado(s) correctamente'
      });
    } catch (error) {
      console.error(`Error con código ${inviteCode}:`, error.message);
      results.push({ inviteCode, status: 'error', error: 'Error al procesar o enviar el mensaje al grupo' });
    }
  }

  res.json({ res: true, results });
});

module.exports = router;
