/**
 * Motor Matemático Determinista y Parser de Modismos Financieros Chilenos
 */

/**
 * Traduce modismos de dinero chileno a valores numéricos enteros
 */
export function parseChileanSlang(text: string): number {
  if (!text) return 0;
  
  let value = text.toLowerCase().trim();
  
  // Atajos directos comunes
  if (value === 'una quina' || value === '1 quina') return 500;
  if (value === 'un palo') return 1000000;
  if (value === 'una luca' || value === '1 luca') return 1000;
  if (value === 'una gamba' || value === '1 gamba') return 100;

  let multiplier = 1;
  if (/lucas?/i.test(value)) {
    multiplier = 1000;
  } else if (/gambas?/i.test(value)) {
    multiplier = 100;
  } else if (/palos?|guat[oó]n|guatones/i.test(value)) {
    multiplier = 1000000;
  } else if (/quinas?/i.test(value)) {
    multiplier = 500;
  }

  const cleaned = value
    .replace(/(lucas?|gambas?|palos?|guat[oó]n|guatones|quinas?)/gi, '')
    .replace(/[\$\s]/g, '');

  let numStr = cleaned;
  if (/\b\d{1,3}(\.\d{3})+\b/.test(cleaned)) {
    numStr = cleaned.replace(/\./g, '');
  } else if (/\b\d{1,3}(,\d{3})+\b/.test(cleaned)) {
    numStr = cleaned.replace(/,/g, '');
  }

  numStr = numStr.replace(/,/g, '.');

  const num = parseFloat(numStr);
  if (isNaN(num)) return 0;

  return Math.round(num * multiplier);
}

interface MathResult {
  quantity: number;
  unitPrice: number;
  calculatedTotal: number;
}

/**
 * Analiza un mensaje del usuario buscando operaciones matemáticas implícitas o explícitas.
 * Por ejemplo: "vendí 3 empanadas a $2890 cada una" o "2 productos a 15 lucas cada uno".
 */
export function extractMathExpression(text: string): MathResult | null {
  if (!text) return null;

  // Normalizar el texto a minúsculas
  const normalized = text.toLowerCase().trim();

  // Expresiones regulares para capturar patrones de multiplicación:
  const patterns = [
    // Patrón 1: "[cantidad] [nombre del producto] a [precio]" o "cada un[oa]"
    // Ej: "3 empanadas a 2890" o "3 empanadas a $2890 c/u" o "2 productos a 15 lucas cada uno"
    /(\d+)\s+[\w\sñáéíóúü@#-]+?\s+(?:a|cada\s+un[oas]|a\s+razón\s+de|c\/u)\s+(\d+(?:\s*(?:lucas?|gambas?|palos?|quinas?))?|\$?[\d\.\,]+(?:\s*(?:lucas?|gambas?|palos?|quinas?))?)/gi,
    
    // Patrón 2: Expresión matemática directa como "3 * 2890", "3x2890", "3 * 2.890"
    /(\d+)\s*(?:\*|x)\s*(\$?[\d\.\,]+(?:\s*(?:lucas?|gambas?|palos?|quinas?))?)/gi,
  ];

  for (const regex of patterns) {
    // Reset regex index for safety with global flag
    regex.lastIndex = 0;
    const match = regex.exec(normalized);
    if (match) {
      const quantity = parseInt(match[1], 10);
      const priceStr = match[2];
      const unitPrice = parseChileanSlang(priceStr);
      
      if (quantity > 0 && unitPrice > 0) {
        return {
          quantity,
          unitPrice,
          calculatedTotal: quantity * unitPrice
        };
      }
    }
  }

  return null;
}

/**
 * Extrae un monto plano (sin multiplicación) de un texto, soportando modismos chilenos.
 * Ej: "gasté 20 lucas en sushi" -> 20000
 */
export function extractFlatAmount(text: string): number {
  if (!text) return 0;
  
  const normalized = text.toLowerCase()
    .replace(/\$/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '');

  const patterns = [
    /(\d+)\s*(?:palos?|guat[oó]n|guatones)/gi,
    /(\d+)\s*lucas?/gi,
    /(\d+)\s*gambas?/gi,
    /quina/gi,
    /(\d+)/gi,
  ];

  for (const regex of patterns) {
    regex.lastIndex = 0;
    const match = regex.exec(normalized);
    if (match) {
      if (match[0].includes('quina')) return 500;
      const num = parseInt(match[1], 10);
      let multiplier = 1;
      if (/l/i.test(match[0])) multiplier = 1000;
      else if (/g/i.test(match[0])) multiplier = 100;
      else if (/p|guat/i.test(match[0])) multiplier = 1000000;
      return num * multiplier;
    }
  }

  return 0;
}
