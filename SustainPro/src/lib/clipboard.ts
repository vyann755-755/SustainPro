/**
 * Safely copies text to clipboard with fallback for browsers
 * that don't support the Clipboard API or have it blocked
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try the modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for browsers that don't support Clipboard API
    return fallbackCopyToClipboard(text);
  } catch (error) {
    // If Clipboard API fails (e.g., due to permissions), use fallback
    return fallbackCopyToClipboard(text);
  }
}

/**
 * Fallback method using deprecated document.execCommand
 * Works in more restrictive environments
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea invisible and position it off-screen
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    
    // Select and copy the text
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    
    const successful = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('Fallback clipboard copy failed:', error);
    return false;
  }
}
