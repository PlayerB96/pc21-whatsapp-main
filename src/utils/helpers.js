/**
 * Utilidades generales para la aplicación
 */

class Helpers {
  /**
   * Formatea un número de teléfono al formato internacional
   */
  static formatPhoneNumber(phone, defaultCountryCode = '+51') {
    if (!phone) return null;
    
    // Remover espacios y caracteres especiales
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si ya tiene código de país, retornarlo
    if (cleanPhone.startsWith('+')) {
      return cleanPhone;
    }
    
    // Agregar código de país por defecto
    return `${defaultCountryCode}${cleanPhone}`;
  }

  /**
   * Valida si una URL es válida
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extrae el código de invitación de una URL de WhatsApp
   */
  static extractInviteCode(url) {
    if (!url) return null;
    
    const match = url.match(/(?:chat\.whatsapp\.com\/)?([A-Za-z0-9]{20,})/);
    return match ? match[1] : null;
  }

  /**
   * Valida si un string contiene solo caracteres alfanuméricos
   */
  static isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Convierte un array de strings separados por comas en array limpio
   */
  static csvToArray(csvString) {
    if (!csvString || typeof csvString !== 'string') {
      return [];
    }
    
    return csvString
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Crea un delay asíncrono
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sanitiza un string removiendo caracteres peligrosos
   */
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/[<>]/g, '') // Remover < y >
      .trim();
  }

  /**
   * Genera un ID único simple
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Verifica si un objeto está vacío
   */
  static isEmpty(obj) {
    return obj === null || obj === undefined || 
           (typeof obj === 'object' && Object.keys(obj).length === 0) ||
           (typeof obj === 'string' && obj.trim().length === 0) ||
           (Array.isArray(obj) && obj.length === 0);
  }

  /**
   * Formatea un error para logging
   */
  static formatError(error, context = '') {
    return {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Valida si un content-type es de imagen
   */
  static isImageContentType(contentType) {
    if (!contentType) return false;
    
    const imageTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp'
    ];
    
    return imageTypes.some(type => contentType.toLowerCase().includes(type));
  }

  /**
   * Trunca un string a una longitud específica
   */
  static truncate(str, length = 100, suffix = '...') {
    if (!str || str.length <= length) return str;
    
    return str.substring(0, length) + suffix;
  }
}

module.exports = Helpers;
