"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { CreateSnippetSchema } from "@/schemas/snippet";
import { revalidatePath } from "next/cache";
import { ExtendedUser } from "@/schemas";

// Create a new snippet
export async function createSnippet(
  values: z.infer<typeof CreateSnippetSchema>
) {
  try {
    // Validate the input data
    const validatedFields = CreateSnippetSchema.safeParse(values);
    if (!validatedFields.success) {
      return {
        error: "Invalid fields. Please check your input.",
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
      snippet,
    };
  } catch (error) {
    console.error("Error creating snippet:", error);
    return { error: "Failed to create snippet" };
  }
}

export async function hasUserLikedSnippet(snippetId: string) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user?.id) {
      return { hasLiked: false, error: "User not authenticated" };
    }

    // Check if like exists
    const like = await db.like.findUnique({
      where: {
        userId_snippetId: {
          userId: user.id,
          snippetId,
        },
      },
    });

    return { hasLiked: !!like, success: true };
  } catch (error) {
    console.error("Error checking if user liked snippet:", error);
    return { hasLiked: false, error: "Failed to check like status" };
  }
}

// Toggle like on a snippet
export async function toggleLikeSnippet(snippetId: string) {
  try {
    if (!snippetId) {
      return { error: "Snippet ID is required." };
    }

    // Get the current user
    const user = await currentUser();
    if (!user?.id) {
      return { error: "Unauthorized. Please sign in." };
    }

    // Check if the snippet exists
    const snippet = await db.snippet.findUnique({
      where: { id: snippetId },
      select: { id: true },
    });

    if (!snippet) {
      return { error: "Snippet not found." };
    }

    // Check if the user has already liked this snippet
    const existingLike = await db.like.findUnique({
      where: {
        userId_snippetId: {
          userId: user.id,
          snippetId,
        },
      },
    });

    let action: "liked" | "unliked";

    if (existingLike) {
      // If like exists, remove it (unlike)
      await db.like.delete({
        where: {
          userId_snippetId: {
            userId: user.id,
            snippetId,
          },
        },
      });
      action = "unliked";
    } else {
      // If like doesn't exist, create it (like)
      await db.like.create({
        data: {
          userId: user.id,
          snippetId,
        },
      });
      action = "liked";
    }

    // Revalidate paths to update like counts
    revalidatePath(`/snippets/${snippetId}`);
    revalidatePath(`/dashboard`);
    revalidatePath(`/${user.slug}`);
    revalidatePath("/explore");

    return {
      success: true,
      action,
    };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { error: "Failed to toggle like" };
  }
}

// Get like count for a snippet
export async function getSnippetLikesCount(snippetId: string) {
  try {
    if (!snippetId) {
      return { error: "Snippet ID is required", count: 0 };
    }

    const count = await db.like.count({
      where: {
        snippetId,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error getting like count:", error);
    return { error: "Failed to get like count", count: 0 };
  }
}
// Get a snippet by id with author info
export async function getSnippetById(id: string) {
  try {
    if (!id) {
      return { error: "Snippet ID is required" };
    }

    const user = (await currentUser()) as ExtendedUser | undefined;

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

    // Check if user is authorized to view this snippet
    // If snippet is private, only the author can view it
    if (!snippet.isPublic && (!user || snippet.authorId !== user.id)) {
      return {
        error: "You do not have permission to view this snippet",
        snippet: null,
      };
    }

    // Check if the current user has liked this snippet (only if user is authenticated)
    let userHasLiked = false;
    if (user?.id) {
      const userLike = await db.like.findUnique({
        where: {
          userId_snippetId: {
            userId: user.id,
            snippetId: id,
          },
        },
      });
      userHasLiked = !!userLike;
    }

    // Ensure we return the snippet with all necessary properties including userHasLiked
    return {
      success: true,
      snippet: {
        ...snippet,
        authorId: snippet.authorId, // Ensure authorId is included
        userHasLiked, // Add boolean indicating if user has liked (false if not authenticated)
      },
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
        createdAt: "desc",
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
        createdAt: "desc",
      },
    });

    const snippets = likes.map((like) => like.snippet);
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
export async function updateSnippet(
  values: z.infer<typeof UpdateSnippetSchema>
) {
  try {
    // Validate the input data
    const validatedFields = UpdateSnippetSchema.safeParse(values);
    if (!validatedFields.success) {
      return {
        error: "Invalid fields. Please check your input.",
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
      select: { authorId: true },
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
      snippet: updatedSnippet,
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
      select: { authorId: true },
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
      success: true,
    };
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return { error: "Failed to delete snippet" };
  }
}

// Get all public snippets with filters
export async function getPublicSnippets(filters?: {
  language?: string;
  framework?: string;
  category?: string;
  search?: string;
}) {
  try {
    const where: any = {
      isPublic: true,
    };

    // Apply filters
    if (filters?.language && filters.language !== "all") {
      where.language = filters.language;
    }

    if (filters?.framework && filters.framework !== "all") {
      where.framework = filters.framework;
    }

    if (filters?.category && filters.category !== "all") {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { tags: { has: filters.search } },
      ];
    }

    const snippets = await db.snippet.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, snippets };
  } catch (error) {
    console.error("Error fetching public snippets:", error);
    return { error: "Failed to fetch snippets", snippets: [] };
  }
}

// Get unique values for filters
export async function getFilterOptions() {
  try {
    const [languages, frameworks, categories] = await Promise.all([
      db.snippet.findMany({
        where: { isPublic: true },
        select: { language: true },
        distinct: ["language"],
      }),
      db.snippet.findMany({
        where: {
          isPublic: true,
          framework: { not: null },
        },
        select: { framework: true },
        distinct: ["framework"],
      }),
      db.snippet.findMany({
        where: { isPublic: true },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    return {
      success: true,
      options: {
        languages: languages
          .map((s) => s.language)
          .filter((lang): lang is string => Boolean(lang)),
        frameworks: frameworks
          .map((s) => s.framework)
          .filter((fw): fw is string => Boolean(fw)),
        categories: categories
          .map((s) => s.category)
          .filter((cat): cat is string => Boolean(cat)),
      },
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return {
      error: "Failed to fetch filter options",
      options: { languages: [], frameworks: [], categories: [] },
    };
  }
}

// Get popular snippets based on likes
export async function getPopularSnippets(limit: number = 5) {
  try {
    const snippets = await db.snippet.findMany({
      where: {
        isPublic: true,
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
            likes: true,
          },
        },
      },
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return { success: true, snippets };
  } catch (error) {
    console.error("Error fetching popular snippets:", error);
    return { error: "Failed to fetch popular snippets", snippets: [] };
  }
}

// Fetch a snippet by ID
