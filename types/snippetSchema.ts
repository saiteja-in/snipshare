import { z } from "zod";

export const snippetSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  code: z.string().min(1).max(10000),
  language: z.enum([
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
  ]),
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
      z.literal("None"),
      z.null(),
    ])
    .transform((val) => (val === null || val === "None" ? "" : val))
    .optional(),
  category: z.enum([
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
  ]),
  tags: z.array(z.string()).min(1).max(5),
});

export type AISnippet = z.infer<typeof snippetSchema>;
