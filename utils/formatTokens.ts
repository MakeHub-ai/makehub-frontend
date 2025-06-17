/**
 * Formats token counts into human-readable format
 * @param count - The number of tokens
 * @returns Formatted string (e.g., "1.2k", "1.5M")
 */
export function formatTokenCount(count: number | undefined | null): string {
  if (!count || count === 0) return '0';
  
  if (count < 1000) {
    return count.toString();
  }
  
  if (count < 1000000) {
    const thousands = count / 1000;
    return `${thousands.toFixed(1)}k`;
  }
  
  const millions = count / 1000000;
  return `${millions.toFixed(1)}M`;
}
