/**
 * Extract the first italic line from blog content
 * Looks for <em>, <i>, or elements with italic styling
 * @param htmlContent - The HTML content from WordPress
 * @returns The first italic text found, or empty string if none found
 */
export function extractFirstItalicLine(htmlContent: string): string {
  if (!htmlContent || typeof document === 'undefined') return '';

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Try to find italic content in order of priority:
  // 1. First <em> tag
  // 2. First <i> tag
  // 3. First element with style="font-style: italic"
  // 4. First element with class containing "italic"
  
  const emTag = tempDiv.querySelector('em');
  if (emTag) {
    return emTag.textContent?.trim() || '';
  }

  const iTag = tempDiv.querySelector('i');
  if (iTag) {
    return iTag.textContent?.trim() || '';
  }

  // Look for elements with inline italic styling
  const allElements = tempDiv.querySelectorAll('*');
  for (const element of Array.from(allElements)) {
    const style = element.getAttribute('style');
    if (style && style.includes('font-style') && style.includes('italic')) {
      return element.textContent?.trim() || '';
    }
  }

  // Look for elements with italic class
  const italicClassElement = tempDiv.querySelector('[class*="italic"]');
  if (italicClassElement) {
    return italicClassElement.textContent?.trim() || '';
  }

  return '';
}

