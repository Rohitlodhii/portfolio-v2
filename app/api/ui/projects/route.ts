import { getProjects, writeProjects } from "@/config/data/files";
import { projectInputSchema, projectSchema } from "@/config/data/files.schema";
import { NextRequest } from "next/server";
import z from "zod";

const errorResponse = (error: string, status: number) =>
  Response.json({ error }, { status });

export async function GET() {
  try {
    return Response.json(await getProjects());
  } catch {
    return errorResponse("Failed to load projects", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = projectInputSchema.parse(await request.json());
    const projects = await getProjects();
    const id = projects.reduce((max, project) => Math.max(max, project.id), 0) + 1;
    const project = { id, ...input };

    await writeProjects([...projects, project]);
    return Response.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return errorResponse("Invalid project data", 400);
    }
    return errorResponse("Failed to create project", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = z.coerce.number().int().positive().parse(body.id);
    const projects = await getProjects();
    const index = projects.findIndex((project) => project.id === id);

    if (index === -1) return errorResponse("Project not found", 404);

    const updates = projectInputSchema.partial().parse(body);
    const updated = projectSchema.parse({ ...projects[index], ...updates, id });
    projects[index] = updated;

    await writeProjects(projects);
    return Response.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return errorResponse("Invalid project data", 400);
    }
    return errorResponse("Failed to update project", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = z.coerce.number().int().positive().parse(
      new URL(request.url).searchParams.get("id")
    );
    const projects = await getProjects();

    if (!projects.some((project) => project.id === id)) {
      return errorResponse("Project not found", 404);
    }

    await writeProjects(projects.filter((project) => project.id !== id));
    return Response.json({ deleted: id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("A valid project id is required", 400);
    }
    return errorResponse("Failed to delete project", 500);
  }
}
