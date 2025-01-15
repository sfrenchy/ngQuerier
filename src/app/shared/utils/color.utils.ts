/**
 * Convertit une couleur hexadécimale en uint
 * @param hex La couleur au format hexadécimal (ex: '#ffffff' ou 'ffffff')
 * @returns La valeur uint correspondante
 */
export function hexToUint(hex: string): number {
  // Supprimer le # si présent
  hex = hex.replace('#', '');
  // Convertir la chaîne hexadécimale en nombre
  return parseInt(hex, 16);
}

/**
 * Convertit un uint en couleur hexadécimale
 * @param uint La valeur uint à convertir
 * @returns La couleur au format hexadécimal (ex: '#ffffff')
 */
export function uintToHex(uint: number): string {
  // Convertir le nombre en chaîne hexadécimale et ajouter le #
  return '#' + uint.toString(16).padStart(6, '0');
} 