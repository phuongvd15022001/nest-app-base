import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { CommonHelpers } from '../helpers/common.helpers';
import { MESSAGES } from '../constants/message.constants';

@ValidatorConstraint({ name: 'maxNumberLength', async: false })
class MaxNumberLengthValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const maxLength = args.constraints[0] as number;

    // Let IsNumber report a non-numeric value instead of failing twice.
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return true;
    }

    // Count digits only: the sign and the decimal point are not digits,
    // and a literal 0 is one digit rather than an empty string.
    const digits = Math.abs(value).toString().replace('.', '').length;

    return digits <= maxLength;
  }

  defaultMessage(args: ValidationArguments) {
    const maxLength = args.constraints[0] as number;
    return CommonHelpers.formatMessageString(
      MESSAGES.REQUIRED_MAX_LENGTH,
      maxLength,
    );
  }
}

export function MaxNumberLength(
  maxLength: number,
  validationOptions?: ValidationOptions,
) {
  return (object: Record<string, unknown>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxLength],
      validator: MaxNumberLengthValidator,
    });
  };
}
