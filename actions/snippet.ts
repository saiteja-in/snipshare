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
        ...validatedFields.data,
        authorId: user.id,
      },
    });

    // Revalidate the appropriate paths based on visibility
    revalidatePath("/snippets");
    if (validatedFields.data.isPublic) {
      revalidatePath("/explore");
    }
    
    return { 
      success: true, 
      snippet
    };
  } catch (error) {
    console.error("Error creating snippet:", error);
    return { error: "Failed to create snippet" };
  }
}

export async function updateSnippetVisibility(snippetId: string, isPublic: boolean) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user?.id) {
      return { error: "Unauthorized. Please sign in." };
    }
    
    // Get the snippet
    const snippet = await db.snippet.findUnique({
      where: { 
        id: snippetId,
      },
    });
    
    // Check if snippet exists and user is the owner
    if (!snippet) {
      return { error: "Snippet not found" };
    }
    
    if (snippet.authorId !== user.id) {
      return { error: "You don't have permission to update this snippet" };
    }
    
    // Update the snippet visibility
    const updatedSnippet = await db.snippet.update({
      where: { id: snippetId },
      data: { isPublic },
    });
    
    // Revalidate the appropriate paths
    revalidatePath("/snippets");
    revalidatePath(`/snippets/${snippetId}`);
    revalidatePath("/explore");
    
    return {
      success: true,
      snippet: updatedSnippet,
    };
  } catch (error) {
    console.error("Error updating snippet visibility:", error);
    return { error: "Failed to update snippet visibility" };
  }
}