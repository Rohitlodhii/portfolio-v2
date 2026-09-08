import "server-only";

import fs from "fs/promises";
import matter from "gray-matter";
import path from "path";
import z from "zod";

export const mdxRoot = path.join(process.cwd(), "config", "data", "mdx");

export const mdxNameSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.mdx$/, "Name must be a valid .mdx filename");

export const mdxFolderSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, "Folder must be a single safe folder name");

export const mdxFrontmatterSchema = z.object({
  title: z.string().min(1),
  lastupdated: z.preprocess((value) => value instanceof Date ? value.toISOString().slice(0, 10) : value, z.string().min(1)),
  link: z.string().min(1),
  videolink: z.preprocess(
    (v) => (v == null ? "" : typeof v === "string" ? v.trim() : String(v).trim()),
    z.string().optional().default(""),
  ),
  smalldesc: z.string().min(1),
});

export const mdxInputSchema = z.object({
  folder: mdxFolderSchema,
  name: mdxNameSchema,
  frontmatter: mdxFrontmatterSchema,
  content: z.string(),
});

export type MdxInput = z.infer<typeof mdxInputSchema>;
export type MdxFrontmatter = z.infer<typeof mdxFrontmatterSchema>;

function filePath(folder: string, name: string) {
  const target = path.resolve(mdxRoot, folder, name);
  const folderRoot = path.resolve(mdxRoot, folder) + path.sep;

  if (!target.startsWith(folderRoot) || path.basename(target) !== name) {
    throw new Error("Invalid MDX path");
  }

  return target;
}

async function findMdxFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? findMdxFiles(entryPath) : entry.name.endsWith(".mdx") ? [entryPath] : [];
    }),
  );

  return files.flat();
}

/**
 * Reads one file, or `null` when its frontmatter is incomplete.
 *
 * Deliberately doesn't throw: `listMdxFiles` parses the whole directory, and
 * every page that resolves a single project goes through it, so a half-written
 * draft would otherwise 500 all of them rather than just its own route.
 */
function parseMdx(source: string) {
  const parsed = matter(source);
  const frontmatter = mdxFrontmatterSchema.safeParse(parsed.data);

  if (!frontmatter.success) return null;

  return {
    frontmatter: frontmatter.data,
    content: parsed.content.trim(),
  };
}

function serializeMdx(input: MdxInput) {
  return matter.stringify(input.content, input.frontmatter);
}

/**
 * Every `.mdx` on disk, whether or not its frontmatter parses.
 *
 * "Does this name already exist" is a question about the filesystem, so it has
 * to be asked here rather than of `listMdxFiles`, which drops unparseable
 * drafts — otherwise creating a file could silently overwrite one.
 */
async function listMdxPaths() {
  await fs.mkdir(mdxRoot, { recursive: true });
  const files = await findMdxFiles(mdxRoot);

  return files.map((file) => ({
    file,
    folder: path.relative(mdxRoot, path.dirname(file)).replaceAll(path.sep, "/"),
    name: path.basename(file),
  }));
}

export async function listMdxFiles() {
  const entries = await listMdxPaths();

  const parsed = await Promise.all(
    entries.map(async ({ file, folder, name }) => {
      const mdx = parseMdx(await fs.readFile(file, "utf8"));

      if (!mdx) {
        // Loud enough to notice while writing, quiet enough not to break the page.
        console.warn(`[mdx] skipped ${path.relative(mdxRoot, file)}: frontmatter is missing or incomplete`);
        return null;
      }

      return { folder, name, ...mdx };
    }),
  );

  return parsed.filter((entry) => entry !== null);
}

export async function createMdx(input: MdxInput) {
  const target = filePath(input.folder, input.name);
  const files = await listMdxPaths();

  if (files.some((file) => file.name === input.name)) {
    throw new Error("An MDX file with this name already exists");
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, serializeMdx(input), "utf8");
  return input;
}

export async function updateMdx(currentFolder: string, currentName: string, input: MdxInput) {
  const currentPath = filePath(currentFolder, currentName);
  const target = filePath(input.folder, input.name);
  const files = await listMdxPaths();

  if (!files.some((file) => file.folder === currentFolder && file.name === currentName)) {
    throw new Error("MDX file not found");
  }

  if ((currentFolder !== input.folder || currentName !== input.name) && files.some((file) => file.name === input.name)) {
    throw new Error("An MDX file with this name already exists");
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, serializeMdx(input), "utf8");
  if (currentPath !== target) await fs.unlink(currentPath);
  return input;
}

export async function deleteMdx(folder: string, name: string) {
  const target = filePath(folder, name);
  await fs.unlink(target);
}

export async function getMdxByName(name: string) {
  const files = await listMdxFiles();
  return files.find((file) => file.name === name);
}
