import {describe, it, expect} from 'vitest';
import {HealthCheckupSchema} from '@/lib/health-data/parser/schema';

describe('HealthCheckupSchema types and nullables', () => {
  it('rejects numeric values for string-typed fields', () => {
    const input = {
      date: '2025-01-05',
      name: 'Jane',
      test_result: {
        tsh: { value: 2.51, unit: 'uIU/mL' } // value must be a string per schema
      }
    };
    expect(() => HealthCheckupSchema.parse(input)).toThrowError();
  });

  it('accepts nulls for nullable nested fields', () => {
    const input = {
      date: '2025-01-05',
      name: 'Jane',
      test_result: {
        hemoglobin_a1c: { value: null, unit: '%' },
        tsh: { value: '2.51', unit: null }
      }
    };
    const out = HealthCheckupSchema.parse(input);
    expect(out.test_result.hemoglobin_a1c?.value).toBeNull();
    expect(out.test_result.hemoglobin_a1c?.unit).toBe('%');
    expect(out.test_result.tsh?.value).toBe('2.51');
    expect(out.test_result.tsh?.unit).toBeNull();
  });
});