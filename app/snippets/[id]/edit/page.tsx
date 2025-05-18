import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ExtendedUser } from "@/schemas";
import { getSnippetById } from "@/actions/snippet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditSnippetForm } from "@/components/edit-snippet-form";

interface EditSnippetPageProps {
  params: {
    id: string;
  };
}

const EditSnippetPage = async ({ params }: EditSnippetPageProps) => {
  const user = (await currentUser()) as ExtendedUser | undefined;
  if (!user) {
    redirect(`/auth/login?callbackUrl=/snippets/${params.id}/edit`);
  }

  const result = await getSnippetById(params.id);

  // Check if there's an error or if the snippet doesn't exist
  if (result.error || !result.snippet) {
    console.error(
      "Failed to fetch snippet:",
      result.error || "Snippet not found"
    );
    redirect("/dashboard");
  }

  // Check if user is authorized to edit this snippet
  if (result.snippet.authorId !== user.id) {
    console.error("User not authorized to edit this snippet");
    redirect("/dashboard");
  }

  // At this point, we know result.snippet exists and the user is authorized
  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Snippet</CardTitle>
          <CardDescription>Update your code snippet details</CardDescription>
        </CardHeader>
        <CardContent>
          <EditSnippetForm user={user} snippet={result.snippet} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSnippetPage;
