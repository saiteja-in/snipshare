import { NextRequest, NextResponse } from "next/server";
import { getPublicSnippets } from "@/actions/snippet";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      search: searchParams.get("search") || undefined,
      language: searchParams.get("language") || undefined,
      framework: searchParams.get("framework") || undefined,
      category: searchParams.get("category") || undefined,
    };

    const result = await getPublicSnippets(filters);
    
    if (result.success) {
      return NextResponse.json(result.snippets);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}