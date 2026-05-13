import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Valida que la contraseña cumpla requisitos mínimos de seguridad.
export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value: string = control.value ?? '';

  if (!value) return null;

  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumeric   = /[0-9]/.test(value);
  const hasSpecial   = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
  const hasMinLength = value.length >= 8;

  const errors: ValidationErrors = {};

  if (!hasMinLength) errors['minLength']  = true;
  if (!hasUppercase) errors['uppercase']  = true;
  if (!hasLowercase) errors['lowercase']  = true;
  if (!hasNumeric)   errors['numeric']    = true;
  if (!hasSpecial)   errors['special']    = true;

  return Object.keys(errors).length ? { passwordStrength: errors } : null;
};

// Valida que dos campos del formulario tengan el mismo valor.
// Se aplica al FormGroup, no a un control individual.
export const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const password        = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;

  return password === confirmPassword ? null : { passwordMismatch: true };
};