import React from "react";
import { redirect, notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getSnippetById } from "@/actions/snippet";
import SnippetClient from "./snippet-client";

const SnippetPage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) {
    redirect("/auth/login?callbackUrl=/snippets");
  }

  const snippet = await getSnippetById(params.id);

  if (!snippet) return notFound();

  return (
    <div className="container py-6">
      <SnippetClient snippet={snippet} />
    </div>
  );
};

export default SnippetPage;