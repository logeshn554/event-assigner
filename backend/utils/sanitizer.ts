/**
 * Input sanitization and prompt injection defense utilities
 */

/**
 * Strips ASCII control characters except newline and tab
 */
export function stripControlCharacters(input: string): string {
  if (typeof input !== 'string') return '';
  // Removes ASCII 0-8, 11-12, 14-31, 127
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Truncates string to a maximum allowed length
 */
export function truncateLength(input: string, maxLength: number): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).trim();
}

/**
 * Sanitizes generic user text input
 */
export function sanitizeText(input: string, maxLength = 500): string {
  const cleaned = stripControlCharacters(input);
  return truncateLength(cleaned, maxLength);
}

/**
 * Wraps user input into security delimiters for LLM prompts,
 * escaping any accidental delimiter tags to prevent prompt injection escapes.
 */
export function delimitUserInput(content: Record<string, unknown> | string): string {
  const rawString = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  // Neutralize closing delimiter attempts
  const safeContent = rawString.replace(/<\/user_input>/gi, '&lt;/user_input&gt;');
  return `<user_input>\n${safeContent}\n</user_input>`;
}
