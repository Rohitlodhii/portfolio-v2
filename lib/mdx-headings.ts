export type MdxHeading = {
  id: string;
  text: string;
  level: 1 | 2 | 3;
  children: MdxHeading[];
};

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getMdxHeadings(source: string): MdxHeading[] {
  const root: MdxHeading = { id: "", text: "", level: 1, children: [] };
  const stack: MdxHeading[] = [root];
  let inCodeBlock = false;

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 1 | 2 | 3;
    const text = match[2].replace(/[`*_~]/g, "").trim();
    const heading: MdxHeading = {
      id: slugifyHeading(text),
      text,
      level,
      children: [],
    };

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(heading);
    stack.push(heading);
  }

  return root.children;
}
