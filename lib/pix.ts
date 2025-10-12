/**
 * Biblioteca para geração de códigos PIX (BR Code / EMVCo)
 */

// CRC16-CCITT para validação do código PIX
function crc16(str: string): string {
  let crc = 0xFFFF;
  
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  const result = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  return result;
}

// Formata um campo EMV
function emvField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

interface PixPayloadOptions {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  description?: string;
  txid?: string;
}

/**
 * Gera o payload PIX (BR Code) no formato EMVCo
 * 
 * @param options Opções para geração do código PIX
 * @returns Código PIX completo (Copia e Cola)
 */
export function generatePixPayload(options: PixPayloadOptions): string {
  const {
    pixKey,
    merchantName,
    merchantCity,
    amount,
    description,
    txid
  } = options;

  // Validações
  if (!pixKey || !merchantName || !merchantCity) {
    throw new Error('pixKey, merchantName e merchantCity são obrigatórios');
  }

  let payload = '';

  // [00] Payload Format Indicator
  payload += emvField('00', '01');

  // [26] Merchant Account Information
  let merchantAccount = '';
  merchantAccount += emvField('00', 'br.gov.bcb.pix'); // GUI
  merchantAccount += emvField('01', pixKey); // Chave PIX
  
  if (description) {
    merchantAccount += emvField('02', description.substring(0, 72));
  }

  payload += emvField('26', merchantAccount);

  // [52] Merchant Category Code
  payload += emvField('52', '0000');

  // [53] Transaction Currency (986 = BRL)
  payload += emvField('53', '986');

  // [54] Transaction Amount (opcional)
  if (amount && amount > 0) {
    payload += emvField('54', amount.toFixed(2));
  }

  // [58] Country Code
  payload += emvField('58', 'BR');

  // [59] Merchant Name
  payload += emvField('59', merchantName.substring(0, 25));

  // [60] Merchant City
  payload += emvField('60', merchantCity.substring(0, 15));

  // [62] Additional Data Field Template (opcional)
  if (txid) {
    let additionalData = '';
    additionalData += emvField('05', txid.substring(0, 25)); // Reference Label
    payload += emvField('62', additionalData);
  }

  // [63] CRC16
  payload += '6304'; // ID 63, tamanho 04
  
  // Calcula CRC16 do payload completo
  const crcValue = crc16(payload);
  payload += crcValue;

  return payload;
}

/**
 * Gera URL do QR Code para um payload PIX
 * 
 * @param pixPayload Código PIX (Copia e Cola)
 * @param size Tamanho do QR Code em pixels (padrão: 300)
 * @returns URL da imagem QR Code
 */
export function generatePixQrCodeUrl(pixPayload: string, size: number = 300): string {
  const encodedPayload = encodeURIComponent(pixPayload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedPayload}`;
}

/**
 * Gera código PIX e URL do QR Code de uma só vez
 * 
 * @param options Opções para geração do PIX
 * @returns Objeto com o payload PIX e URL do QR Code
 */
export function generatePix(options: PixPayloadOptions) {
  const payload = generatePixPayload(options);
  const qrCodeUrl = generatePixQrCodeUrl(payload);
  
  return {
    payload,
    qrCodeUrl
  };
}
