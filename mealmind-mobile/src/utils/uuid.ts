import * as Crypto from 'expo-crypto';

/**
 * Generates a UUID v4 using expo-crypto, which works in React Native/Expo Go.
 * This replaces the uuid package which requires crypto.getRandomValues() polyfill.
 */
export function generateUUID(): string {
  return Crypto.randomUUID();
}
