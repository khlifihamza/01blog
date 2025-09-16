export function getExcerpt(htmlString: string): string {
  let excerpt = '';
  const divRegex = /<div[^>]*>([\s\S]*?)<\/div>/g;
  let match;

  while ((match = divRegex.exec(htmlString)) !== null) {
    let inner = match[1];
    inner = inner.replace(/<mat-icon[^>]*>[\s\S]*?<\/mat-icon>/g, '');
    const text = inner.replace(/<[^>]+>/g, '').trim();

    if (text) {
      excerpt += text;
    }
  }
  console.log(excerpt)
  return excerpt;
}

export function addLinkTosrc(htmlString: string, fileNames: string[]): string {
  let index = 0;
  return htmlString.replace(/src=["']([^"']+)["']/g, (match) => {
    if (index < fileNames.length) {
      const newUrl = fileNames[index++];
      return `src="http://localhost:8080/api/post/file/${newUrl}"`;
    }
    return match;
  });
}
