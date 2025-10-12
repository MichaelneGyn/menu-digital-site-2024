/**
 * Biblioteca para geração de códigos PIX (BR Code / EMVCo)
 * Usando biblioteca emv-qrcps validada pela comunidade
 */

// @ts-ignore
import EMVQR from 'emv-qrcps';

interface PixPayloadOptions {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  description?: string;
  txid?: string;
}

/**
 * Gera o payload PIX (BR Code) no formato EMVCo usando biblioteca validada
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
  } = options;

  // Validações
  if (!pixKey || !merchantName || !merchantCity) {
    throw new Error('pixKey, merchantName e merchantCity são obrigatórios');
  }

  try {
    const emvqr = new EMVQR();

    // Configuração do payload
    emvqr.setPayloadFormatIndicator('01');
    
    // Merchant Account Information (PIX)
    emvqr.addMerchantAccountInformation('26', {
      globalUniqueIdentifier: 'br.gov.bcb.pix',
      pixKey: pixKey,
    });

    emvqr.setMerchantCategoryCode('0000');
    emvqr.setTransactionCurrency('986'); // BRL

    // Adiciona valor se fornecido
    if (amount && amount > 0) {
      emvqr.setTransactionAmount(amount.toFixed(2));
    }

    emvqr.setCountryCode('BR');
    emvqr.setMerchantName(merchantName.substring(0, 25));
    emvqr.setMerchantCity(merchantCity.substring(0, 15));

    // Adiciona descrição se fornecida
    if (description) {
      emvqr.addAdditionalDataFieldTemplate({
        referenceLabel: description.substring(0, 25)
      });
    }

    // Gera o payload com CRC
    const payload = emvqr.generatePayload();
    return payload;
  } catch (error) {
    console.error('Erro ao gerar payload PIX:', error);
    throw new Error('Falha ao gerar código PIX. Verifique os dados fornecidos.');
  }
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
