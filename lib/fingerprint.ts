// Utilitário para gerar fingerprint único do dispositivo
// Usado para prevenir criação de múltiplas contas gratuitas

export interface DeviceFingerprint {
  fingerprint: string;
  userAgent: string;
  ipAddress?: string;
}

// Gera um hash simples a partir de uma string
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Coleta informações do dispositivo para criar fingerprint
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprinting
  let canvasFingerprint = '';
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint test 🔒', 2, 2);
    canvasFingerprint = canvas.toDataURL();
  }

  // Coleta informações do navegador e sistema
  const fingerPrintData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.join(',') || '',
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    availScreen: `${screen.availWidth}x${screen.availHeight}`,
    canvas: simpleHash(canvasFingerprint),
    webgl: getWebGLFingerprint(),
    fonts: await getAvailableFonts(),
    plugins: getPluginsFingerprint(),
    localStorage: isLocalStorageAvailable(),
    sessionStorage: isSessionStorageAvailable(),
    indexedDB: isIndexedDBAvailable(),
    cpuClass: (navigator as any).cpuClass || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };

  // Gera hash único baseado em todas as informações
  const fingerprintString = JSON.stringify(fingerPrintData);
  const fingerprint = simpleHash(fingerprintString);

  return {
    fingerprint,
    userAgent: navigator.userAgent,
  };
}

// WebGL fingerprinting
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) return 'no-webgl';
    
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    const version = gl.getParameter(gl.VERSION);
    const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    
    return simpleHash(`${renderer}-${vendor}-${version}-${shadingLanguageVersion}`);
  } catch (e) {
    return 'webgl-error';
  }
}

// Detecta fontes disponíveis
async function getAvailableFonts(): Promise<string> {
  const testFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Tahoma', 'Calibri',
    'Cambria', 'Consolas', 'Lucida Console', 'Monaco', 'Menlo'
  ];

  const availableFonts: string[] = [];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const baseFonts = ['monospace', 'sans-serif', 'serif'];

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 'no-canvas';

  // Mede largura com fontes base
  const baseWidths: { [key: string]: number } = {};
  for (const baseFont of baseFonts) {
    context.font = `${testSize} ${baseFont}`;
    baseWidths[baseFont] = context.measureText(testString).width;
  }

  // Testa cada fonte
  for (const font of testFonts) {
    let detected = false;
    for (const baseFont of baseFonts) {
      context.font = `${testSize} ${font}, ${baseFont}`;
      const width = context.measureText(testString).width;
      if (width !== baseWidths[baseFont]) {
        detected = true;
        break;
      }
    }
    if (detected) {
      availableFonts.push(font);
    }
  }

  return availableFonts.join(',');
}

// Fingerprint dos plugins
function getPluginsFingerprint(): string {
  const plugins = Array.from(navigator.plugins)
    .map(plugin => `${plugin.name}-${plugin.filename || 'unknown'}`)
    .sort()
    .join(',');
  return simpleHash(plugins);
}

// Verifica disponibilidade de storage
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function isSessionStorageAvailable(): boolean {
  try {
    const test = '__test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function isIndexedDBAvailable(): boolean {
  try {
    return !!window.indexedDB;
  } catch (e) {
    return false;
  }
}

// Obtém IP do usuário (opcional, via serviço externo)
export async function getUserIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Não foi possível obter IP:', error);
    return null;
  }
}

// Função principal para usar no signup
export async function getDeviceFingerprintForSignup(): Promise<DeviceFingerprint> {
  const fingerprint = await generateDeviceFingerprint();
  const ipAddress = await getUserIP();
  
  return {
    ...fingerprint,
    ipAddress: ipAddress || undefined
  };
}