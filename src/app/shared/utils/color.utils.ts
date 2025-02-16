/**
 * Converts a hexadecimal color string to an unsigned integer.
 * @param hex The hexadecimal color string (e.g., '#FFFFFF' or '0xFFFFFF')
 * @returns The color as an unsigned integer
 */
export function hexToUint(hex: string | number): number {
  // If already a number, return it
  if (typeof hex === 'number') {
    return hex;
  }

  // Remove '#' if present and convert to uppercase
  hex = hex.replace('#', '').toUpperCase();

  // Validate hex format
  if (!/^[0-9A-F]{6}$/.test(hex)) {
    console.warn(`Invalid hex color: ${hex}, defaulting to white`);
    return 0xFFFFFF; // Default to white
  }

  return parseInt(hex, 16);
}

/**
 * Converts an unsigned integer color to a hexadecimal string.
 * @param uint The color as an unsigned integer
 * @returns The color as a hexadecimal string (e.g., '#FFFFFF')
 */
export function uintToHex(uint: number | string): string {
  // If already a string starting with '#', return it
  if (typeof uint === 'string' && uint.startsWith('#')) {
    return uint;
  }

  // Convert to number if string
  const numValue = typeof uint === 'string' ? parseInt(uint) : uint;

  // Validate number
  if (isNaN(numValue) || numValue < 0 || numValue > 0xFFFFFF) {
    console.warn(`Invalid color value: ${uint}, defaulting to white`);
    return '#FFFFFF';
  }

  // Convert to hex and pad with zeros if needed
  const hex = numValue.toString(16).padStart(6, '0').toUpperCase();
  return `#${hex}`;
}
