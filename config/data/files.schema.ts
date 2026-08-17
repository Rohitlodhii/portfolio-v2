import z from "zod";

export const descriptionSchema = z.object({
    location : z.string(),
    role : z.string(),
    coordinates : z.string()
});

export type descriptionType = z.infer<typeof descriptionSchema>;

export const projectSchema = z.object({
    id: z.number().int().positive(),
    title: z.string().min(1),
    date: z.string().min(1),
    logo: z.string().min(1),
    url: z.string().min(1),
    tooltip: z.string().min(1),
});

export const projectsSchema = z.array(projectSchema);
export const projectInputSchema = projectSchema.omit({ id: true });

export type projectType = z.infer<typeof projectSchema>;
export type projectInputType = z.infer<typeof projectInputSchema>;
export type projectsType = z.infer<typeof projectsSchema>;
