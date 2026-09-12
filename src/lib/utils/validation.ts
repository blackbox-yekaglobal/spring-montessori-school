/**
 * Input validation utilities for the School Management System
 */

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

export function validatePhone(phone: string): boolean {
  // Nigerian phone number format
  const re = /^(\+234|0)[789][01]\d{8}$/;
  return re.test(phone.replace(/\s/g, ''));
}

export function validateRequired(value: string | null | undefined, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (value.length > max) {
    return `${fieldName} must not exceed ${max} characters`;
  }
  return null;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function validatePositiveNumber(value: number | string, fieldName: string): string | null {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

export function validateDateRange(start: string, end: string): string | null {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate <= startDate) {
    return 'End date must be after start date';
  }
  return null;
}

export function validateFormData(fields: { value: string; name: string; required?: boolean }[]): string | null {
  for (const field of fields) {
    if (field.required !== false) {
      const error = validateRequired(field.value, field.name);
      if (error) return error;
    }
  }
  return null;
}
