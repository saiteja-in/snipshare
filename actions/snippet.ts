"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { CreateSnippetSchema } from "@/schemas/snippet";
import { revalidatePath } from "next/cache";
import { ExtendedUser } from "@/schemas";

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
    if (!id) {
      return { error: "Snippet ID is required" };
    }

    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized. Please sign in." };
    }

    const snippet = await db.snippet.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!snippet) {
      return { error: "Snippet not found", snippet: null };
    }

    // Add a debug log to see what's happening
    console.log("Fetched snippet:", {
      id: snippet.id,
      authorId: snippet.authorId,
      currentUserId: user.id,
      isAuthorized: snippet.authorId === user.id || snippet.isPublic
    });

    // Check if user is authorized to view this snippet
    // Users can only view private snippets if they are the author
    if (!snippet.isPublic && snippet.authorId !== user.id) {
      return { error: "You do not have permission to view this snippet", snippet: null };
    }

    // Ensure we return the snippet with all necessary properties
    return { 
      success: true, 
      snippet: {
        ...snippet,
        authorId: snippet.authorId, // Ensure authorId is included
      } 
    };
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return { error: "Failed to fetch snippet", snippet: null };
  }
}


export async function getUserBySlug(slug: string) {
  try {
    if (!slug) {
      return { error: "Slug is required" };
    }

    // Find the user by slug
    const user = await db.user.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        image: true,
        role: true,
        _count: {
          select: {
            snippets: true,
            snippetLikes: true,
            bookmarks: true,
          },
        },
        // Don't fetch all snippets/likes here to avoid large initial payload
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: "Failed to fetch user data" };
  }
}

export async function getUserSnippets(userId: string) {
  try {
    const snippets = await db.snippet.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            bookmarks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, snippets };
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return { error: "Failed to fetch snippets" };
  }
}

export async function getUserLikedSnippets(userId: string) {
  try {
    const likes = await db.like.findMany({
      where: {
        userId: userId,
      },
      select: {
        snippet: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
                slug: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
                bookmarks: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const snippets = likes.map(like => like.snippet);
    return { success: true, snippets };
  } catch (error) {
    console.error("Error fetching liked snippets:", error);
    return { error: "Failed to fetch liked snippets" };
  }
}

const UpdateSnippetSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  framework: z.string().nullable().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  isPublic: z.boolean(),
});

// Update a snippet
export async function updateSnippet(values: z.infer<typeof UpdateSnippetSchema>) {
  try {
    // Validate the input data
    const validatedFields = UpdateSnippetSchema.safeParse(values);
    if (!validatedFields.success) {
      return { 
        error: "Invalid fields. Please check your input." 
      };
    }

    // Get the current user
     const user = (await currentUser()) as ExtendedUser | undefined;
    if (!user?.id) {
      return { error: "Unauthorized. Please sign in." };
    }

    // Find the snippet to check if the user is the author
    const snippet = await db.snippet.findUnique({
      where: { id: validatedFields.data.id },
      select: { authorId: true }
    });

    if (!snippet) {
      return { error: "Snippet not found." };
    }

    // Check if the current user is the author of the snippet
    if (snippet.authorId !== user.id) {
      return { error: "You don't have permission to update this snippet." };
    }

    // Update the snippet
    const updatedSnippet = await db.snippet.update({
      where: { id: validatedFields.data.id },
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        code: validatedFields.data.code,
        language: validatedFields.data.language,
        framework: validatedFields.data.framework || null,
        category: validatedFields.data.category,
        tags: validatedFields.data.tags,
        isPublic: validatedFields.data.isPublic,
      },
    });

    // Revalidate the appropriate paths
    revalidatePath("/dashboard");
    revalidatePath(`/snippets/${updatedSnippet.id}`);
    revalidatePath(`/${user.slug}`);
    
    return { 
      success: true, 
      snippet: updatedSnippet
    };
  } catch (error) {
    console.error("Error updating snippet:", error);
    return { error: "Failed to update snippet" };
  }
}

// Delete a snippet
export async function deleteSnippet(id: string) {
  try {
    if (!id) {
      return { error: "Snippet ID is required." };
    }

    // Get the current user
     const user = (await currentUser()) as ExtendedUser | undefined;
    if (!user?.id) {
      return { error: "Unauthorized. Please sign in." };
    }

    // Find the snippet to check if the user is the author
    const snippet = await db.snippet.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!snippet) {
      return { error: "Snippet not found." };
    }

    // Check if the current user is the author of the snippet
    if (snippet.authorId !== user.id) {
      return { error: "You don't have permission to delete this snippet." };
    }

    // Delete the snippet
    await db.snippet.delete({
      where: { id },
    });

    // Revalidate the appropriate paths
    revalidatePath("/dashboard");
    revalidatePath(`/${user.slug}`);
    
    return { 
      success: true 
    };
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return { error: "Failed to delete snippet" };
  }
}



// Fetch a snippet by ID
