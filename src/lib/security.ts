import crypto from 'crypto';
import { User } from './types';

export const STANDARD_RECOVERY_QUESTIONS: string[] = [
  'What was the name of your first school or high school?',
  'What is your mother or father’s hometown / birthplace?',
  'What was the brand or model of your first bicycle or vehicle?',
  'What was your favorite subject in primary school?',
  'What is the name of your childhood favorite teacher or pet?',
  'What was the name of the street or locality where you grew up?',
];

/**
 * Derives a secure salt and PBKDF2-SHA512 hash for a user password.
 * Format: `salt:derivedKey`
 */
export function hashPassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a valid string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a candidate password against the stored salt:hash using constant-time comparison.
 */
export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!password || !storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedBuffer = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
    if (keyBuffer.length !== derivedBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

/**
 * Normalizes a security question answer (trim, lowercase, collapse whitespace)
 * so minor capitalization or spacing differences don't block legitimate recovery.
 */
export function normalizeAnswer(answer: string): string {
  if (!answer) return '';
  return answer.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Hashes a normalized recovery answer with salt so answers are never stored in plaintext.
 */
export function hashRecoveryAnswer(answer: string): string {
  const normalized = normalizeAnswer(answer);
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(normalized, salt, 10000, 32, 'sha256').toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a candidate recovery answer against the stored salt:hash.
 */
export function verifyRecoveryAnswer(candidate: string, storedHash?: string): boolean {
  if (!candidate || !storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const normalized = normalizeAnswer(candidate);
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedBuffer = crypto.pbkdf2Sync(normalized, salt, 10000, 32, 'sha256');
    if (keyBuffer.length !== derivedBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

/**
 * Strips confidential credentials (password_hash and recovery_questions answers)
 * before any user object is transmitted over HTTP or rendered in client components.
 */
export function sanitizeUser<T extends Record<string, any>>(user: T | null | undefined): T | null {
  if (!user) return null;
  const copy: any = { ...user };
  delete copy.password_hash;
  if (copy.recovery_questions) {
    // Only expose questions without answer_hash if needed for security question selection
    copy.recovery_questions = copy.recovery_questions.map((q: any) => ({
      question: q.question,
    }));
  }
  return copy as T;
}
