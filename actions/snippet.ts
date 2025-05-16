"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { CreateSnippetSchema } from "@/schemas/snippet";
import { revalidatePath } from "next/cache";

// Create a new snippet
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

// Get a snippet by id with author info
export async function getSnippetById(id: string) {
  try {
    if (!id) return null;
    const snippet = await db.snippet.findUnique({
      where: { id },
      include: { author: true },
    });
    return snippet;
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return null;
  }
}