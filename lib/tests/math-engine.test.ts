import { parseChileanSlang, extractMathExpression, extractFlatAmount } from '../math-engine'

// Simple helper test runner to run without Jest globals
function describe(name: string, fn: () => void) {
  console.log(`\n📂 Suite: ${name}`);
  fn();
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
  } catch (error) {
    console.error(`❌ [FAIL] ${name}`);
    throw error;
  }
}

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error(`Expected null but got ${actual}`);
    }
  },
  not: {
    toBeNull: () => {
      if (actual === null) {
        throw new Error(`Expected not null but got null`);
      }
    }
  }
});

describe('Motor Matemático Determinista de FinanzIA', () => {
  
  describe('parseChileanSlang', () => {
    test('debería parsear montos chilenos estándar', () => {
      expect(parseChileanSlang('2890')).toBe(2890)
      expect(parseChileanSlang('$2.890')).toBe(2890)
      expect(parseChileanSlang('$ 2.890')).toBe(2890)
      expect(parseChileanSlang('10000')).toBe(10000)
    })

    test('debería parsear lucas', () => {
      expect(parseChileanSlang('20 lucas')).toBe(20000)
      expect(parseChileanSlang('1 luca')).toBe(1000)
      expect(parseChileanSlang('1.5 lucas')).toBe(1500)
      expect(parseChileanSlang('$15 lucas')).toBe(15000)
    })

    test('debería parsear gambas', () => {
      expect(parseChileanSlang('3 gambas')).toBe(300)
      expect(parseChileanSlang('1 gamba')).toBe(100)
      expect(parseChileanSlang('1.5 gambas')).toBe(150)
    })

    test('debería parsear palos', () => {
      expect(parseChileanSlang('2 palos')).toBe(2000000)
      expect(parseChileanSlang('1 palo')).toBe(1000000)
      expect(parseChileanSlang('1.5 palos')).toBe(1500000)
      expect(parseChileanSlang('1 guatón')).toBe(1000000)
    })

    test('debería parsear quinas', () => {
      expect(parseChileanSlang('una quina')).toBe(500)
      expect(parseChileanSlang('1 quina')).toBe(500)
      expect(parseChileanSlang('2 quinas')).toBe(1000)
    })
  })

  describe('extractMathExpression', () => {
    test('debería extraer multiplicaciones de producto "a" precio', () => {
      const res = extractMathExpression('vendí 3 empanadas a 2890')
      expect(res).not.toBeNull()
      expect(res!.quantity).toBe(3)
      expect(res!.unitPrice).toBe(2890)
      expect(res!.calculatedTotal).toBe(8670)
    })

    test('debería extraer con modismos chilenos', () => {
      const res = extractMathExpression('vendí 2 productos a 15 lucas cada uno')
      expect(res).not.toBeNull()
      expect(res!.quantity).toBe(2)
      expect(res!.unitPrice).toBe(15000)
      expect(res!.calculatedTotal).toBe(30000)
    })

    test('debería extraer con c/u y signo peso', () => {
      const res = extractMathExpression('compré 5 bebidas a $1.200 c/u')
      expect(res).not.toBeNull()
      expect(res!.quantity).toBe(5)
      expect(res!.unitPrice).toBe(1200)
      expect(res!.calculatedTotal).toBe(6000)
    })

    test('debería extraer operaciones directas con asterisco o x', () => {
      const res1 = extractMathExpression('3 * 2890')
      expect(res1).not.toBeNull()
      expect(res1!.quantity).toBe(3)
      expect(res1!.unitPrice).toBe(2890)
      expect(res1!.calculatedTotal).toBe(8670)

      const res2 = extractMathExpression('3x2890')
      expect(res2).not.toBeNull()
      expect(res2!.quantity).toBe(3)
      expect(res2!.unitPrice).toBe(2890)
      expect(res2!.calculatedTotal).toBe(8670)
    })

    test('debería retornar null si no hay expresión matemática clara', () => {
      expect(extractMathExpression('gasté 20 lucas en sushi')).toBeNull()
      expect(extractMathExpression('hola asistente, ¿cómo estás?')).toBeNull()
    })
  })
})
