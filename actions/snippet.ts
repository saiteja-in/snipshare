"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { CreateSnippetSchema } from "@/schemas/snippet";
import { revalidatePath } from "next/cache";

export async function createSnippet(values: z.infer<typeof CreateSnippetSchema>) {
  try {
    // Validate the input data
    const validatedFields = CreateSnippetSchema.safeParse(values);
    if (!validatedFields.success) {
      return { 
        error: "Invalid fields. Please check your input." 
      };
    }

    // Get the current user
    const user = await currentUser();
    if (!user?.id) {
      return { error: "Unauthorized. Please sign in." };
    }

    // Create the snippet in the database
    const snippet = await db.snippet.create({
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        code: validatedFields.data.code,
        language: validatedFields.data.language,
        framework: validatedFields.data.framework || null,
        category: validatedFields.data.category,
        tags: validatedFields.data.tags,
        isPublic: validatedFields.data.isPublic,
        authorId: user.id,
      },
    });

    // Revalidate the appropriate paths
    revalidatePath("/snippets");
    
    return { 
      success: true, 
      snippet
    };
  } catch (error) {
    console.error("Error creating snippet:", error);
    return { error: "Failed to create snippet" };
  }
}