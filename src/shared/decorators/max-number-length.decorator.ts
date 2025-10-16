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
  validate(value: number, args: ValidationArguments) {
    const maxLength = args.constraints[0] as number;

    const stringValue = value ? value.toString() : '';

    return stringValue.length <= maxLength;
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
