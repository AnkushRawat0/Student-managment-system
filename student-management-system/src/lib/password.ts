import bcrypt from 'bcrypt';

/**
 * Password utility functions for secure password handling
 */

// Salt rounds - higher = more secure but slower (12 is good balance)
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param plainPassword - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a plain text password against a hash
 * @param plainPassword - The plain text password to verify
 * @param hashedPassword - The hashed password to verify against
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw new Error('Failed to verify password');
  }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
  strength: 'weak' | 'medium' | 'strong';
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
      strength: 'weak'
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
    .filter(Boolean).length;

  if (criteriaCount < 2) {
    return {
      isValid: false,
      message: 'Password must contain at least 2 of: uppercase, lowercase, numbers, special characters',
      strength: 'weak'
    };
  }

  if (criteriaCount === 2) {
    return {
      isValid: true,
      message: 'Password strength: Medium',
      strength: 'medium'
    };
  }

  return {
    isValid: true,
    message: 'Password strength: Strong',
    strength: 'strong'
  };
}