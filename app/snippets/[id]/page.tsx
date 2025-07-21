import React from "react";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getSnippetById, getPopularSnippets } from "@/actions/snippet";
import SnippetClient from "./snippet-client";

const SnippetPage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();

  const [result, popularResult] = await Promise.all([
    getSnippetById(params.id),
    getPopularSnippets(15), // Get 15 popular snippets for the sidebar to ensure scrolling
  ]);

  console.log("snipp", result);

  if (!result || !result.snippet) return notFound();

  return (
    <div className="container py-6">
      <SnippetClient
        snippet={result.snippet}
        userHasLiked={result.snippet.userHasLiked || false}
        popularSnippets={popularResult.snippets || []}
        isAuthenticated={!!user}
      />
    </div>
  );
};

export default SnippetPage;
