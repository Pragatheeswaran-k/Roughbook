export const generateTitle = (input: string): string => {
    const lines = input.trim().split("\n");
    for (const line of lines) {
      if (/function\s+(\w+)/.test(line)) return `${RegExp.$1} function`;
      if (/class\s+(\w+)/.test(line)) return `${RegExp.$1} class`;
      if (/const\s+(\w+)/.test(line)) return `${RegExp.$1}`;
      if (/let\s+(\w+)/.test(line)) return `Variable: ${RegExp.$1}`;
      if (/import\s+/.test(line)) return `Module Imports`;
      if (/<[^>]+>/.test(line)) return `React JSX Component`;
      if (/print\((.*?)\)/.test(line)) return `Print: ${RegExp.$1}`;
    }
    return `Untitled Snippet`;
  };