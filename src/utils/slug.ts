/**
 * Generate a URL-friendly slug from a string
 * Handles special characters, quotes, parentheses, and multiple hyphens
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/["()]/g, '') // Remove quotes and parentheses
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a simple slug (for backward compatibility)
 */
export function generateSimpleSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}

