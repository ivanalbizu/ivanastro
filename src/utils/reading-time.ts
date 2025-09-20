export function calculateReadingTime(text: string): string {
  const wordsPerMinute = 120;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  if (minutes < 1) return 'Menos de 1 minuto de lectura';
  if (minutes === 1) return '1 minuto de lectura';
  return `${minutes} minutos de lectura`;
}

export function extractTextFromMarkdown(content: string): string {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, '');
  
  // Remove code blocks
  const withoutCode = withoutFrontmatter.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  const withoutInlineCode = withoutCode.replace(/`[^`]*`/g, '');
  
  // Remove markdown syntax
  const plainText = withoutInlineCode
    .replace(/#{1,6}\s/g, '') // headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_~]/g, '') // emphasis
    .replace(/>\s/g, '') // blockquotes
    .replace(/\|/g, ' '); // tables
  
  return plainText;
}
