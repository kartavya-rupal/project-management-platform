"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const aiIssueDraftSchema = z.object({
    title: z
        .string()
        .min(1)
        .max(100),

    description: z
        .string()
        .max(500),

    priority: z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
    ]),
});


export async function generateIssueDraft({
    projectId,
    sprintId,
    status,
    title,
    description,
}) {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GROQ_API_KEY is not configured on the server."
        );
    }

    if (!title || !title.trim()) {
        throw new Error(
            "Enter an issue title before using AI."
        );
    }

    /*
        Verify that the project belongs to the currently
        authenticated organization.
    */
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            id: true,
            name: true,
            key: true,
            description: true,
            organizationId: true,
        },
    });

    if (!project) {
        throw new Error("Project not found.");
    }

    if (project.organizationId !== orgId) {
        throw new Error("Unauthorized");
    }

    /*
        Verify that the sprint belongs to this project.
        This prevents a client from passing an unrelated
        sprint ID to the AI endpoint.
    */
    let sprint = null;

    if (sprintId) {
        sprint = await prisma.sprint.findUnique({
            where: {
                id: sprintId,
            },
            select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
                projectId: true,
            },
        });

        if (!sprint) {
            throw new Error("Sprint not found.");
        }

        if (sprint.projectId !== projectId) {
            throw new Error(
                "Sprint does not belong to this project."
            );
        }
    }

    /*
        Get a small amount of existing sprint context so the
        AI can understand the kind of work already being done.
        We only send titles, not complete issue records.
    */
    let existingIssues = [];

    if (sprintId) {
        existingIssues = await prisma.issue.findMany({
            where: {
                sprintId,
            },
            select: {
                title: true,
                status: true,
                priority: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
            take: 15,
        });
    }

    const projectContext = {
        projectName: project.name,
        projectKey: project.key,
        projectDescription:
            project.description || "",
    };

    const sprintContext = sprint
        ? {
            name: sprint.name,
            status: sprint.status,
            startDate:
                sprint.startDate.toISOString(),
            endDate:
                sprint.endDate.toISOString(),
        }
        : null;

    const userInput = {
        roughTitle: title.trim(),
        currentDescription:
            description?.trim() || "",
        targetStatus: status || "TODO",
    };

    /*
        Existing issue titles are supplied only as contextual
        information. The AI must not blindly copy them.
    */
    const existingIssueContext =
        existingIssues.map((issue) => ({
            title: issue.title,
            status: issue.status,
            priority: issue.priority,
        }));


    const systemPrompt = `
You are Workly's AI Issue Draft Assistant.

Your job is to improve a user's rough software issue into a
clear editable draft.

You ONLY generate a draft suggestion.

You do NOT create the issue.
You do NOT assign anyone.
You do NOT modify the database.
You do NOT perform any action in Workly.

The user will review and edit your result before the issue
is actually created.

IMPORTANT RULES:

1. Use only the information provided by the user and the
   supplied Workly project/sprint context.

2. Do not invent implementation details, technologies,
   requirements, business rules, users, deadlines, bugs,
   acceptance criteria, or dependencies that are not supported
   by the input.

3. The rough title may be incomplete. Improve its wording,
   clarity, and specificity without changing the user's
   intended meaning.

4. Write a concise but useful issue description.

5. The description must be 500 characters or fewer.

6. Suggest a priority from exactly:
   LOW, MEDIUM, HIGH, URGENT.

7. Priority is only a suggestion. The user can change it
   before creating the issue.

8. Infer priority from the apparent impact and urgency of
   the task when the input provides enough evidence.

9. Use these guidelines:

   LOW:
   Minor UI polish, cosmetic improvements, low-impact cleanup,
   documentation, or non-critical enhancements.

   MEDIUM:
   Normal feature work, routine bugs, refactoring, or tasks
   whose impact and urgency appear ordinary.

   HIGH:
   Important bugs, broken functionality affecting users,
   significant feature work, or issues that could materially
   affect normal application usage.

   URGENT:
   Critical failures, security issues, severe production
   breakage, data-loss risks, or problems that clearly require
   immediate attention.

10. Do not assume HIGH or URGENT without evidence. However,
    do not default to MEDIUM merely because the title is short.
    Use the meaning of the supplied title and description to
    make the best-supported classification.

11. If the information genuinely does not distinguish priority,
    use MEDIUM.

12. Do not assign an assignee. Assignee selection is always
    handled manually by the user.

13. Existing issue titles are provided only for context.
    Do not copy an existing issue unless the user's input
    clearly refers to the same task.

14. The issue description should explain the task in a way
    useful to a software-development team.

15. Do not mention that you are an AI.

16. Return ONLY a JSON object.

17. Do not wrap the JSON in markdown.

18. The JSON must have exactly these fields:

{
  "title": "string",
  "description": "string",
  "priority": "LOW | MEDIUM | HIGH | URGENT"
}

The title must be 100 characters or fewer.
The description must be 500 characters or fewer.
`;


    const userPrompt = `
PROJECT CONTEXT

${JSON.stringify(
        projectContext,
        null,
        2
    )}

SPRINT CONTEXT

${JSON.stringify(
        sprintContext,
        null,
        2
    )}

CURRENT ISSUE INPUT

${JSON.stringify(
        userInput,
        null,
        2
    )}

RECENT EXISTING ISSUES IN THIS SPRINT

${JSON.stringify(
        existingIssueContext,
        null,
        2
    )}

Improve the current issue input into an editable draft.

Remember:
- Preserve the user's intended task.
- Do not invent facts.
- Do not assign an assignee.
- Return only JSON.
`;


    const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },

            body: JSON.stringify({
                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],

                response_format: {
                    type: "json_object",
                },

                reasoning_effort: "low",

                temperature: 0.2,

                max_completion_tokens: 700,
            }),
        }
    );


    const responseData =
        await response.json();


    if (!response.ok) {
        console.error(
            "Groq issue-draft error:",
            responseData
        );

        throw new Error(
            responseData?.error?.message ||
            "Groq API request failed."
        );
    }


    const content =
        responseData?.choices?.[0]?.message?.content;


    if (!content) {
        throw new Error(
            "Groq returned an empty issue draft."
        );
    }


    let parsedDraft;

    try {
        parsedDraft = JSON.parse(content);
    } catch (error) {
        console.error(
            "Invalid JSON returned by Groq:",
            content
        );

        throw new Error(
            "Groq returned invalid JSON."
        );
    }


    const validatedDraft =
        aiIssueDraftSchema.safeParse(
            parsedDraft
        );


    if (!validatedDraft.success) {
        console.error(
            "Invalid AI issue draft:",
            validatedDraft.error.flatten()
        );

        throw new Error(
            "AI generated an invalid issue draft. Please try again."
        );
    }


    return validatedDraft.data;
}