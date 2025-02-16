import {AbstractControl, ValidationErrors} from '@angular/forms';

export class EmailValidators {
  private static readonly EMAIL_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly MAX_EMAIL_LENGTH = 254; // RFC 5321
  private static readonly MAX_LOCAL_PART_LENGTH = 64; // RFC 5321

  static validate(control: AbstractControl): ValidationErrors | null {
    const email = control.value;

    if (!email) {
      return null; // Let required validator handle empty values
    }

    // Vérification de la longueur totale de l'email
    if (email.length > EmailValidators.MAX_EMAIL_LENGTH) {
      return {emailLength: true};
    }

    // Vérification de la longueur de la partie locale
    const localPart = email.split('@')[0];
    if (localPart && localPart.length > EmailValidators.MAX_LOCAL_PART_LENGTH) {
      return {localPartLength: true};
    }

    // Vérification du format de l'email
    if (!EmailValidators.EMAIL_PATTERN.test(email)) {
      return {emailPattern: true};
    }

    return null;
  }
}
