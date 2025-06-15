// app/api/generate-snippet/route.ts

import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// Zod schema for snippet (keep in sync with frontend!)
const aiSnippetSchema = z.object({
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

export type AISnippet = z.infer<typeof aiSnippetSchema>;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt provided." },
        { status: 400 }
      );
    }

    // Set up the Gemini model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash", // or "gemini-2.0-flash"
      apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
    });

    // Escape curly braces in the format instructions
    const parser = StructuredOutputParser.fromZodSchema(aiSnippetSchema);

    // Get format instructions and escape any single curly braces
    let formatInstructions = parser.getFormatInstructions();

    // Create prompt template with escaped instructions
    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a code snippet generator. Generate a code snippet based on the user's request.

The output should be formatted as a JSON object with the following keys:
- title: A concise title for the snippet (string)
- description: A detailed explanation of what the code does (string)
- code: The actual code snippet (string)
- language: One of [JavaScript, TypeScript, Python, Java, C++, Ruby, Go, Rust, PHP, Swift]
- framework: One of [React, Vue, Angular, Next.js, Nuxt, Svelte, Express, Django, Spring, Laravel] or empty string if none
- category: One of [Utility Functions, Components, Hooks, Algorithms, Data Structures, API, Database, Authentication, Testing, DevOps]
- tags: Array of up to 5 relevant tags (array of strings)

Rules:
1. Include error handling where appropriate in the code.
2. Language must match one from the list exactly (case-sensitive).
3. Framework should only be included if actually used.
4. Maximum 5 relevant tags.
5. Code should include comments and proper formatting.
6. Category must be exactly one of the specified values (case-sensitive).`,
      ],
      ["human", "{prompt}"],
    ]);

    // LangChain chain: prompt -> model -> parser
    const chain = promptTemplate.pipe(model).pipe(parser);

    // result is strongly typed, validated by Zod
    const result = await chain.invoke({ prompt });
    console.log("result here", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating snippet:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to generate snippet: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate snippet. Please try again." },
      { status: 500 }
    );
  }
}
