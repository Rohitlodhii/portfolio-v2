import fs from "fs/promises"
import path from "path"
import { descriptionSchema, descriptionType, projectsSchema, projectsType } from "./files.schema";
import z from "zod";


export const descriptionPath = path.join(
    process.cwd(),
    "config",
    "data",
    "json",
    "description.json"
);

export const projectsPath = path.join(
    process.cwd(),
    "config",
    "data",
    "json",
    "projects.json"
);


export async function getDescription() : Promise<descriptionType> {

    try {
        const file = await fs.readFile(descriptionPath , "utf-8");
        const rawJson = JSON.parse(file);

        return descriptionSchema.parse(rawJson);
    } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid JSON structure in description file:', error.flatten());
      throw new Error('Description file fails schema validation.');
    }
    if (error instanceof SyntaxError) {
      console.error('Malformed JSON syntax in description file');
      throw new Error('Description file contains invalid JSON.');
    }
    throw error;
    }
}

export async function writeDescription(data: descriptionType) {
  await fs.writeFile(descriptionPath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getProjects(): Promise<projectsType> {
  try {
    const file = await fs.readFile(projectsPath, "utf-8");
    return projectsSchema.parse(JSON.parse(file));
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid JSON structure in projects file:", error.flatten());
      throw new Error("Projects file fails schema validation.");
    }
    if (error instanceof SyntaxError) {
      console.error("Malformed JSON syntax in projects file");
      throw new Error("Projects file contains invalid JSON.");
    }
    throw error;
  }
}

export async function writeProjects(data: projectsType) {
  await fs.writeFile(projectsPath, JSON.stringify(projectsSchema.parse(data), null, 2), "utf-8");
}
