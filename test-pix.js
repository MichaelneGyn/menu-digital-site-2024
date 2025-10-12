// Teste da geração de código PIX
// Execute com: node test-pix.js

function crc16(str) {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function emvField(id, value) {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

function generatePixPayload(options) {
  const {
    pixKey,
    merchantName,
    merchantCity,
    amount,
    description,
  } = options;

  let payload = '';

  // [00] Payload Format Indicator
  payload += emvField('00', '01');

  // [26] Merchant Account Information
  let merchantAccount = '';
  merchantAccount += emvField('00', 'br.gov.bcb.pix');
  merchantAccount += emvField('01', pixKey);
  
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

  // [63] CRC16
  payload += '6304';
  const crcValue = crc16(payload);
  payload += crcValue;

  return payload;
}

// TESTE
console.log('=== TESTE GERAÇÃO PIX ===\n');

const pixPayload = generatePixPayload({
  pixKey: '62982175770',
  merchantName: 'MD burges',
  merchantCity: 'Cidade',
  description: 'Pedido MD burges',
  amount: 38.40
});

console.log('Código PIX gerado:');
console.log(pixPayload);
console.log('\nTamanho:', pixPayload.length, 'caracteres');
console.log('\nQR Code URL:');
console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`);

// Validação básica
console.log('\n=== VALIDAÇÃO ===');
console.log('✓ Começa com 00020126?', pixPayload.startsWith('00020126') ? 'SIM' : 'NÃO');
console.log('✓ Contém br.gov.bcb.pix?', pixPayload.includes('br.gov.bcb.pix') ? 'SIM' : 'NÃO');
console.log('✓ Termina com 6304XXXX?', pixPayload.substring(pixPayload.length - 8, pixPayload.length - 4) === '6304' ? 'SIM' : 'NÃO');
