// lib/ai-parser.ts
import { z } from "zod";

// Define the schema for snippet validation
export const snippetSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description too long"),
  code: z.string().min(1, "Code is required").max(10000, "Code too long"),
  language: z.enum(
    [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "C++",
      "Ruby",
      "Go",
      "Rust",
      "PHP",
      "Swift",
    ],
    {
      errorMap: () => ({ message: "Invalid language selected" }),
    }
  ),
  framework: z
    .union([
      z.enum([
        "React",
        "Vue",
        "Angular",
        "Next.js",
        "Nuxt",
        "Svelte",
        "Express",
        "Django",
        "Spring",
        "Laravel",
      ]),
      z.literal(""),
      z.literal("None"), // Added 'None' to explicitly handle cases where AI might output it
      z.null(),
    ])
    .transform((val) => (val === null || val === "None" ? "" : val)) // Transform null or "None" to ""
    .optional(),
  category: z.enum(
    [
      "Utility Functions",
      "Components",
      "Hooks",
      "Algorithms",
      "Data Structures",
      "API",
      "Database",
      "Authentication",
      "Testing",
      "DevOps",
    ],
    {
      errorMap: () => ({ message: "Invalid category selected" }),
    }
  ),
  tags: z.array(z.string()).min(1).max(5),
});

export type AISnippet = z.infer<typeof snippetSchema>;

// The AIResponseParser class can be removed or simplified if its primary
// role was parsing the raw AI response, which Langchain's parser now handles.
// If you have other parsing/validation needs for non-Langchain AI outputs,
// you might keep a slimmed-down version.
// For this example, we assume Langchain's parser is sufficient.