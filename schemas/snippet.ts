import * as z from "zod";

export const CreateSnippetSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(10000, "Code must be less than 10000 characters"),
  language: z.string().min(1, "Language is required"),
  framework: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(5, "Maximum 5 tags allowed"),
  isPublic: z.boolean().default(true),
});

export type SnippetFormData = z.infer<typeof CreateSnippetSchema>;