import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { IntField, NumberField } from './dto.decorators';

class MaxLengthProbeDto {
  @NumberField({ maxLength: 3 })
  code: number;
}

class ZeroLengthProbeDto {
  @NumberField({ maxLength: 0 })
  code: number;
}

class DefaultIntProbeDto {
  @IntField()
  quantity: number;
}

class ZeroAllowedIntProbeDto {
  @IntField({ min: 0 })
  quantity: number;
}

const failedFields = <T extends object>(
  cls: ClassConstructor<T>,
  payload: Record<string, unknown>,
): string[] =>
  validateSync(plainToInstance(cls, payload)).map((error) => error.property);

describe('NumberField', () => {
  describe('min', () => {
    it('rejects a value below a zero bound', () => {
      expect(
        failedFields(CreateProductDto, { name: 'Milk Tee', price: -999 }),
      ).toEqual(['price']);
    });

    it('accepts the bound itself', () => {
      expect(
        failedFields(CreateProductDto, { name: 'Milk Tee', price: 0 }),
      ).toEqual([]);
    });

    it('accepts a value above the bound', () => {
      expect(
        failedFields(CreateProductDto, { name: 'Milk Tee', price: 9.99 }),
      ).toEqual([]);
    });
  });

  describe('maxLength', () => {
    it('rejects a number with too many digits', () => {
      expect(failedFields(MaxLengthProbeDto, { code: 1234 })).toEqual(['code']);
    });

    it('accepts a number within the digit budget', () => {
      expect(failedFields(MaxLengthProbeDto, { code: 123 })).toEqual([]);
    });

    it('counts digits only, not the minus sign', () => {
      expect(failedFields(MaxLengthProbeDto, { code: -123 })).toEqual([]);
    });

    it('counts digits only, not the decimal point', () => {
      expect(failedFields(MaxLengthProbeDto, { code: 12.5 })).toEqual([]);
    });

    it('counts a literal zero as one digit', () => {
      expect(failedFields(ZeroLengthProbeDto, { code: 0 })).toEqual(['code']);
    });
  });
});

describe('IntField', () => {
  it('still defaults to a minimum of 1', () => {
    expect(failedFields(DefaultIntProbeDto, { quantity: 0 })).toEqual([
      'quantity',
    ]);
    expect(failedFields(DefaultIntProbeDto, { quantity: 1 })).toEqual([]);
  });

  it('accepts zero when min is lowered', () => {
    expect(failedFields(ZeroAllowedIntProbeDto, { quantity: 0 })).toEqual([]);
  });

  it('still rejects a value below the lowered bound', () => {
    expect(failedFields(ZeroAllowedIntProbeDto, { quantity: -1 })).toEqual([
      'quantity',
    ]);
  });

  it('still rejects a non-integer', () => {
    expect(failedFields(DefaultIntProbeDto, { quantity: 1.5 })).toEqual([
      'quantity',
    ]);
  });
});
