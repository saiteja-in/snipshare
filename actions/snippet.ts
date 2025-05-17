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