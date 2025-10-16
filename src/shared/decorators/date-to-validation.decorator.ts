import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CommonHelpers } from '../helpers/common.helpers';
import { MESSAGES } from '../constants/message.constants';

export function DateToValidation(
  dateFromPropertyName: string,
  additionTimeInMilliseconds?: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [dateFromPropertyName, additionTimeInMilliseconds],
      validator: DateToValidationConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'DateToValidation', async: false })
class DateToValidationConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    try {
      const [fromProp, addition] = args.constraints as [string, number?];
      const obj = args.object as Record<string, unknown>;
      const fromValue = obj[fromProp];

      if (!fromValue) return false;

      const fromDate = new Date(fromValue as string | number | Date).getTime();
      const toDate = new Date(value as string | number | Date).getTime();
      const additionTime = addition ?? 0;

      return fromDate + additionTime <= toDate;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const hasAdditionalTime = args.constraints[1] as number;

    if (hasAdditionalTime) {
      return `${args.property} require greater than equals ${args.constraints[0]}${
        args.constraints[1] ? ' +' + args.constraints[1] + ' milliseconds' : ''
      }`;
    }

    return CommonHelpers.formatMessageString(
      MESSAGES.MUST_BE_GREATER_THAN_OR_EQUAL_TO,
      args.property,
      args.constraints[0],
    );
  }
}
