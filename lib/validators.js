import { z } from "zod";

export const projectSchema = z.object({
    name: z.string()
        .min(1, "Project name is required")
        .max(100, "Project name must be 100 characters or less"),
    key: z.string()
        .min(2, "Project key must be at least 2 characters")
        .max(10, "Project key must be 10 characters or less")
        .toUpperCase(),
    description: z.string()
        .max(500, "Description must be 500 characters or less")
        .optional(),
});

export const sprintSchema = z.object({
    name: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
});

export const issueSchema = z.object({
    title: z.string().min(1, "Issue title is required").max(100, "Issue title must be 100 characters or less"),
    assigneeId: z.string().cuid("Please select an assignee"),
    description: z.string().max(500, "Description must be 500 characters or less").optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export const postSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    content: z.string().min(1, "Content is required").max(5000),

    image: z
        .string()
        .url("Image must be a valid URL")
        .or(z.literal("")) // ✅ allow empty string
        .optional(),

    link: z
        .string()
        .url("Link must be a valid URL")
        .or(z.literal("")) // ✅ allow empty string
        .optional(),

    projectId: z.string().cuid().optional(), // ✅ Optional
});