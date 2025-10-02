export function calculReadTime(htmlString: string): number {
  const wordsPerMinute = 200;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  const text = tempDiv.textContent || tempDiv.innerText || '';

  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const minutes = words / wordsPerMinute;

  return Math.ceil(minutes);
}
