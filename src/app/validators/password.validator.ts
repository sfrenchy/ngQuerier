import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidators {
  private static readonly DIGIT_PATTERN = /\d/;
  private static readonly LOWERCASE_PATTERN = /[a-z]/;
  private static readonly UPPERCASE_PATTERN = /[A-Z]/;
  private static readonly NON_ALPHANUMERIC_PATTERN = /[^a-zA-Z\d]/;

  static createValidator(options: {
    requiredLength?: number;
    requireDigit?: boolean;
    requireLowercase?: boolean;
    requireUppercase?: boolean;
    requireNonAlphanumeric?: boolean;
    requiredUniqueChars?: number;
  } = {}): ValidatorFn {
    const {
      requiredLength = 12,
      requireDigit = true,
      requireLowercase = true,
      requireUppercase = true,
      requireNonAlphanumeric = true,
      requiredUniqueChars = 1
    } = options;

    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;

      if (!password) {
        return null; // Let required validator handle empty values
      }

      const errors: ValidationErrors = {};

      // Vérification de la longueur minimale
      if (password.length < requiredLength) {
        errors['minlength'] = { requiredLength, actualLength: password.length };
      }

      // Vérification de la présence d'un chiffre
      if (requireDigit && !PasswordValidators.DIGIT_PATTERN.test(password)) {
        errors['requireDigit'] = true;
      }

      // Vérification de la présence d'une minuscule
      if (requireLowercase && !PasswordValidators.LOWERCASE_PATTERN.test(password)) {
        errors['requireLowercase'] = true;
      }

      // Vérification de la présence d'une majuscule
      if (requireUppercase && !PasswordValidators.UPPERCASE_PATTERN.test(password)) {
        errors['requireUppercase'] = true;
      }

      // Vérification de la présence d'un caractère spécial
      if (requireNonAlphanumeric && !PasswordValidators.NON_ALPHANUMERIC_PATTERN.test(password)) {
        errors['requireNonAlphanumeric'] = true;
      }

      // Vérification du nombre de caractères uniques
      if (requiredUniqueChars > 0) {
        const uniqueChars = new Set(password.split('')).size;
        if (uniqueChars < requiredUniqueChars) {
          errors['requireUniqueChars'] = { required: requiredUniqueChars, actual: uniqueChars };
        }
      }

      return Object.keys(errors).length === 0 ? null : errors;
    };
  }
} 