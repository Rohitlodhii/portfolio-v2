import { createMdx, deleteMdx, listMdxFiles, mdxInputSchema, mdxNameSchema, mdxFolderSchema, updateMdx } from "@/lib/mdx";
import { NextRequest } from "next/server";
import z from "zod";

const errorResponse = (error: string, status: number) => Response.json({ error }, { status });

export async function GET() {
  try {
    return Response.json(await listMdxFiles());
  } catch {
    return errorResponse("Failed to load MDX files", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = mdxInputSchema.parse(await request.json());
    return Response.json(await createMdx(input), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("Invalid MDX data", 400);
    if (error instanceof Error && error.message.includes("already exists")) return errorResponse(error.message, 409);
    return errorResponse("Failed to create MDX file", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const currentFolder = mdxFolderSchema.parse(body.currentFolder);
    const currentName = mdxNameSchema.parse(body.currentName);
    const input = mdxInputSchema.parse(body);
    return Response.json(await updateMdx(currentFolder, currentName, input));
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("Invalid MDX data", 400);
    if (error instanceof Error && error.message === "MDX file not found") return errorResponse(error.message, 404);
    if (error instanceof Error && error.message.includes("already exists")) return errorResponse(error.message, 409);
    return errorResponse("Failed to update MDX file", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const folder = mdxFolderSchema.parse(url.searchParams.get("folder"));
    const name = mdxNameSchema.parse(url.searchParams.get("name"));
    await deleteMdx(folder, name);
    return Response.json({ deleted: { folder, name } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("A valid MDX folder and name are required", 400);
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return errorResponse("MDX file not found", 404);
    }
    return errorResponse("Failed to delete MDX file", 500);
  }
}
