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
