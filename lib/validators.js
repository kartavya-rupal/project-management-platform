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